"use client";

import { useCallback, useRef, useState } from "react";
import { fetchSuggestions, type Suggestion } from "@/lib/api";
import { API } from "@/lib/constants";

const SUGGEST_DEBOUNCE_MS = 180;
const SUGGEST_LIMIT = 6;

/** Debounced autocomplete-as-you-type, shared by SmartLocationInput and AISuggestions. */
export function usePoiSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestSuggestions = useCallback((value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetchSuggestions(
          value.trim(),
          { limit: SUGGEST_LIMIT, endpoint: API.TRACK4_HAI_SUGGEST },
          ac.signal,
        );
        setSuggestions(res.suggestions ?? []);
      } catch {
        // best-effort
      }
    }, SUGGEST_DEBOUNCE_MS);
  }, []);

  const clearSuggestions = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSuggestions([]);
  }, []);

  return { suggestions, requestSuggestions, clearSuggestions };
}
