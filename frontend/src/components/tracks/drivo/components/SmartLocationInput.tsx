"use client";

import { useRef, useState } from "react";
import { Loader2, MapPin, Search, Sparkles } from "lucide-react";
import { API } from "@/lib/constants";
import {
  fetchSuggestions,
  searchPlaces,
  understandQuery,
  type PlaceCandidate,
  type Suggestion,
  type UnderstandResult,
} from "@/lib/api";
import { useRouteMap } from "@/hooks/use-route-map";
import { haversineMeters } from "@/lib/osrm";
import { DrivoDestination } from "../types";
import styles from "../drivo.module.css";

const NEARBY_RADIUS_M = 5000;

interface Props {
  placeholder?: string;
  onSelect: (destination: DrivoDestination) => void;
  style?: React.CSSProperties;
  showCategoryChips?: boolean;
  onFocus?: () => void;
}

const modelBadge = (bg: string): React.CSSProperties => ({
  fontSize: 10,
  fontWeight: 800,
  padding: "2px 7px",
  borderRadius: 20,
  background: bg,
  color: "#fff",
  flexShrink: 0,
});

const hasMapCoords = (c: PlaceCandidate): boolean =>
  typeof c.lat === "number" && typeof c.lng === "number" &&
  Number.isFinite(c.lat) && Number.isFinite(c.lng);

export function SmartLocationInput({ placeholder = "Tìm địa điểm...", onSelect, style, showCategoryChips = false, onFocus }: Props) {
  const { userLocation } = useRouteMap();
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [candidates, setCandidates] = useState<PlaceCandidate[]>([]);
  const [understanding, setUnderstanding] = useState<UnderstandResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestAbort = useRef<AbortController | null>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbort = useRef<AbortController | null>(null);

  const onTextChange = (value: string) => {
    setText(value);
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
        // best-effort
      }
    }, 180);
  };

  async function runSearch(query: string) {
    const q = query.trim();
    if (!q) return;
    searchAbort.current?.abort();
    const ac = new AbortController();
    searchAbort.current = ac;

    setShowSuggestions(false);
    setSearching(true);
    setError(null);

    try {
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

      if (nearby && !category && !showCategoryChips) {
        setCandidates([]);
        return;
      }

      const effectiveQuery = nearby && category ? category : q;
      const sr = await searchPlaces(effectiveQuery, nearby ? 40 : 10, ac.signal);
      if (ac.signal.aborted) return;

      const results = sr.results ?? [];
      if (nearby) {
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
    } finally {
      if (!ac.signal.aborted) setSearching(false);
    }
  }

  const pickSuggestion = (s: Suggestion) => {
    const name = s.display || s.text;
    setText(name);
    setShowSuggestions(false);
    runSearch(name);
  };

  const pickCandidate = (c: PlaceCandidate) => {
    if (!hasMapCoords(c)) return;
    const name = c.display_name || c.name;
    setText(name);
    setCandidates([]);
    setUnderstanding(null);
    onSelect({
      ...c,
      id: c.poi_id || Math.random().toString(36).substring(7),
      lat: c.lat!,
      lng: c.lng!,
      name
    });
  };

  const busy = searching;

  return (
    <div className={styles.locInputWrap} style={style}>
      <div className={styles.locInputInner}>
        <Search size={16} className={styles.locInputIcon} />
        <input
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onFocus={() => {
            if (text) setShowSuggestions(true);
            onFocus?.();
          }}
          onKeyDown={(e) => e.key === "Enter" && runSearch(text)}
          placeholder={placeholder}
          autoComplete="off"
          className={styles.locInput}
        />
        <button
          type="button"
          onClick={() => runSearch(text)}
          disabled={busy || !text.trim()}
          className={styles.locSearchBtn}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Tìm
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className={styles.locSuggestions}>
          {suggestions.map((s, i) => (
            <button
              key={`${s.text}-${i}`}
              type="button"
              onClick={() => pickSuggestion(s)}
              className={styles.locSuggestItem}
            >
              <MapPin size={12} className={styles.locSuggestIcon} />
              <span>{s.display || s.text}</span>
              <span className={styles.locSuggestType}>{s.type}</span>
            </button>
          ))}
        </div>
      )}

      {(searching || understanding || candidates.length > 0) && (
        <div className={styles.locResultsArea}>
          <div className={styles.locResultsHeader}>
            <span style={modelBadge("#0EA5E9")}>P7</span>
            <span className={styles.locResultsLabel}>
              {searching
                ? "Đang xếp hạng địa điểm…"
                : `${candidates.length} địa điểm · chạm để chọn`}
            </span>
            <Sparkles size={12} style={{ opacity: 0.5, marginLeft: "auto", color: "var(--color-text-muted)" }} />
          </div>

          {candidates.length > 0 && (
            <div className={styles.locResultsList}>
              {candidates.map((c, i) => {
                const mappable = hasMapCoords(c);
                return (
                  <button
                    key={`${c.poi_id}-${i}`}
                    type="button"
                    onClick={() => pickCandidate(c)}
                    disabled={!mappable}
                    title={mappable ? "Chọn địa điểm này" : "Không có toạ độ"}
                    className={styles.locCandidate}
                  >
                    <span className={styles.locCandidateIndex} style={{ background: mappable ? undefined : "var(--color-text-muted)" }}>
                      {i + 1}
                    </span>
                    <span className={styles.locCandidateInfo}>
                      <span className={styles.locCandidateName}>
                        {c.display_name || c.name}
                      </span>
                      <span className={styles.locCandidateMeta}>
                        {c.category}
                        {c.district || c.city ? ` · ${c.district || c.city}` : ""}
                        {c.rating != null ? ` · ★${c.rating}` : ""}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {!searching && candidates.length === 0 && understanding && (
            <div className={styles.locEmpty}>
              Không tìm thấy địa điểm phù hợp.
            </div>
          )}
        </div>
      )}

      {error && <div className={styles.locError}>{error}</div>}
    </div>
  );
}
