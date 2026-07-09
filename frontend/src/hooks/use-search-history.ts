"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "track4-search-history";
const MAX_HISTORY = 20;

export interface HistoryEntry {
  text: string;
  display: string;
  type: string;
  timestamp: number;
}

/**
 * Hook: manages search history in localStorage.
 * - Stores up to MAX_HISTORY recent selections
 * - Provides add/remove/clear/check operations
 * - Filters history by query for inline display
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  /* Load from localStorage on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryEntry[];
        setHistory(parsed);
      }
    } catch {
      /* Ignore parse errors */
    }
  }, []);

  /* Persist whenever history changes */
  const persist = useCallback((entries: HistoryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* Quota exceeded — silently fail */
    }
  }, []);

  /** Add a selection to history (deduplicate by text, move to front) */
  const addToHistory = useCallback(
    (entry: Omit<HistoryEntry, "timestamp">) => {
      setHistory((prev) => {
        const filtered = prev.filter(
          (h) => h.text.toLowerCase() !== entry.text.toLowerCase(),
        );
        const next = [
          { ...entry, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_HISTORY);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  /** Remove a single history entry */
  const removeFromHistory = useCallback(
    (text: string) => {
      setHistory((prev) => {
        const next = prev.filter(
          (h) => h.text.toLowerCase() !== text.toLowerCase(),
        );
        persist(next);
        return next;
      });
    },
    [persist],
  );

  /** Clear all history */
  const clearHistory = useCallback(() => {
    setHistory([]);
    persist([]);
  }, [persist]);

  /** Check if a suggestion text exists in history */
  const isInHistory = useCallback(
    (text: string): boolean => {
      return history.some(
        (h) => h.text.toLowerCase() === text.toLowerCase(),
      );
    },
    [history],
  );

  /** Get recent history filtered by optional query prefix */
  const getFilteredHistory = useCallback(
    (query?: string, limit = 5): HistoryEntry[] => {
      if (!query?.trim()) {
        return history.slice(0, limit);
      }
      const q = query.toLowerCase();
      return history
        .filter((h) => h.display.toLowerCase().includes(q))
        .slice(0, limit);
    },
    [history],
  );

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    isInHistory,
    getFilteredHistory,
  };
}
