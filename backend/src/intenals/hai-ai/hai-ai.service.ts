import { logger } from "@/configs/logger.ts";
import { AppError, ERROR_CODE } from "@/shared/errors/error-factory.ts";

export interface HaiIntentRequest {
  query: string;
  boost?: boolean;
}

export interface HaiIntentResponse {
  raw: string;
  normalized_query: string;
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  source: string;
}

export interface HaiSemanticSearchRequest {
  query: string;
  top_k?: number;
}

export interface HaiSemanticSearchResult {
  poi_id: string;
  name: string;
  category: string;
  district: string;
  city: string;
  rating: number | null;
  review_count: number;
  score: number;
  reasons: string[];
  signals: Record<string, number>;
}

export interface HaiSemanticSearchResponse {
  query: string;
  understanding: HaiIntentResponse;
  required_attributes: string[];
  results: HaiSemanticSearchResult[];
}

export interface HaiAutocompleteRequest {
  q: string;
  lat?: number;
  lng?: number;
  limit?: number;
}

interface HaiAutocompleteItem {
  text?: string;
  display?: string | null;
  type?: string;
  score?: number;
}

interface HaiAutocompleteResponse {
  suggestions?: HaiAutocompleteItem[];
  latencyMs?: number | null;
  source?: string;
}

export interface RouteMateLatLng {
  lat: number;
  lng: number;
}

export interface RouteMatePlanRequestBody {
  origin: RouteMateLatLng;
  destination: { name: string; lat?: number; lng?: number };
  vehicle_type: string;
  distance_km?: number;
  duration_min?: number;
  free_text?: string;
  use_llm?: boolean;
  corridor_km?: number;
  limit_per_need?: number;
  route_polyline?: RouteMateLatLng[];
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
  source?: string;
}

export interface RouteMateGroup {
  need_key: string;
  category: string;
  label: string;
  why?: string;
  recommendations: RouteMateRecommendation[];
}

export interface RouteMatePlanResponse {
  origin: RouteMateLatLng;
  destination: RouteMateLatLng;
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

export interface HaiAiServiceDeps {
  baseUrl?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

const DEFAULT_ML_SERVICE_URL = "http://localhost:8100";
const DEFAULT_TIMEOUT_MS = 5_000;
// The RouteMate corridor plan can run an optional LLM need-prediction pass, so
// it gets a longer budget than the real-time understand/search/autocomplete calls.
const ROUTEMATE_TIMEOUT_MS = 30_000;

export const createHaiAiService = (deps: HaiAiServiceDeps = {}) => {
  const baseUrl = (deps.baseUrl ?? Deno.env.get("ML_SERVICE_URL") ??
    DEFAULT_ML_SERVICE_URL).replace(/\/$/, "");
  const fetcher = deps.fetcher ?? globalThis.fetch;
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function request<T>(
    path: string,
    init?: RequestInit,
    overrideTimeoutMs?: number,
  ): Promise<T> {
    try {
      const response = await fetcher(`${baseUrl}${path}`, {
        ...init,
        signal: AbortSignal.timeout(overrideTimeoutMs ?? timeoutMs),
      });
      if (!response.ok) {
        throw new Error(`Hai ML service returned HTTP ${response.status}`);
      }
      return await response.json() as T;
    } catch (error) {
      logger.error("Hai ML service request failed", error);
      throw new AppError(ERROR_CODE.AI_SERVICE_UNAVAILABLE, {
        service: "hai-ml-service",
        baseUrl,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    intentSearch(input: HaiIntentRequest): Promise<HaiIntentResponse> {
      return request<HaiIntentResponse>("/understand", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: input.query,
          boost: input.boost ?? false,
        }),
      });
    },

    semanticSearch(
      input: HaiSemanticSearchRequest,
    ): Promise<HaiSemanticSearchResponse> {
      return request<HaiSemanticSearchResponse>("/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: input.query, top_k: input.top_k ?? 5 }),
      });
    },

    autocomplete(
      input: HaiAutocompleteRequest,
    ): Promise<HaiAutocompleteResponse> {
      const params = new URLSearchParams({
        q: input.q,
        k: String(input.limit ?? 10),
      });
      if (input.lat !== undefined) params.set("lat", String(input.lat));
      if (input.lng !== undefined) params.set("lng", String(input.lng));
      return request<HaiAutocompleteResponse>(
        `/autocomplete/hai?${params.toString()}`,
      );
    },

    routematePlan(
      input: RouteMatePlanRequestBody,
    ): Promise<RouteMatePlanResponse> {
      return request<RouteMatePlanResponse>("/routemate/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      }, ROUTEMATE_TIMEOUT_MS);
    },

    health(): Promise<Record<string, unknown>> {
      return request<Record<string, unknown>>("/health");
    },
  };
};

export type HaiAiService = ReturnType<typeof createHaiAiService>;

export const haiAiService = createHaiAiService();
