/**
 * API client for Track 4 Autocomplete.
 * Fetches suggestions via Next.js proxy → backend at localhost:8000.
 */

import { API } from "@/lib/constants";

export interface Suggestion {
  text: string;      // normalized (accent-free)
  display: string;   // with Vietnamese diacritics
  type: string;      // Brand Search, Category Search, POI, etc.
  score: number;     // 0-1
}

export interface AutocompleteResponse {
  suggestions: Suggestion[];
  latencyMs: number;
  source: "exact" | "fuzzy" | "embedding" | "popular" | "empty";
}

interface FetchSuggestionsOptions {
  lat?: number;
  lng?: number;
  limit?: number;
}

/**
 * Fetch autocomplete suggestions from backend.
 * @param query — search query string
 * @param options — optional lat/lng for geo-boosting, limit
 * @param signal — AbortSignal for request cancellation
 */
export async function fetchSuggestions(
  query: string,
  options?: FetchSuggestionsOptions,
  signal?: AbortSignal,
): Promise<AutocompleteResponse> {
  const params = new URLSearchParams({ q: query });

  if (options?.lat != null) params.set("lat", String(options.lat));
  if (options?.lng != null) params.set("lng", String(options.lng));
  if (options?.limit != null) params.set("limit", String(options.limit));

  const res = await fetch(`${API.TRACK4_SUGGEST}?${params}`, { signal });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
