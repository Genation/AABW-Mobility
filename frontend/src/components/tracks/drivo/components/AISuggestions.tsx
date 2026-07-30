"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import { searchPlaces, PlaceCandidate } from "@/lib/api";
import { Plus, Loader2, MapPin } from "lucide-react";
import styles from "../drivo.module.css";

const CATEGORIES = [
  { key: "an_uong", label: "🍜 Ăn uống", query: "quán ăn ngon" },
  { key: "cafe", label: "☕ Cafe", query: "quán cafe đẹp" },
  { key: "tram_xang", label: "⛽ Trạm xăng", query: "trạm xăng" },
  { key: "checkin", label: "📸 Check-in", query: "điểm check-in đẹp" },
  { key: "nghi_duong", label: "🏨 Nghỉ dưỡng", query: "resort nghỉ dưỡng" },
];

interface Props {
  routeLatLngs: { lat: number; lng: number }[];
  activeCategory: string;
  onCategoryChange: (key: string) => void;
  onAddPOI: (poi: PlaceCandidate) => void;
}

export function AISuggestions({
  routeLatLngs,
  activeCategory,
  onCategoryChange,
  onAddPOI,
}: Props) {
  const [results, setResults] = useState<PlaceCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!activeCategory || routeLatLngs.length < 2) {
      return;
    }

    const cat = CATEGORIES.find((c) => c.key === activeCategory);
    if (!cat) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    const mid = routeLatLngs[Math.floor(routeLatLngs.length / 2)];

    searchPlaces(cat.query, 8, ac.signal)
      .then((res) => {
        if (ac.signal.aborted) return;
        const withCoords = res.results.filter(
          (r) => r.lat != null && r.lng != null
        );
        withCoords.sort((a, b) => {
          const dA = Math.hypot((a.lat! - mid.lat), (a.lng! - mid.lng));
          const dB = Math.hypot((b.lat! - mid.lat), (b.lng! - mid.lng));
          return dA - dB;
        });
        setResults(withCoords);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("Không tải được gợi ý");
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [activeCategory, routeLatLngs]);

  return (
    <div className={styles.aiSuggestions}>
      <div className={styles.aiSuggestionsHeader}>Gợi ý dọc đường</div>

      <div className={styles.categoryChips}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`${styles.categoryChip} ${activeCategory === cat.key ? styles.categoryChipActive : ""}`}
            onClick={() => onCategoryChange(activeCategory === cat.key ? "" : cat.key)}
          >
            {cat.label}
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
          {results.map((poi) => (
            <div key={poi.poi_id} className={styles.poiCard}>
              <div className={styles.poiCardInfo}>
                <div className={styles.poiCardName}>{poi.name}</div>
                <div className={styles.poiCardMeta}>
                  <MapPin size={12} />
                  {poi.category}
                  {poi.rating != null && ` · ⭐ ${poi.rating}`}
                </div>
              </div>
              <button
                className={styles.poiAddBtn}
                onClick={() => onAddPOI(poi)}
                title="Thêm vào chặng"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && activeCategory && (
        <div className={styles.aiSuggestionsEmpty}>
          Không tìm thấy gợi ý phù hợp dọc tuyến
        </div>
      )}
    </div>
  );
}
