"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSuggestions } from "@/lib/api";
import type { AutocompleteResponse, Suggestion } from "@/lib/api";
import { useSearchHistory } from "./use-search-history";

const DEBOUNCE_MS = 200;

export interface UseAutocompleteReturn {
  query: string;
  setQuery: (q: string) => void;
  suggestions: Suggestion[];
  latencyMs: number | null;
  source: AutocompleteResponse["source"] | null;
  isLoading: boolean;
  error: string | null;
  queryCount: number;
  /* New: interaction support */
  selectSuggestion: (suggestion: Suggestion) => void;
  isInHistory: (text: string) => boolean;
  recentHistory: import("./use-search-history").HistoryEntry[];
  removeFromHistory: (text: string) => void;
  clearHistory: () => void;
  showDropdown: boolean;
  setShowDropdown: (v: boolean) => void;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
}

/**
 * Hook: debounced autocomplete with AbortController.
 * - Debounces input by 200ms
 * - Cancels in-flight requests on new input
 * - Returns suggestions, latency, source, loading, error
 * - Integrates search history for Google-style UX
 */
export function useAutocomplete(): UseAutocompleteReturn {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [source, setSource] = useState<AutocompleteResponse["source"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryCount, setQueryCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    addToHistory,
    removeFromHistory,
    clearHistory,
    isInHistory,
    getFilteredHistory,
  } = useSearchHistory();

  const doFetch = useCallback(async (q: string) => {
    /* Cancel previous request */
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const trimmed = q.trim();
    if (!trimmed) {
      setSuggestions([]);
      setLatencyMs(null);
      setSource(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSuggestions(trimmed, { limit: 10 }, controller.signal);
      setSuggestions(data.suggestions);
      setLatencyMs(data.latencyMs);
      setSource(data.source);
      setQueryCount((prev) => prev + 1);
      setIsLoading(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return; // Request was cancelled — don't touch state
      }
      setError("API unavailable. Check backend connection.");
      setSuggestions([]);
      setIsLoading(false);
    }
  }, []);

  /** Select a suggestion — fill input, save to history */
  const selectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      setQuery(suggestion.display);
      addToHistory({
        text: suggestion.text,
        display: suggestion.display,
        type: suggestion.type,
      });
      setShowDropdown(false);
      setActiveIndex(-1);
    },
    [addToHistory],
  );

  /** Recent history entries (for empty-state display) */
  const recentHistory = getFilteredHistory(undefined, 8);

  /* Debounce query changes */
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    /* Reset active index on query change */
    setActiveIndex(-1);

    debounceRef.current = setTimeout(() => {
      doFetch(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, doFetch]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return {
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
  };
}
