"use client";

import { useRef, useCallback, useState, useEffect, type KeyboardEvent } from "react";
import { useAutocomplete } from "@/hooks/use-autocomplete";
import { useRouteMap } from "@/hooks/use-route-map";
import { getMockCoordinates } from "@/lib/mock-coordinates";
import type { HistoryEntry } from "@/hooks/use-search-history";
import type { Suggestion } from "@/lib/api";
import { SearchBar } from "./search-bar";
import { SuggestionList } from "./suggestion-list";
import { FeatureCards } from "./feature-cards";
import { ArchitectureFlow } from "./architecture-flow";
import { RouteMapPanel, RouteMapEmpty } from "./route-map-panel";
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

interface SelectedDestination {
  lat: number;
  lng: number;
  name: string;
}

/**
 * Main Track 4 autocomplete demo panel.
 * Split layout: search panel (left) + map panel (right) on desktop.
 * Stacked on mobile: search on top, map below.
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
    selectSuggestion,
    isInHistory,
    recentHistory,
    removeFromHistory,
    clearHistory,
    showDropdown,
    setShowDropdown,
    activeIndex,
    setActiveIndex,
  } = useAutocomplete();

  const {
    userLocation,
    geoPermission,
    route,
    isLoadingRoute,
    routeError,
    fetchRoute,
    clearRoute,
  } = useRouteMap();

  const [selectedDestination, setSelectedDestination] =
    useState<SelectedDestination | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Fetch route when destination changes */
  useEffect(() => {
    if (selectedDestination) {
      fetchRoute({
        lat: selectedDestination.lat,
        lng: selectedDestination.lng,
      });
    }
  }, [selectedDestination, fetchRoute]);

  const totalItems = !query.trim()
    ? recentHistory.length
    : suggestions.length;

  /** Handle selecting a suggestion — triggers map */
  const handleSelectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      selectSuggestion(suggestion);

      // Generate mock coordinates for the selected suggestion
      const coords = getMockCoordinates(suggestion.text);
      setSelectedDestination({
        lat: coords.lat,
        lng: coords.lng,
        name: suggestion.display,
      });
    },
    [selectSuggestion],
  );

  /** Handle keyboard navigation */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          setShowDropdown(true);
          setActiveIndex(e.key === "ArrowDown" ? 0 : totalItems - 1);
          return;
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex(
            activeIndex < totalItems - 1 ? activeIndex + 1 : 0,
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setActiveIndex(
            activeIndex > 0 ? activeIndex - 1 : totalItems - 1,
          );
          break;

        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0) {
            if (!query.trim() && recentHistory.length > 0) {
              const entry = recentHistory[activeIndex];
              if (entry) handleSelectHistory(entry);
            } else if (suggestions[activeIndex]) {
              handleSelectSuggestion(suggestions[activeIndex]);
            }
          } else if (query.trim()) {
            handleSelectSuggestion({
              text: query.trim().toLowerCase(),
              display: query.trim(),
              type: "Search",
              score: 1.0,
            });
            inputRef.current?.blur();
          }
          break;

        case "Escape":
          e.preventDefault();
          setShowDropdown(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;

        default:
          break;
      }
    },
    [
      showDropdown,
      activeIndex,
      totalItems,
      query,
      recentHistory,
      suggestions,
      handleSelectSuggestion,
      setShowDropdown,
      setActiveIndex,
    ],
  );

  /** Handle focus — show dropdown */
  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setShowDropdown(true);
  }, [setShowDropdown]);

  /** Handle blur — delayed hide to allow click events */
  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
      setActiveIndex(-1);
    }, 200);
  }, [setShowDropdown, setActiveIndex]);

  /** Select from history — also triggers map */
  const handleSelectHistory = useCallback(
    (entry: HistoryEntry) => {
      const suggestion: Suggestion = {
        text: entry.text,
        display: entry.display,
        type: entry.type,
        score: 1.0,
      };
      handleSelectSuggestion(suggestion);
    },
    [handleSelectSuggestion],
  );

  /** Close map panel */
  const handleCloseMap = useCallback(() => {
    setSelectedDestination(null);
    clearRoute();
  }, [clearRoute]);

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

      {/* Split layout: Search + Map */}
      <div className={styles.splitLayout}>
        {/* Left: Search Panel */}
        <div className={styles.searchPanel}>
          {/* Search + Results */}
          <div className={styles.searchSection}>
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v);
                setShowDropdown(true);
              }}
              isLoading={isLoading}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
            />
            <SuggestionList
              suggestions={suggestions}
              latencyMs={latencyMs}
              source={source}
              isLoading={isLoading}
              error={error}
              query={query}
              onSelect={handleSelectSuggestion}
              isInHistory={isInHistory}
              activeIndex={activeIndex}
              recentHistory={recentHistory}
              onRemoveHistory={removeFromHistory}
              onClearHistory={clearHistory}
              onSelectHistory={handleSelectHistory}
              visible={showDropdown}
            />
          </div>

          {/* Example query chips */}
          <div className={styles.chips}>
            <span className={styles.chipsLabel}>Try:</span>
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                className={styles.chip}
                onClick={() => {
                  setQuery(q);
                  setShowDropdown(true);
                  inputRef.current?.focus();
                }}
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
        </div>

        {/* Right: Map Panel */}
        <div className={styles.mapPanel}>
          {selectedDestination ? (
            <RouteMapPanel
              userLocation={userLocation}
              destination={{
                lat: selectedDestination.lat,
                lng: selectedDestination.lng,
              }}
              destinationName={selectedDestination.name}
              route={route}
              isLoadingRoute={isLoadingRoute}
              routeError={routeError}
              geoPermission={geoPermission}
              onClose={handleCloseMap}
            />
          ) : (
            <RouteMapEmpty />
          )}
        </div>
      </div>

      {/* Architecture flow — shows matching pipeline step */}
      <ArchitectureFlow source={source} />

      {/* Feature cards */}
      <FeatureCards />
    </div>
  );
}
