"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin, Route, Search, Sparkles } from "lucide-react";
import { API } from "@/lib/constants";
import { useRouteMap } from "@/hooks/use-route-map";
import { fetchOsrmRoute, haversineMeters } from "@/lib/osrm";
import type { LatLng, RouteInfo } from "@/lib/osrm";
import {
  fetchSuggestions,
  planRoute,
  searchPlaces,
  understandQuery,
  type PlaceCandidate,
  type RouteMatePlanResponse,
  type Suggestion,
  type UnderstandResult,
  type VehicleType,
} from "@/lib/api";
import { VehicleToggle } from "./vehicle-toggle";
import { SuggestionSheet } from "./suggestion-sheet";
import type { FlatRecommendation } from "./types";

const RouteMateMapInner = dynamic(
  () => import("./routemate-map-inner").then((m) => m.RouteMateMapInner),
  {
    ssr: false,
    loading: () => (
      <div style={{ ...fill, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
        Đang tải bản đồ…
      </div>
    ),
  },
);

interface DestChoice {
  name: string;
  lat?: number;
  lng?: number;
}

const PRESETS: (DestChoice & { hint: string })[] = [
  { name: "Đà Lạt", lat: 11.9404, lng: 108.4583, hint: "Chuyến đi dài" },
  { name: "Bảo Lộc", lat: 11.549, lng: 107.808, hint: "Nửa đường lên Đà Lạt" },
  { name: "Sân bay Tân Sơn Nhất", lat: 10.8188, lng: 106.652, hint: "Nội thành HCM" },
  { name: "Chợ Bến Thành", lat: 10.7721, lng: 106.698, hint: "Nội thành HCM" },
];

const fill: React.CSSProperties = { position: "absolute", inset: 0 };
const glass = {
  background: "rgba(20,20,22,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  backdropFilter: "blur(10px)",
};

const modelBadge = (bg: string): React.CSSProperties => ({
  fontSize: 10,
  fontWeight: 800,
  padding: "2px 7px",
  borderRadius: 20,
  background: bg,
  color: "#fff",
  flexShrink: 0,
});
const entityChip: React.CSSProperties = {
  fontSize: 11,
  padding: "2px 8px",
  borderRadius: 20,
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.15)",
};

/* Surface the entities P6 extracted (plus the attributes P7 required) as chips. */
const ENTITY_KEYS = [
  "category", "brand", "dish", "attribute", "city", "district",
  "reference_area", "reference_poi", "poi_name",
] as const;
function understandingChips(
  entities: Record<string, unknown> | undefined,
  reqAttrs: string[],
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (v: unknown) => {
    if (v == null) return;
    const s = String(v).trim();
    const key = s.toLowerCase();
    if (s && !seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  };
  for (const k of ENTITY_KEYS) {
    const v = entities?.[k];
    if (Array.isArray(v)) v.forEach(push);
    else push(v);
  }
  const attrs = entities?.["attributes"];
  if (Array.isArray(attrs)) attrs.forEach(push);
  reqAttrs.forEach(push);
  return out.slice(0, 6);
}

/** A candidate is routable (and mappable) only if it has real coordinates. */
const hasMapCoords = (c: PlaceCandidate): boolean =>
  typeof c.lat === "number" && typeof c.lng === "number" &&
  Number.isFinite(c.lat) && Number.isFinite(c.lng);

/* "gần đây" / "near me" means places within this radius of the user. */
const NEARBY_RADIUS_M = 5000;

/* A bare "near me" (no category) can't be ranked, so we offer routable category
   suggestions; picking one re-runs as a nearby category search. */
const NEARBY_CATEGORIES = [
  "Quán cà phê", "Nhà hàng", "Khách sạn",
  "Trung tâm thương mại", "Trạm xăng", "Trạm sạc xe điện",
];
function nearbyCategoryChips(entities: Record<string, unknown> | undefined): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (v: unknown) => {
    if (v == null) return;
    const s = String(v).trim();
    const key = s.toLowerCase();
    if (s && !seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  };
  push(entities?.["category"]); // P6's detected category leads, if any
  NEARBY_CATEGORIES.forEach(push);
  return out.slice(0, 6);
}

export function RouteMateDemo() {
  const { userLocation, geoPermission } = useRouteMap();

  const [vehicle, setVehicle] = useState<VehicleType>("petrol");
  const [destText, setDestText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [destCoords, setDestCoords] = useState<LatLng | null>(null);
  const [baseRoute, setBaseRoute] = useState<RouteInfo | null>(null);
  const [displayRoute, setDisplayRoute] = useState<RouteInfo | null>(null);
  const [result, setResult] = useState<RouteMatePlanResponse | null>(null);
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<FlatRecommendation[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [attrsByNeed, setAttrsByNeed] = useState<Record<string, string[]>>({});
  const [plannedDest, setPlannedDest] = useState<{ name: string; coords: LatLng } | null>(null);

  /* Unified discovery search (P6 understanding + P7 ranked candidates). */
  const [candidates, setCandidates] = useState<PlaceCandidate[]>([]);
  const [understanding, setUnderstanding] = useState<UnderstandResult | null>(null);
  const [reqAttrs, setReqAttrs] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  const planAbort = useRef<AbortController | null>(null);
  const replanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestAbort = useRef<AbortController | null>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbort = useRef<AbortController | null>(null);

  /* Backend already spreads stops evenly along the route; show them ordered by
     distance from the origin so the list covers the whole trip. */
  const visibleByNeed = useMemo(() => {
    const out: Record<string, FlatRecommendation[]> = {};
    if (!result) return out;
    for (const g of result.groups) {
      const flat: FlatRecommendation[] = g.recommendations.map((r) => ({
        ...r,
        need_key: g.need_key,
      }));
      // Distance mode (slider) → order along the route; attribute mode → keep
      // the backend's match-first order.
      if (g.slider) flat.sort((a, b) => (a.progress_km ?? 0) - (b.progress_km ?? 0));
      out[g.need_key] = flat;
    }
    return out;
  }, [result]);

  const markers = useMemo(() => {
    const seen = new Set<string>();
    const out: FlatRecommendation[] = [];
    for (const key of Object.keys(visibleByNeed)) {
      for (const rec of visibleByNeed[key]) {
        if (!seen.has(rec.poi_id)) {
          seen.add(rec.poi_id);
          out.push(rec);
        }
      }
    }
    return out;
  }, [visibleByNeed]);

  const selectedIds = useMemo(() => new Set(selected.map((r) => r.poi_id)), [selected]);

  const onDestChange = (value: string) => {
    setDestText(value);
    setShowSuggestions(true);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      suggestAbort.current?.abort();
      const ac = new AbortController();
      suggestAbort.current = ac;
      try {
        const res = await fetchSuggestions(
          value.trim(),
          { limit: 6, endpoint: API.TRACK4_HAI_SUGGEST },
          ac.signal,
        );
        setSuggestions(res.suggestions ?? []);
      } catch {
        /* best-effort */
      }
    }, 180);
  };

  async function runPlan(dest: DestChoice) {
    if (!dest.name.trim()) return;
    planAbort.current?.abort();
    const ac = new AbortController();
    planAbort.current = ac;
    const origin: LatLng = userLocation;

    setLoading(true);
    setError(null);
    setSelected([]);
    setDisplayRoute(null);
    setShowSuggestions(false);
    setCollapsed(false);
    // Leaving discovery mode: the corridor view replaces the candidate pins.
    searchAbort.current?.abort();
    setSearching(false);
    setCandidates([]);
    setUnderstanding(null);

    try {
      let coords: LatLng | null =
        dest.lat != null && dest.lng != null ? { lat: dest.lat, lng: dest.lng } : null;
      let base: RouteInfo | null = null;

      if (coords) {
        base = await fetchOsrmRoute([origin, coords], ac.signal);
        setBaseRoute(base);
        setDestCoords(coords);
      }

      const buildBody = (c: LatLng, b: RouteInfo) => ({
        origin,
        destination: { name: dest.name, lat: c.lat, lng: c.lng },
        vehicle_type: vehicle,
        distance_km: b.distanceMeters / 1000,
        duration_min: b.durationSeconds / 60,
        route_polyline: downsample(b.coordinates),
        attributes_by_need: attrsByNeed,
      });

      let res: RouteMatePlanResponse;
      if (coords && base) {
        res = await planRoute(buildBody(coords, base), ac.signal);
      } else {
        // No coordinates from the picker → let the backend resolve them, then
        // draw the route and refine the corridor with the real road geometry.
        res = await planRoute(
          {
            origin,
            destination: { name: dest.name },
            vehicle_type: vehicle,
            route_polyline: [],
            attributes_by_need: attrsByNeed,
          },
          ac.signal,
        );
        const dc: LatLng = { lat: res.destination.lat, lng: res.destination.lng };
        setDestCoords(dc);
        base = await fetchOsrmRoute([origin, dc], ac.signal);
        setBaseRoute(base);
        res = await planRoute(buildBody(dc, base), ac.signal);
        coords = dc;
      }

      setResult(res);
      if (coords) setPlannedDest({ name: dest.name, coords });
      // Initialise slider targets from each group's default.
      const initial: Record<string, number> = {};
      for (const g of res.groups) {
        if (g.slider) initial[g.need_key] = g.target_default ?? g.slider.default;
      }
      setTargets(initial);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Không thể lập lộ trình");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  // Re-run the plan reusing the existing route when only filters change.
  async function replan() {
    if (!plannedDest || !baseRoute) return;
    planAbort.current?.abort();
    const ac = new AbortController();
    planAbort.current = ac;
    setLoading(true);
    setError(null);
    setSelected([]);
    setDisplayRoute(null);
    try {
      const res = await planRoute(
        {
          origin: userLocation,
          destination: {
            name: plannedDest.name,
            lat: plannedDest.coords.lat,
            lng: plannedDest.coords.lng,
          },
          vehicle_type: vehicle,
          distance_km: baseRoute.distanceMeters / 1000,
          duration_min: baseRoute.durationSeconds / 60,
          route_polyline: downsample(baseRoute.coordinates),
          attributes_by_need: attrsByNeed,
        },
        ac.signal,
      );
      setResult(res);
      setTargets((prev) => {
        const next = { ...prev };
        for (const g of res.groups) {
          if (g.slider && next[g.need_key] == null) {
            next[g.need_key] = g.target_default ?? g.slider.default;
          }
        }
        return next;
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Không thể cập nhật gợi ý");
    } finally {
      setLoading(false);
    }
  }

  /* Debounced re-plan when filters (attributes / vehicle) change. */
  useEffect(() => {
    if (!plannedDest || !baseRoute) return;
    if (replanTimer.current) clearTimeout(replanTimer.current);
    replanTimer.current = setTimeout(() => void replan(), 400);
    return () => {
      if (replanTimer.current) clearTimeout(replanTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attrsByNeed, vehicle]);

  const toggleNeedAttr = (needKey: string, value: string) =>
    setAttrsByNeed((prev) => {
      const cur = prev[needKey] ?? [];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...prev, [needKey]: next };
    });
  const addNeedAttr = (needKey: string, value: string) => {
    const v = value.trim();
    if (!v) return;
    setAttrsByNeed((prev) => {
      const cur = prev[needKey] ?? [];
      return cur.includes(v) ? prev : { ...prev, [needKey]: [...cur, v] };
    });
  };

  const onToggle = (rec: FlatRecommendation) => {
    setDisplayRoute(null); // selection changed → previous re-route is stale
    setSelected((prev) =>
      prev.some((r) => r.poi_id === rec.poi_id)
        ? prev.filter((r) => r.poi_id !== rec.poi_id)
        : [...prev, rec],
    );
  };

  async function regenerate() {
    if (!destCoords || selected.length === 0) return;
    setRegenerating(true);
    try {
      const ordered = [...selected].sort((a, b) => (a.progress_km ?? 0) - (b.progress_km ?? 0));
      const points: LatLng[] = [
        userLocation,
        ...ordered.map((r) => ({ lat: r.lat, lng: r.lng })),
        destCoords,
      ];
      const rr = await fetchOsrmRoute(points);
      setDisplayRoute(rr);
    } catch {
      /* keep base route */
    } finally {
      setRegenerating(false);
    }
  }

  /* Unified discovery: P6 explains the query, then P7 ranks candidate places.
     A "Nearby Search" with a category (e.g. "cà phê gần đây") is searched
     straight away but clamped to a 5 km radius around the user; a bare "gần
     tôi" (no category) instead offers category chips to pick from. */
  async function runSearch(query: string) {
    const q = query.trim();
    if (!q) return;
    searchAbort.current?.abort();
    const ac = new AbortController();
    searchAbort.current = ac;

    // A new search resets the map to discovery mode (no active route).
    setShowSuggestions(false);
    setSearching(true);
    setError(null);
    setResult(null);
    setBaseRoute(null);
    setDisplayRoute(null);
    setDestCoords(null);
    setPlannedDest(null);
    setSelected([]);

    try {
      // P6 first — its intent decides how we run (and scope) the P7 search.
      let u: UnderstandResult | null = null;
      try {
        u = await understandQuery(q, ac.signal);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
      if (ac.signal.aborted) return;
      setUnderstanding(u);

      const nearby = u?.intent === "Nearby Search";
      const category =
        u && typeof u.entities?.["category"] === "string"
          ? (u.entities["category"] as string)
          : null;

      // Bare "near me" without a category: nothing to rank — offer chips.
      if (nearby && !category) {
        setCandidates([]);
        setReqAttrs([]);
        return;
      }

      // Nearby + category: search the category and overfetch so the 5 km
      // radius filter still leaves a useful list.
      const effectiveQuery = nearby && category ? category : q;
      const sr = await searchPlaces(effectiveQuery, nearby ? 40 : 10, ac.signal);
      if (ac.signal.aborted) return;

      if (!u) setUnderstanding(sr.understanding ?? null); // P7 embeds P6 too
      setReqAttrs(sr.required_attributes ?? []);

      const results = sr.results ?? [];
      if (nearby) {
        // Keep only places within 5 km of the user, closest first.
        const near = results
          .filter(hasMapCoords)
          .map((r) => ({
            r,
            d: haversineMeters(userLocation.lat, userLocation.lng, r.lat!, r.lng!),
          }))
          .filter((x) => x.d <= NEARBY_RADIUS_M)
          .sort((a, b) => a.d - b.d)
          .map((x) => x.r);
        setCandidates(near);
      } else {
        // Routable places (with lat/lng) first; the rest keep P7's ranking.
        // Array sort is stable, so ties hold their order.
        setCandidates(
          [...results].sort(
            (a, b) => Number(hasMapCoords(b)) - Number(hasMapCoords(a)),
          ),
        );
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Không thể tìm kiếm địa điểm");
      setCandidates([]);
      setReqAttrs([]);
    } finally {
      if (!ac.signal.aborted) setSearching(false);
    }
  }

  const pickSuggestion = (s: Suggestion) => {
    const name = s.display || s.text;
    setDestText(name);
    setShowSuggestions(false);
    runSearch(name);
  };

  /* Clicking a P7 candidate promotes it to the destination and plans a route. */
  const pickCandidate = (c: PlaceCandidate) => {
    const name = c.display_name || c.name;
    setDestText(name);
    runPlan({
      name,
      lat: typeof c.lat === "number" ? c.lat : undefined,
      lng: typeof c.lng === "number" ? c.lng : undefined,
    });
  };

  const addedMin =
    displayRoute && baseRoute
      ? Math.max(0, Math.round((displayRoute.durationSeconds - baseRoute.durationSeconds) / 60))
      : null;
  const addedKm =
    displayRoute && baseRoute
      ? Math.max(0, (displayRoute.distanceMeters - baseRoute.distanceMeters) / 1000)
      : null;

  const originLabel =
    geoPermission === "granted" ? "Vị trí hiện tại" : "TP.HCM (mặc định)";

  // The search box is busy while discovering (P6/P7) or planning a route.
  const busy = searching || loading;
  // Nearby searches are clamped to a 5 km radius around the user.
  const isNearby = understanding?.intent === "Nearby Search";
  const nearbyCategory =
    isNearby && typeof understanding?.entities?.["category"] === "string"
      ? (understanding.entities["category"] as string)
      : null;
  // A bare "near me" (no category) offers chips; a nearby category is listed.
  const showCategoryChips = isNearby && !nearbyCategory;

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 4px 24px" }}>
      <h1 style={{ fontSize: 22, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
        <Route size={22} /> RouteMate
        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: "rgba(127,127,127,0.15)" }}>
          P6 + P7 + P9
        </span>
      </h1>
      <p style={{ opacity: 0.6, fontSize: 13, margin: "0 0 12px" }}>
        Tìm địa điểm bằng ngôn ngữ tự nhiên — P9 gợi ý khi gõ, P6 hiểu truy vấn, P7 xếp
        hạng các địa điểm và ghim thẳng lên bản đồ. Chạm một địa điểm để đặt làm điểm đến,
        RouteMate vẽ tuyến đường và gợi ý điểm dừng dọc đường.
      </p>

      {/* Map-centric canvas */}
      <div
        style={{
          position: "relative",
          height: "min(78vh, 760px)",
          minHeight: 520,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(127,127,127,0.25)",
        }}
      >
        <div style={fill}>
          <RouteMateMapInner
            origin={userLocation}
            destination={destCoords}
            destinationName={result?.destination_name ?? destText}
            baseRoute={baseRoute}
            displayRoute={displayRoute}
            markers={markers}
            selectedIds={selectedIds}
            onToggle={onToggle}
            candidates={candidates}
            onPickCandidate={pickCandidate}
          />
        </div>

        {/* Floating search bar (top-left) */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            width: "min(380px, calc(100% - 24px))",
            zIndex: 1000,
            borderRadius: 14,
            padding: 12,
            boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
            ...glass,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <MapPin size={14} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 12, opacity: 0.75 }}>Điểm đi: {originLabel}</span>
            <div style={{ marginLeft: "auto" }}>
              <VehicleToggle value={vehicle} onChange={setVehicle} />
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 11, top: 12, opacity: 0.5 }} />
              <input
                value={destText}
                onChange={(e) => onDestChange(e.target.value)}
                onFocus={() => destText && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === "Enter" && runSearch(destText)}
                placeholder="Tìm địa điểm hoặc điểm đến…"
                autoComplete="off"
                style={{
                  width: "100%",
                  padding: "11px 92px 11px 34px",
                  fontSize: 14,
                  borderRadius: 10,
                  outline: "none",
                  color: "#fff",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
              <button
                type="button"
                onClick={() => runSearch(destText)}
                disabled={busy || !destText.trim()}
                style={{
                  position: "absolute",
                  right: 5,
                  top: 5,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  cursor: busy || !destText.trim() ? "not-allowed" : "pointer",
                  opacity: busy || !destText.trim() ? 0.6 : 1,
                  color: "#fff",
                  background: "linear-gradient(135deg, #0EA5E9, #16A34A)",
                }}
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Tìm
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  zIndex: 1001,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "rgba(28,28,30,0.98)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.text}-${i}`}
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "9px 12px",
                      fontSize: 13,
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#fff",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <MapPin size={12} style={{ opacity: 0.5 }} />
                    <span>{s.display || s.text}</span>
                    <span style={{ marginLeft: "auto", opacity: 0.45, fontSize: 11 }}>{s.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preset destinations */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                title={p.hint}
                onClick={() => {
                  setDestText(p.name);
                  runPlan(p);
                }}
                style={{
                  fontSize: 11,
                  padding: "5px 9px",
                  borderRadius: 20,
                  cursor: "pointer",
                  color: "#fff",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Discovery — P6 understanding + P7 ranked candidate places */}
          {(searching || understanding || candidates.length > 0) && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {understanding && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  <span style={modelBadge("#7C3AED")}>P6</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{understanding.intent}</span>
                  {understandingChips(understanding.entities, reqAttrs).map((c) => (
                    <span key={c} style={entityChip}>{c}</span>
                  ))}
                </div>
              )}

              {showCategoryChips && !searching ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={modelBadge("#0EA5E9")}>P7</span>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>
                      Tìm quanh bạn (trong 5 km) — chọn nhóm địa điểm
                    </span>
                    <Sparkles size={12} style={{ opacity: 0.5, marginLeft: "auto" }} />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {nearbyCategoryChips(understanding?.entities).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const nq = `${cat} gần đây`;
                          setDestText(nq);
                          runSearch(nq);
                        }}
                        style={{
                          fontSize: 12,
                          padding: "6px 11px",
                          borderRadius: 20,
                          cursor: "pointer",
                          color: "#fff",
                          background: "rgba(124,58,237,0.18)",
                          border: "1px solid rgba(124,58,237,0.5)",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>
                    Chạm một nhóm để xem địa điểm trong 5 km và chọn điểm đến.
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={modelBadge("#0EA5E9")}>P7</span>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>
                    {searching
                      ? "Đang xếp hạng địa điểm…"
                      : isNearby
                        ? `${candidates.length} địa điểm trong 5 km · chạm để chọn điểm đến`
                        : `${candidates.length} địa điểm · chạm để chọn điểm đến`}
                  </span>
                  <Sparkles size={12} style={{ opacity: 0.5, marginLeft: "auto" }} />
                </div>
              )}

              {!showCategoryChips && candidates.length > 0 && (
                <div
                  style={{
                    maxHeight: "34vh",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {candidates.map((c, i) => {
                    const mappable = hasMapCoords(c);
                    return (
                      <button
                        key={`${c.poi_id}-${i}`}
                        type="button"
                        onClick={() => pickCandidate(c)}
                        title={mappable ? "Đặt làm điểm đến" : "Không có toạ độ trên bản đồ"}
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 9px",
                          borderRadius: 9,
                          cursor: "pointer",
                          color: "#fff",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: mappable ? "#7C3AED" : "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              display: "block",
                              fontSize: 13,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {c.display_name || c.name}
                          </span>
                          <span
                            style={{
                              display: "block",
                              fontSize: 11,
                              opacity: 0.6,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {c.category}
                            {c.district || c.city ? ` · ${c.district || c.city}` : ""}
                            {c.rating != null ? ` · ★${c.rating}` : ""}
                          </span>
                          {c.reasons?.length > 0 && (
                            <span
                              style={{
                                display: "block",
                                fontSize: 10.5,
                                opacity: 0.55,
                                marginTop: 2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {c.reasons.slice(0, 2).join(" · ")}
                            </span>
                          )}
                        </span>
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: 11,
                            fontWeight: 700,
                            opacity: 0.7,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {Number(c.score).toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!showCategoryChips && !searching && candidates.length === 0 && understanding && (
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  {isNearby
                    ? "Không có địa điểm nào trong 5 km."
                    : "Không tìm thấy địa điểm phù hợp."}
                </div>
              )}
            </div>
          )}

          {error && <div style={{ fontSize: 12, color: "#ff8a80", marginTop: 8 }}>{error}</div>}
        </div>

        {/* Bottom "you might like" sheet */}
        {result && baseRoute && (
          <SuggestionSheet
            groups={result.groups}
            visibleByNeed={visibleByNeed}
            targets={targets}
            onTarget={(k, km) => {
              setTargets((prev) => ({ ...prev, [k]: km }));
              setDisplayRoute(null);
            }}
            selectedIds={selectedIds}
            onToggle={onToggle}
            attrsByNeed={attrsByNeed}
            onAttrToggle={toggleNeedAttr}
            onAttrAdd={addNeedAttr}
            routeKm={baseRoute.distanceMeters / 1000}
            routeMin={Math.round(baseRoute.durationSeconds / 60)}
            selectedCount={selected.length}
            onRegenerate={regenerate}
            regenerating={regenerating}
            addedMin={addedMin}
            addedKm={addedKm}
            collapsed={collapsed}
            onCollapse={() => setCollapsed((c) => !c)}
          />
        )}
      </div>
    </div>
  );
}

function downsample(coords: [number, number][], max = 250): LatLng[] {
  if (coords.length <= max) return coords.map(([lng, lat]) => ({ lat, lng }));
  const step = Math.ceil(coords.length / max);
  const out: LatLng[] = [];
  for (let i = 0; i < coords.length; i += step) out.push({ lat: coords[i][1], lng: coords[i][0] });
  const last = coords[coords.length - 1];
  out.push({ lat: last[1], lng: last[0] });
  return out;
}
