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
  lat?: number;      // real POI coordinate, only present when resolved from a POI row
  lng?: number;
  category?: string;
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
  /** Override the suggest endpoint (defaults to Phong's Track-4 service). */
  endpoint?: string;
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

  const endpoint = options?.endpoint ?? API.TRACK4_SUGGEST;
  const res = await fetch(`${endpoint}?${params}`, { signal });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/* ----------------------------- RouteMate ------------------------------- */

export type VehicleType = "ev" | "petrol";

export interface RmLatLng {
  lat: number;
  lng: number;
}

export interface RouteMatePlanBody {
  origin: RmLatLng;
  destination: { name: string; lat?: number; lng?: number };
  vehicle_type: VehicleType;
  distance_km?: number;
  duration_min?: number;
  free_text?: string;
  use_llm?: boolean;
  corridor_km?: number;
  limit_per_need?: number;
  route_polyline?: RmLatLng[];
  attributes?: string[];
  attributes_by_need?: Record<string, string[]>;
}

export interface RouteMateRecommendation {
  poi_id: string;
  name: string;
  category: string;
  brand?: string | null;
  address?: string;
  city?: string;
  lat: number;
  lng: number;
  rating?: number | null;
  review_count?: number;
  score: number;
  reasons: string[];
  detour_km: number;
  detour_min: number;
  progress?: number;
  progress_km?: number;
  source?: string;
}

export interface SliderBounds {
  default: number;
  min: number;
  max: number;
}

export interface RouteMateGroup {
  need_key: string;
  category: string;
  categories?: string[];
  label: string;
  why?: string;
  slider?: SliderBounds | null;
  target_default?: number | null;
  recommendations: RouteMateRecommendation[];
}

export interface RouteMatePlanResponse {
  origin: RmLatLng;
  destination: RmLatLng;
  destination_name: string;
  vehicle_type: string;
  route_length_km: number;
  corridor_km: number;
  needs: string[];
  groups: RouteMateGroup[];
  source: string;
  understanding?: Record<string, unknown> | null;
  diagnostics?: Record<string, unknown>;
}

/** Plan a route-aware discovery trip (RouteMate). */
export async function planRoute(
  body: RouteMatePlanBody,
  signal?: AbortSignal,
): Promise<RouteMatePlanResponse> {
  const res = await fetch(API.ROUTEMATE_PLAN, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/* ---------------- P6 understanding + P7 semantic search ------------------ */
/* Powers the RouteMate map's unified discovery search: P6 explains the query,
   P7 returns ranked candidate places (with real lat/lng) to plot on the map. */

export interface UnderstandResult {
  raw: string;
  normalized_query: string;
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  source: string;
}

/** A single ranked place from P7. `lat`/`lng` come straight from the dataset
    row, so candidates can be dropped on the map as markers. */
export interface PlaceCandidate {
  poi_id: string;
  name: string;
  display_name?: string;
  address?: string;
  category: string;
  district?: string;
  city?: string;
  brand?: string | null;
  lat?: number | null;
  lng?: number | null;
  rating?: number | null;
  review_count?: number;
  score: number;
  reasons: string[];
  signals?: Record<string, number>;
}

export interface SemanticSearchResponse {
  query: string;
  understanding: UnderstandResult;
  required_attributes: string[];
  excluded_attributes?: string[];
  results: PlaceCandidate[];
  diagnostics?: Record<string, unknown>;
}

/** P6 — turn a noisy query into a normalized query + intent + entities. */
export async function understandQuery(
  query: string,
  signal?: AbortSignal,
): Promise<UnderstandResult> {
  const res = await fetch(API.TRACK1_HAI_UNDERSTAND, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, boost: false }),
    signal,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** P7 — rank candidate places for a need. Each result carries lat/lng. */
export async function searchPlaces(
  query: string,
  topK = 10,
  signal?: AbortSignal,
): Promise<SemanticSearchResponse> {
  const res = await fetch(API.TRACK2_HAI_SEARCH, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, top_k: topK }),
    signal,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
