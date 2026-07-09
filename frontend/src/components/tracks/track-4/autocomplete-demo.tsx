"use client";

import { useAutocomplete } from "@/hooks/use-autocomplete";
import { SearchBar } from "./search-bar";
import { SuggestionList } from "./suggestion-list";
import { FeatureCards } from "./feature-cards";
import { ArchitectureFlow } from "./architecture-flow";
import styles from "./autocomplete-demo.module.css";

const EXAMPLE_QUERIES = [
  "cafe",
  "atm",
  "ks da nang",
  "nguyen hue",
  "ben thanh",
  "benh vien",
  "vincom",
  "coffee near",
];

/**
 * Main Track 4 autocomplete demo panel.
 * Hero search → suggestions → example chips → features → architecture.
 */
export function AutocompleteDemo() {
  const {
    query,
    setQuery,
    suggestions,
    latencyMs,
    source,
    isLoading,
    error,
    queryCount,
  } = useAutocomplete();

  return (
    <div className={styles.container}>
      {/* Hero section */}
      <div className={styles.hero}>
        <h1 className={styles.title}>AI Autocomplete Engine</h1>
        <p className={styles.subtitle}>
          Type a query below to see real-time suggestions powered by Vietnamese NLP,
          fuzzy matching, and intent detection.
        </p>
      </div>

      {/* Search + Results */}
      <div className={styles.searchSection}>
        <SearchBar
          value={query}
          onChange={setQuery}
          isLoading={isLoading}
        />
        <SuggestionList
          suggestions={suggestions}
          latencyMs={latencyMs}
          source={source}
          isLoading={isLoading}
          error={error}
          query={query}
        />
      </div>

      {/* Example query chips */}
      <div className={styles.chips}>
        <span className={styles.chipsLabel}>Try:</span>
        {EXAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            className={styles.chip}
            onClick={() => setQuery(q)}
            type="button"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Stats */}
      {queryCount > 0 && (
        <div className={styles.stats}>
          <span className={styles.statItem}>
            Queries: <strong>{queryCount}</strong>
          </span>
        </div>
      )}

      {/* Architecture flow — shows matching pipeline step */}
      <ArchitectureFlow source={source} />

      {/* Feature cards */}
      <FeatureCards />
    </div>
  );
}
