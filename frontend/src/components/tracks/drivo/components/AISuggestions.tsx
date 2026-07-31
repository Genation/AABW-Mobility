"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import { searchPlaces, PlaceCandidate } from "@/lib/api";
import { useRouteMap } from "@/hooks/use-route-map";
import { filterSortByNearby, NearbyCenter } from "../nearby-search-utils";
import { formatDistance } from "../stop-items-utils";
import { Plus, Loader2, MapPin, Search } from "lucide-react";
import styles from "../drivo.module.css";

const CATEGORIES = [
  { key: "an_uong", label: "🍜 Ăn uống", query: "quán ăn ngon" },
  { key: "cafe", label: "☕ Cafe", query: "quán cafe đẹp" },
  { key: "tram_xang", label: "⛽ Trạm xăng", query: "trạm xăng" },
  { key: "checkin", label: "📸 Check-in", query: "điểm check-in đẹp" },
  { key: "nghi_duong", label: "🏨 Nghỉ dưỡng", query: "resort nghỉ dưỡng" },
];

interface ResultItem {
  poi: PlaceCandidate;
  distanceM?: number;
}

interface Props {
  routeLatLngs: { lat: number; lng: number }[];
  nearbyCenters: NearbyCenter[];
  activeCategory: string;
  onCategoryChange: (key: string) => void;
  /** centerId is "" (Dọc tuyến), "gps", or a nearbyCenters id — lets the caller insert the stop next to it. */
  onAddPOI: (poi: PlaceCandidate, centerId: string) => void;
}

export function AISuggestions({
  routeLatLngs,
  nearbyCenters,
  activeCategory,
  onCategoryChange,
  onAddPOI,
}: Props) {
  const { userLocation } = useRouteMap();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [centerId, setCenterId] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cat = CATEGORIES.find((c) => c.key === activeCategory);
    const effectiveQuery = submittedQuery || cat?.query || "";
    if (!effectiveQuery) {
      setResults([]);
      return;
    }
    if (centerId === "" && routeLatLngs.length < 2) {
      setResults([]);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    searchPlaces(effectiveQuery, centerId ? 40 : 8, ac.signal)
      .then((res) => {
        if (ac.signal.aborted) return;
        const items = res.results ?? [];

        if (centerId === "") {
          const mid = routeLatLngs[Math.floor(routeLatLngs.length / 2)];
          const withCoords = items.filter((r) => r.lat != null && r.lng != null);
          withCoords.sort((a, b) => {
            const dA = Math.hypot(a.lat! - mid.lat, a.lng! - mid.lng);
            const dB = Math.hypot(b.lat! - mid.lat, b.lng! - mid.lng);
            return dA - dB;
          });
          setResults(withCoords.map((poi) => ({ poi })));
          return;
        }

        const center = centerId === "gps" ? userLocation : nearbyCenters.find((c) => c.id === centerId);
        if (!center) {
          setResults([]);
          return;
        }
        setResults(filterSortByNearby(items, center).map(({ item, distanceM }) => ({ poi: item, distanceM })));
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("Không tải được gợi ý");
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [submittedQuery, centerId, routeLatLngs, nearbyCenters, activeCategory, userLocation]);

  const selectCategory = (key: string) => {
    onCategoryChange(activeCategory === key ? "" : key);
    setQuery("");
    setSubmittedQuery("");
  };

  const runTextSearch = () => {
    if (!query.trim()) return;
    setSubmittedQuery(query.trim());
    onCategoryChange("");
  };

  const hasQuery = !!(submittedQuery || CATEGORIES.find((c) => c.key === activeCategory));
  const centerLabel = centerId === "gps" ? "vị trí của bạn" : nearbyCenters.find((c) => c.id === centerId)?.label ?? "điểm đã chọn";

  return (
    <div className={styles.aiSuggestions}>
      <div className={styles.aiSuggestionsHeader}>Gợi ý dọc đường</div>

      <div className={styles.aiSearchRow}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runTextSearch()}
          placeholder="Tìm địa điểm..."
          className={styles.aiSearchInput}
        />
        <button type="button" onClick={runTextSearch} disabled={!query.trim()} className={styles.aiSearchBtn}>
          <Search size={14} /> Tìm
        </button>
      </div>

      <div className={styles.categoryChips}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`${styles.categoryChip} ${activeCategory === cat.key ? styles.categoryChipActive : ""}`}
            onClick={() => selectCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className={styles.categoryChips}>
        <button
          className={`${styles.categoryChip} ${centerId === "" ? styles.categoryChipActive : ""}`}
          onClick={() => setCenterId("")}
        >
          Dọc tuyến
        </button>
        <button
          className={`${styles.categoryChip} ${centerId === "gps" ? styles.categoryChipActive : ""}`}
          onClick={() => setCenterId("gps")}
        >
          Vị trí của tôi
        </button>
        {nearbyCenters.map((c) => (
          <button
            key={c.id}
            className={`${styles.categoryChip} ${centerId === c.id ? styles.categoryChipActive : ""}`}
            onClick={() => setCenterId(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.aiSuggestionsLoading}>
          <Loader2 size={18} className={styles.spin} /> Đang tìm...
        </div>
      )}

      {error && <div className={styles.aiSuggestionsError}>{error}</div>}

      {!loading && !error && results.length > 0 && (
        <div className={styles.poiList}>
          {results.map(({ poi, distanceM }) => (
            <div key={poi.poi_id} className={styles.poiCard}>
              <div className={styles.poiCardInfo}>
                <div className={styles.poiCardName}>{poi.name}</div>
                <div className={styles.poiCardMeta}>
                  <MapPin size={12} />
                  {poi.category}
                  {poi.rating != null && ` · ⭐ ${poi.rating}`}
                  {distanceM != null && ` · ${formatDistance(distanceM)} từ ${centerLabel}`}
                </div>
              </div>
              <button
                className={styles.poiAddBtn}
                onClick={() => onAddPOI(poi, centerId)}
                title="Thêm vào chặng"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && hasQuery && (
        <div className={styles.aiSuggestionsEmpty}>
          {centerId !== ""
            ? `Không có kết quả trong bán kính 5km quanh ${centerLabel}`
            : "Không tìm thấy gợi ý phù hợp dọc tuyến"}
        </div>
      )}
    </div>
  );
}
