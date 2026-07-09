import { AlertCircle, Clock, MapPin, Search, Trash2, X, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Suggestion, AutocompleteResponse } from "@/lib/api";
import type { HistoryEntry } from "@/hooks/use-search-history";
import styles from "./suggestion-list.module.css";

interface SuggestionListProps {
  suggestions: Suggestion[];
  latencyMs: number | null;
  source: AutocompleteResponse["source"] | null;
  isLoading: boolean;
  error: string | null;
  query: string;
  /* New: interaction props */
  onSelect?: (suggestion: Suggestion) => void;
  isInHistory?: (text: string) => boolean;
  activeIndex?: number;
  /** Recent history entries shown when query is empty */
  recentHistory?: HistoryEntry[];
  onRemoveHistory?: (text: string) => void;
  onClearHistory?: () => void;
  onSelectHistory?: (entry: HistoryEntry) => void;
  visible?: boolean;
}

/** Map source type to badge variant */
function sourceBadgeVariant(source: AutocompleteResponse["source"]): "success" | "warning" | "info" | "default" {
  switch (source) {
    case "exact": return "success";
    case "fuzzy": return "warning";
    case "popular": return "info";
    default: return "default";
  }
}

/** Map suggestion type to color class */
function typeColor(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("brand")) return styles.typeBrand;
  if (lower.includes("category")) return styles.typeCategory;
  if (lower.includes("poi")) return styles.typePoi;
  if (lower.includes("address")) return styles.typeAddress;
  return styles.typeDefault;
}

/** Map suggestion type to icon */
function typeIcon(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes("poi") || lower.includes("address")) {
    return <MapPin size={14} className={styles.rowIcon} />;
  }
  return <Search size={14} className={styles.rowIcon} />;
}

/**
 * Highlight matching text portions — bold the query match like Google.
 */
function highlightMatch(display: string, query: string) {
  if (!query.trim()) return <>{display}</>;

  const q = query.trim().toLowerCase();
  const idx = display.toLowerCase().indexOf(q);
  if (idx === -1) return <>{display}</>;

  const before = display.slice(0, idx);
  const match = display.slice(idx, idx + q.length);
  const after = display.slice(idx + q.length);

  return (
    <>
      <span className={styles.matchBold}>{before}</span>
      {match}
      <span className={styles.matchBold}>{after}</span>
    </>
  );
}

/**
 * Suggestion dropdown — Google-style UX:
 * - Shows recent history when empty (clock icon)
 * - Highlights matching text with bold
 * - History icon for previously selected suggestions
 * - Keyboard active row highlight
 * - Click to select
 */
export function SuggestionList({
  suggestions,
  latencyMs,
  source,
  isLoading,
  error,
  query,
  onSelect,
  isInHistory,
  activeIndex = -1,
  recentHistory = [],
  onRemoveHistory,
  onClearHistory,
  onSelectHistory,
  visible = true,
}: SuggestionListProps) {
  if (!visible) return null;

  /* Empty state — show recent history when available */
  if (!query.trim() && !isLoading) {
    if (recentHistory.length > 0) {
      return (
        <div className={styles.panel}>
          <div className={styles.historyHeader}>
            <span className={styles.historyTitle}>Recent searches</span>
            {onClearHistory && (
              <button
                className={styles.clearHistoryBtn}
                onClick={onClearHistory}
                type="button"
              >
                Clear all
              </button>
            )}
          </div>
          <ul className={styles.list}>
            {recentHistory.map((entry, i) => (
              <li
                key={`history-${entry.text}-${i}`}
                className={`${styles.row} ${styles.historyRow} ${i === activeIndex ? styles.active : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectHistory?.(entry);
                }}
                role="option"
                aria-selected={i === activeIndex}
              >
                <div className={styles.rowLeft}>
                  <Clock size={14} className={styles.historyIcon} />
                  <span className={styles.display}>{entry.display}</span>
                </div>
                <div className={styles.rowRight}>
                  <span className={`${styles.typeBadge} ${typeColor(entry.type)}`}>
                    {entry.type}
                  </span>
                  {onRemoveHistory && (
                    <button
                      className={styles.removeBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onRemoveHistory(entry.text);
                      }}
                      aria-label={`Remove ${entry.display} from history`}
                      type="button"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <Search size={20} className={styles.emptyIcon} />
          <span>Start typing to search…</span>
        </div>
      </div>
    );
  }

  /* Error state */
  if (error) {
    return (
      <div className={styles.panel}>
        <div className={styles.error}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  /* Loading state — skeleton rows */
  if (isLoading && suggestions.length === 0) {
    return (
      <div className={styles.panel}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeleton}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonBadge} />
          </div>
        ))}
      </div>
    );
  }

  /* No results */
  if (!isLoading && suggestions.length === 0 && query.trim()) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <span>No results for &quot;{query}&quot;</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {/* Suggestion rows */}
      <ul className={styles.list} role="listbox" id="autocomplete-listbox">
        {suggestions.map((s, i) => {
          const inHistory = isInHistory?.(s.text) ?? false;
          return (
            <li
              key={`${s.text}-${i}`}
              className={`${styles.row} ${i === activeIndex ? styles.active : ""} ${inHistory ? styles.historyHighlight : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect?.(s);
              }}
              onMouseEnter={() => {
                /* Visual hover handled by CSS; no state needed */
              }}
              role="option"
              id={`autocomplete-option-${i}`}
              aria-selected={i === activeIndex}
            >
              <div className={styles.rowLeft}>
                {inHistory ? (
                  <Clock size={14} className={styles.historyIcon} />
                ) : (
                  typeIcon(s.type)
                )}
                <span className={styles.display}>
                  {highlightMatch(s.display, query)}
                </span>
              </div>
              <div className={styles.rowRight}>
                <span className={`${styles.typeBadge} ${typeColor(s.type)}`}>
                  {s.type}
                </span>
                <span className={styles.score}>
                  {Math.round(s.score * 100)}%
                </span>
                <div className={styles.scoreBar}>
                  <div
                    className={styles.scoreFill}
                    style={{ width: `${s.score * 100}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer — latency + source */}
      {(latencyMs != null || source) && (
        <div className={styles.footer}>
          {latencyMs != null && (
            <span className={styles.latency}>
              <Zap size={12} />
              {latencyMs.toFixed(1)}ms
            </span>
          )}
          {source && (
            <Badge variant={sourceBadgeVariant(source)}>
              <Clock size={10} />
              &nbsp;{source}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
