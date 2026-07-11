"""FastAPI service exposing the three engines + the demo web UI.

Endpoints
    GET  /health           config + engine status
    POST /understand       P6 — query -> structured intent (optional ?boost)
    GET  /autocomplete     P9 — prefix -> ranked suggestions (real-time)
    GET  /autocomplete/hai P9 — force Hai's local trie + pattern engine
    POST /search           P7 — needs/attributes -> ranked POIs + reasons
    GET  /                 single-page demo UI
"""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from pydantic import ValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .. import config
from ..core.needs import predict_needs
from ..core.understand import understand
from ..data.loader import load_kb
from ..engines.semantic_search import _haversine
from . import schemas

app = FastAPI(title="Tasco Maps AI", version="0.1.0",
              description="Unified Vietnamese map-search intelligence (P6/P7/P9).")

_WEB_DIR = Path(__file__).resolve().parent.parent / "web"
_STATE: dict = {}

# shared static assets (stylesheet, etc.) for the demo pages
app.mount("/assets", StaticFiles(directory=str(_WEB_DIR)), name="assets")


def _state():
    """Lazily build KB + engines once (semantic index build takes a few seconds)."""
    if not _STATE:
        from ..engines.semantic_search import SemanticSearchEngine
        kb = load_kb()
        _STATE["kb"] = kb
        if config.AC_ENGINE == "trie":
            from ..engines.trie import TrieAutocomplete
            _STATE["ac"] = TrieAutocomplete(kb)
        else:
            from ..engines.autocomplete import AutocompleteEngine
            _STATE["ac"] = AutocompleteEngine(kb)
        _STATE["ss"] = SemanticSearchEngine(kb)
        from ..engines.corridor import CorridorEngine
        _STATE["corridor"] = CorridorEngine(kb, _STATE["ss"])
    return _STATE


@app.on_event("startup")
def _warmup():
    _state()


@app.get("/health")
def health():
    st = _state()
    return {
        "status": "ok",
        "config": config.config_summary(),
        "pois_total": len(st["kb"].pois),
        "pois_semantic": len(st["kb"].pois_t2),
        "embedder": st["ss"].index.embedder.kind,
    }


@app.post("/understand", response_model=schemas.UnderstandResponse)
def understand_endpoint(req: schemas.UnderstandRequest):
    kb = _state()["kb"]
    if req.boost:
        from ..llm import boost
        u = boost.boost_understanding(req.query, kb)
    else:
        u = understand(req.query, kb)
    # Return the typed model instead of a Response object so malformed internal
    # or LLM-derived output cannot bypass FastAPI's response validation.
    return schemas.UnderstandResponse.model_validate(u.to_dict())


@app.get("/autocomplete", response_model=schemas.AutocompleteResponse)
def autocomplete_endpoint(
        q: str = Query(
            ..., min_length=1, max_length=schemas.MAX_AUTOCOMPLETE_LENGTH,
            pattern=r"\S", description="typed prefix"),
        k: int = Query(6, ge=1, le=12),
        lat: float = Query(None, ge=-90, le=90),
        lng: float = Query(None, ge=-180, le=180),
        smart: bool = Query(False, description="LLM smart suggestions if available")):
    """P9. Prefers the teammate's Track 4 service (the official autocomplete);
    falls back to our local engine if it is not configured or unreachable."""
    q = q.strip()
    if (lat is None) != (lng is None):
        raise HTTPException(status_code=422, detail="lat and lng must be supplied together")
    from ..integrations import track4
    if track4.is_configured():
        proxied = track4.suggest(q, limit=k, lat=lat, lng=lng)
        if proxied and proxied["suggestions"]:
            try:
                return schemas.AutocompleteResponse.model_validate(proxied)
            except ValidationError:
                # The teammate service is an optional dependency. A malformed
                # payload should use the validated local fallback, not escape the
                # declared HTTP contract or turn a keystroke into a 500 response.
                pass
    return schemas.AutocompleteResponse.model_validate(_hai_autocomplete(
        q, k, smart, fallback=track4.is_configured(), lat=lat, lng=lng))


def _hai_autocomplete(q: str, k: int, smart: bool, fallback: bool = False,
                      lat: float = None, lng: float = None) -> dict:
    """Run Hai's autocomplete directly, without delegating to Track 4."""
    st = _state()
    out = st["ac"].suggest(q, top_k=k, lat=lat, lng=lng)
    base = "local-fallback" if fallback else "hai"
    out["source"] = f"{base} · {out['source']}" if out.get("source") else base
    if smart:
        from ..llm import boost
        out = boost.smart_suggestions(q, out, st["kb"])
        out.setdefault("source", base)
    return out


@app.get("/autocomplete/hai", response_model=schemas.AutocompleteResponse)
def hai_autocomplete_endpoint(
        q: str = Query(
            ..., min_length=1, max_length=schemas.MAX_AUTOCOMPLETE_LENGTH,
            pattern=r"\S", description="typed prefix"),
        k: int = Query(6, ge=1, le=12),
        lat: float = Query(None, ge=-90, le=90),
        lng: float = Query(None, ge=-180, le=180),
        smart: bool = Query(False, description="LLM smart suggestions if available")):
    """P9 Hai. Always uses Hai's trie + pattern layer for fair comparison."""
    if (lat is None) != (lng is None):
        raise HTTPException(status_code=422, detail="lat and lng must be supplied together")
    return schemas.AutocompleteResponse.model_validate(_hai_autocomplete(
        q.strip(), k, smart, lat=lat, lng=lng))


@app.post("/search", response_model=schemas.SearchResponse)
def search_endpoint(req: schemas.SearchRequest):
    out = _state()["ss"].search(
        req.query, top_k=req.top_k, candidate_k=req.candidate_k,
        latitude=req.lat, longitude=req.lng, as_of=req.as_of)
    return schemas.SearchResponse.model_validate(out)


@app.post("/routemate/plan", response_model=schemas.RouteMatePlanResponse)
def routemate_plan_endpoint(req: schemas.RouteMatePlanRequest):
    """RouteMate — unified P6+P7+P9 route-aware discovery.

    P6 parses the optional free-text need; a deterministic (optionally LLM-refined)
    predictor picks the need categories; the corridor engine finds and ranks real
    POIs inside the route corridor, reusing P7's quality priors.
    """
    st = _state()
    kb, ss, corridor = st["kb"], st["ss"], st["corridor"]
    origin = (req.origin.lat, req.origin.lng)

    # Resolve the destination coordinates (P6 + KB landmark resolution).
    if req.destination.lat is not None and req.destination.lng is not None:
        dest_coords = (req.destination.lat, req.destination.lng)
    else:
        resolved = ss._resolve_landmark(req.destination.name)
        if resolved is None:
            raise HTTPException(
                status_code=422,
                detail=f"Could not resolve destination '{req.destination.name}'. "
                       "Pass lat/lng explicitly.")
        dest_coords = resolved

    understanding = understand(req.free_text, kb) if req.free_text else None

    distance_km = (req.distance_km if req.distance_km is not None
                   else _haversine(origin, dest_coords))
    duration_min = (req.duration_min if req.duration_min is not None
                    else distance_km / 40.0 * 60.0)
    avg_speed = (distance_km / (duration_min / 60.0)
                 if duration_min and duration_min > 0 else 40.0)

    needs = predict_needs(req.vehicle_type, distance_km, duration_min, understanding)
    source = "deterministic"
    if req.use_llm:
        from ..llm import client as llm_client
        if llm_client.is_available():
            from ..llm import needs as llm_needs
            trip_ctx = {
                "vehicle_type": req.vehicle_type,
                "distance_km": round(distance_km, 1),
                "duration_min": round(duration_min, 1),
                "request": req.free_text or "",
            }
            needs = llm_needs.boost_needs(trip_ctx, needs, kb)
            source = "llm"

    # Advanced: preferred attributes per place bucket (café / food / hotel),
    # with a global fallback for back-compat.
    def _clean_attrs(values):
        return [a.strip()[:40] for a in (values or []) if a and a.strip()][:12]

    global_attrs = _clean_attrs(req.attributes)
    by_need = req.attributes_by_need or {}
    for need in needs:
        if need.need_key not in {"cafe", "food", "hotel"}:
            continue
        per = by_need.get(need.need_key)
        attrs = _clean_attrs(per) if per is not None else global_attrs
        if attrs:
            need.required_attrs = attrs

    line = [(p.lat, p.lng) for p in req.route_polyline]
    plan = corridor.plan(
        origin, dest_coords, needs, route_polyline=line or None,
        understanding=understanding, limit_per_need=req.limit_per_need,
        corridor_km=req.corridor_km, avg_speed_kmh=avg_speed)

    out = {
        **plan,
        "destination_name": req.destination.name,
        "vehicle_type": req.vehicle_type,
        "source": source,
        "understanding": understanding.to_dict() if understanding else None,
        "diagnostics": {
            "pool_size": len(corridor.pool),
            "distance_km": round(distance_km, 2),
            "duration_min": round(duration_min, 1),
            "avg_speed_kmh": round(avg_speed, 1),
            "route_points": len(line),
            "llm_requested": req.use_llm,
        },
    }
    return schemas.RouteMatePlanResponse.model_validate(out)


def _page(name: str):
    f = _WEB_DIR / name
    if f.exists():
        return FileResponse(str(f))
    return JSONResponse({"message": "Tasco Maps AI API. See /docs."})


@app.get("/")
def index():
    """Landing hub linking the three separate demos."""
    return _page("landing.html")


@app.get("/demo/understand")
def demo_understand():
    return _page("understand.html")


@app.get("/demo/search")
def demo_search():
    return _page("search.html")


@app.get("/demo/autocomplete")
def demo_autocomplete():
    return _page("autocomplete.html")


@app.get("/demo/lab")
def demo_lab():
    """Unified, side-by-side test bench for P9, P6, and P7."""
    return _page("lab.html")
