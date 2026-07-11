"""RouteMate corridor engine — route-aware place discovery.

Given a route (polyline) and a set of needs, find real POIs inside the route
corridor and rank them by quality, request fit, corridor proximity, and added
detour. This is the engine that "unifies" the three models: it consumes P6's
understanding (need attributes) and reuses P7's quality priors, over a POI pool
that spans all three datasets plus the seeded showcase corridor.

Ranking uses a cheap geometric detour proxy (twice the perpendicular distance to
the road). The exact re-routed detour for the place the user actually picks is
computed on the client via OSRM.
"""
from __future__ import annotations

import math
from typing import Dict, List, Optional, Sequence, Tuple

from ..core.needs import NeedSpec
from ..core.text import fold
from ..core.understand import QueryUnderstanding
from ..data.kb import KnowledgeBase, POI
from ..data.routemate_seed import seed_corridor_pois
from .semantic_search import SemanticSearchEngine, _haversine

# Scoring weights (sum need not be 1; score is a weighted mean).
_W_QUALITY = 0.35
_W_ATTR = 0.20
_W_PROXIMITY = 0.25
_W_DETOUR = 0.20

_DEFAULT_CORRIDOR_KM = 8.0
_DEFAULT_SPEED_KMH = 40.0

# Even-spread segment size (km along the route) per need bucket, and how many
# spread stops to return. Places cluster inside cities, so instead of returning
# the top-by-score (which floods the origin city) we keep the best stop in each
# route segment — giving options distributed the whole way to the destination.
_BIN_KM = {"cafe": 40.0, "food": 40.0, "fuel": 45.0, "charge": 45.0, "hotel": 80.0}
_DEFAULT_BIN_KM = 45.0
_SPREAD_CAP = 8


def _clip01(value: float) -> float:
    if not math.isfinite(value):
        return 0.0
    return min(1.0, max(0.0, value))


def _spread_along_route(scored: List[dict], route_len: float,
                        bin_km: float, cap: int) -> List[dict]:
    """Keep the best-scoring stop within each route segment, spread by progress.

    Short trips (shorter than two segments) fall back to the top stops by score,
    since there is nothing meaningful to spread.
    """
    if not scored:
        return []
    if route_len < 2 * bin_km:
        return sorted(scored, key=lambda r: (-r["score"], r["detour_km"]))[:cap]
    n_bins = max(2, min(cap, int(math.ceil(route_len / bin_km))))
    bin_size = route_len / n_bins
    best_by_bin: Dict[int, dict] = {}
    for rec in scored:
        b = min(n_bins - 1, int(rec["progress_km"] / bin_size))
        current = best_by_bin.get(b)
        if current is None or rec["score"] > current["score"]:
            best_by_bin[b] = rec
    winners = sorted(best_by_bin.values(), key=lambda r: r["progress_km"])
    return winners[:cap]


class CorridorEngine:
    def __init__(self, kb: KnowledgeBase, semantic: SemanticSearchEngine):
        self.kb = kb
        self.semantic = semantic          # reused for quality priors
        self.pool = self._build_pool()
        # canonical-category fold -> POIs, for fast per-need candidate lookup
        self._by_category: Dict[str, List[POI]] = {}
        for poi in self.pool:
            self._by_category.setdefault(fold(poi.category), []).append(poi)

    # -- candidate pool --------------------------------------------------
    def _build_pool(self) -> List[POI]:
        """All geocoded KB POIs (T1+T2+T4) plus seeded corridor POIs, deduped."""
        pool: List[POI] = []
        seen = set()
        for poi in [*self.kb.pois, *seed_corridor_pois()]:
            if poi.lat is None or poi.lng is None:
                continue
            identity = (fold(poi.name), round(float(poi.lat), 4),
                        round(float(poi.lng), 4))
            if identity in seen:
                continue
            seen.add(identity)
            pool.append(poi)
        return pool

    # -- geometry --------------------------------------------------------
    @staticmethod
    def _polyline_length_km(line: Sequence[Tuple[float, float]]) -> float:
        return sum(_haversine(line[i], line[i + 1])
                   for i in range(len(line) - 1))

    @staticmethod
    def _point_to_polyline(pt: Tuple[float, float],
                           line: Sequence[Tuple[float, float]],
                           cumulative: Sequence[float]) -> Tuple[float, float]:
        """Return (min distance km, progress ratio 0..1) of ``pt`` vs the route.

        Uses a local equirectangular projection (accurate at city/region scale)
        to project the point onto each segment.
        """
        lat0 = math.radians(pt[0])
        kx = 111.320 * math.cos(lat0)     # km per degree lon at this latitude
        ky = 110.574                      # km per degree lat

        def xy(p):
            return (p[1] * kx, p[0] * ky)

        px, py = xy(pt)
        total = cumulative[-1] if cumulative else 0.0
        best_dist = math.inf
        best_along = 0.0
        for i in range(len(line) - 1):
            ax, ay = xy(line[i])
            bx, by = xy(line[i + 1])
            dx, dy = bx - ax, by - ay
            seg_len_sq = dx * dx + dy * dy
            if seg_len_sq <= 1e-12:
                t = 0.0
            else:
                t = ((px - ax) * dx + (py - ay) * dy) / seg_len_sq
                t = max(0.0, min(1.0, t))
            cx, cy = ax + t * dx, ay + t * dy
            dist = math.hypot(px - cx, py - cy)
            if dist < best_dist:
                best_dist = dist
                seg_start = cumulative[i] if i < len(cumulative) else 0.0
                best_along = seg_start + t * math.hypot(dx, dy)
        progress = _clip01(best_along / total) if total > 1e-9 else 0.0
        return best_dist, progress

    def _cumulative(self, line: Sequence[Tuple[float, float]]) -> List[float]:
        out = [0.0]
        for i in range(len(line) - 1):
            out.append(out[-1] + _haversine(line[i], line[i + 1]))
        return out

    # -- quality / attributes -------------------------------------------
    def _quality(self, poi: POI) -> float:
        rating = self.semantic._bayesian_rating(poi)
        popularity = self.semantic._popularity(poi)
        return _clip01(0.5 * rating + 0.5 * popularity)

    @staticmethod
    def _attribute_fit(poi: POI, required: Sequence[str]) -> Tuple[float, List[str]]:
        """Lexical attribute match over the POI's own attributes/tags/desc.

        Works for every pool member regardless of source (unlike P7's positional
        matrix, which only covers its own T2 index).
        """
        if not required:
            return 0.6, []
        hay = fold(" ; ".join([*poi.attributes, *poi.tags, poi.description,
                               poi.name]))
        matched = [attr for attr in required
                   if fold(attr) and fold(attr) in hay]
        return (0.4 + 0.6 * (len(matched) / len(required))), matched

    # -- main ------------------------------------------------------------
    def plan(self, origin: Tuple[float, float], destination: Tuple[float, float],
             needs: Sequence[NeedSpec],
             route_polyline: Optional[Sequence[Tuple[float, float]]] = None,
             understanding: Optional[QueryUnderstanding] = None,
             limit_per_need: int = 4, corridor_km: float = _DEFAULT_CORRIDOR_KM,
             avg_speed_kmh: float = _DEFAULT_SPEED_KMH) -> dict:
        line = [tuple(p) for p in (route_polyline or [origin, destination])
                if p is not None]
        if len(line) < 2:
            line = [origin, destination]
        cumulative = self._cumulative(line)
        route_len = cumulative[-1]
        speed = avg_speed_kmh if avg_speed_kmh and avg_speed_kmh > 1 else _DEFAULT_SPEED_KMH

        groups = []
        for need in needs:
            # Union candidates across the need's categories (e.g. rest = café +
            # restaurant), de-duplicated by identity.
            candidates: List[POI] = []
            seen_ids = set()
            for category in need.categories:
                for poi in self._by_category.get(fold(category), []):
                    key = id(poi)
                    if key in seen_ids:
                        continue
                    seen_ids.add(key)
                    candidates.append(poi)

            scored = []
            for poi in candidates:
                perp_km, progress = self._point_to_polyline(
                    (float(poi.lat), float(poi.lng)), line, cumulative)
                if perp_km > corridor_km:
                    continue
                detour_km = round(2.0 * perp_km, 2)
                detour_min = int(round(detour_km / speed * 60.0))
                quality = self._quality(poi)
                attr_fit, matched = self._attribute_fit(poi, need.required_attrs)
                proximity = math.exp(-perp_km / max(0.5, corridor_km))
                detour_pen = math.exp(-detour_km / 6.0)
                score = _clip01(
                    _W_QUALITY * quality + _W_ATTR * attr_fit
                    + _W_PROXIMITY * proximity + _W_DETOUR * detour_pen)

                reasons: List[str] = []
                if matched:
                    reasons.append("phù hợp: " + ", ".join(matched))
                if poi.rating and poi.rating >= 4.3:
                    reasons.append(f"đánh giá {poi.rating}★")
                if quality >= 0.75:
                    reasons.append("phổ biến")
                reasons.append(f"chệch ~{detour_km:.1f} km" if detour_km >= 0.1
                               else "ngay trên đường")

                scored.append({
                    "poi_id": f"{poi.source}:{poi.poi_id}",
                    "name": poi.name,
                    "category": poi.category,
                    "brand": poi.brand or None,
                    "address": poi.address or "",
                    "city": poi.city or "",
                    "lat": float(poi.lat), "lng": float(poi.lng),
                    "rating": poi.rating,
                    "review_count": int(poi.review_count or 0),
                    "score": round(score, 4),
                    "reasons": reasons[:4],
                    "detour_km": detour_km,
                    "detour_min": detour_min,
                    "progress": round(progress, 3),
                    "progress_km": round(progress * route_len, 1),
                    "source": poi.source,
                    "_match": len(matched),
                })
            # Attribute filter is strict: keep only matching places (the bucket
            # can legitimately become empty when nothing matches the criteria).
            if need.required_attrs:
                scored = [r for r in scored if r.get("_match", 0) > 0]

            if need.slider:
                # Distance regime (long trip): spread the — possibly filtered —
                # candidates evenly along the route.
                bin_km = _BIN_KM.get(need.need_key, _DEFAULT_BIN_KM)
                recs = _spread_along_route(scored, route_len, bin_km, _SPREAD_CAP)
            else:
                # Attribute regime (short trip): rank by match strength then quality.
                scored.sort(key=lambda r: (-r.get("_match", 0), -r["score"], r["detour_km"]))
                recs = scored[:_SPREAD_CAP]
            for rec in recs:
                rec.pop("_match", None)
            groups.append({
                "need_key": need.need_key,
                "category": need.category,
                "categories": need.categories,
                "label": need.label,
                "why": need.why,
                "slider": need.slider,
                "target_default": need.target_km,
                "recommendations": recs,
            })

        return {
            "origin": {"lat": origin[0], "lng": origin[1]},
            "destination": {"lat": destination[0], "lng": destination[1]},
            "route_length_km": round(route_len, 2),
            "corridor_km": corridor_km,
            "needs": [n.need_key for n in needs],
            "groups": groups,
        }
