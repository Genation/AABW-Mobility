import { AlertCircle, Clock, Search, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Suggestion, AutocompleteResponse } from "@/lib/api";
import styles from "./suggestion-list.module.css";

interface SuggestionListProps {
  suggestions: Suggestion[];
  latencyMs: number | null;
  source: AutocompleteResponse["source"] | null;
  isLoading: boolean;
  error: string | null;
  query: string;
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

/**
 * Suggestion dropdown — shows results, loading skeletons, error state.
 */
export function SuggestionList({
  suggestions,
  latencyMs,
  source,
  isLoading,
  error,
  query,
}: SuggestionListProps) {
  /* Empty state — no query */
  if (!query.trim() && !isLoading) {
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
      <ul className={styles.list}>
        {suggestions.map((s, i) => (
          <li key={`${s.text}-${i}`} className={styles.row}>
            <div className={styles.rowLeft}>
              <span className={styles.display}>{s.display}</span>
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
        ))}
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
