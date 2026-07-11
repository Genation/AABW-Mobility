import { haiAiService } from "@/intenals/hai-ai/hai-ai.service.ts";

/**
 * P9_hai — alternative autocomplete engine.
 *
 * Proxies to the Python `ml-service` FastAPI (Hai's trie + pattern layer, the
 * version that scores 1.00 recall / 1.00 type-accuracy on the Track 4 gold
 * set) and maps its response onto the same contract as `track-4/suggest`, so
 * the two engines can be compared side by side.
 *
 * Set ML_SERVICE_URL to point at the running ml-service (default :8100).
 */
export interface SuggestItem {
  text: string;
  display: string;
  type: string;
  score: number;
}

export interface SuggestResult {
  suggestions: SuggestItem[];
  latencyMs: number;
  source: string;
  engine: "P9_hai";
}

export const track4HaiService = {
  async suggest(
    input: string,
    options?: { lat?: number; lng?: number; limit?: number },
  ): Promise<SuggestResult> {
    const started = performance.now();
    const data = await haiAiService.autocomplete({
      q: input,
      lat: options?.lat,
      lng: options?.lng,
      limit: options?.limit,
    });
    const suggestions: SuggestItem[] = (data.suggestions ?? []).map((item) => ({
      text: String(item.text ?? item.display ?? ""),
      display: String(item.display ?? item.text ?? ""),
      type: String(item.type ?? "Category Search"),
      score: Number(item.score ?? 0),
    }));
    const source = String(data.source ?? "exact").replace(/^hai\s*·?\s*/, "");
    return {
      suggestions,
      latencyMs: data.latencyMs ?? +(performance.now() - started).toFixed(3),
      source: source || "exact",
      engine: "P9_hai",
    };
  },
};
