import { Trie } from "./track-4-autocomplete.trie.ts";
import type { Suggestion } from "./track-4-autocomplete.trie.ts";
import {
  buildAbbreviationMap,
  expandAbbreviations,
  normalize,
} from "./track-4-autocomplete.nlp.ts";
import { track4Repo } from "./track-4-autocomplete.repo.ts";
import { logger } from "@/configs/logger.ts";
import type { BuildStats } from "./track-4-autocomplete.builder.ts";

export interface SuggestOptions {
  lat?: number;
  lng?: number;
  region?: string;
  limit?: number;
}

export interface SuggestResult {
  text: string;
  display: string;
  type: string;
  score: number;
}

export interface SuggestResponse {
  suggestions: SuggestResult[];
  latencyMs: number;
  source: "exact" | "fuzzy" | "popular" | "empty";
}

function getRegionFromLatLng(lat: number, lng: number): string {
  if (lat > 10.65 && lat < 10.85 && lng > 106.55 && lng < 106.80) {
    return "TP.HCM";
  }
  if (lat > 20.95 && lat < 21.10 && lng > 105.75 && lng < 105.95) {
    return "Hà Nội";
  }
  if (lat > 16.00 && lat < 16.15 && lng > 108.15 && lng < 108.30) {
    return "Đà Nẵng";
  }
  return "Toàn quốc";
}

export const createAutocompleteEngine = () => {
  let trie: Trie | null = null;
  const popularQueries: Map<string, SuggestResult[]> = new Map();
  let abbreviationMap: Map<string, string> = new Map();
  let loaded = false;

  async function load(snapshotOrStats?: BuildStats): Promise<void> {
    const abbreviations = await track4Repo.getAllAbbreviations();
    abbreviationMap = buildAbbreviationMap(abbreviations);

    if (snapshotOrStats) {
      trie = Trie.fromJSON(snapshotOrStats.trieJson);
      logger.info("Engine loaded from build result");
    } else {
      try {
        const fileContent = await Deno.readTextFile(
          "./src/modules/track-4-autocomplete/data/snapshot.json",
        );
        const data = JSON.parse(fileContent) as BuildStats;
        trie = Trie.fromJSON(data.trieJson);
        logger.info("Engine loaded from snapshot file");
      } catch {
        logger.warn("No snapshot file, engine not loaded");
      }
    }

    const regions = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Toàn quốc"];
    for (const region of regions) {
      const queries = await track4Repo.getPopularByRegion(region, 10);
      popularQueries.set(
        region,
        queries.map((q) => ({
          text: normalize(q.queryText),
          display: q.queryText,
          type: q.intentType,
          score: q.monthlyFrequency / 15000,
        })),
      );
    }

    loaded = true;
  }

  function suggest(
    input: string,
    options: SuggestOptions = {},
  ): SuggestResponse {
    const t0 = performance.now();

    if (!trie || !loaded) {
      return { suggestions: [], latencyMs: 0, source: "empty" };
    }

    const limit = options.limit ?? 10;

    if (input.length < 2) {
      const region = options.region ?? "Toàn quốc";
      const popular = popularQueries.get(region) ??
        popularQueries.get("Toàn quốc") ?? [];
      return {
        suggestions: popular.slice(0, limit),
        latencyMs: performance.now() - t0,
        source: "popular",
      };
    }

    let query = expandAbbreviations(input, abbreviationMap);
    query = normalize(query);

    const exact = trie.search(query);
    if (exact.length > 0) {
      return {
        suggestions: exact.slice(0, limit).map(mapSuggestion),
        latencyMs: performance.now() - t0,
        source: "exact",
      };
    }

    const fuzzy = trie.searchFuzzy(query, 1);
    if (fuzzy.length > 0) {
      return {
        suggestions: fuzzy.slice(0, limit).map(mapSuggestion),
        latencyMs: performance.now() - t0,
        source: "fuzzy",
      };
    }

    const region = options.region ??
      (options.lat !== undefined
        ? getRegionFromLatLng(options.lat, options.lng ?? 0)
        : "Toàn quốc");
    const popular = popularQueries.get(region) ??
      popularQueries.get("Toàn quốc") ?? [];

    return {
      suggestions: popular.slice(0, limit),
      latencyMs: performance.now() - t0,
      source: "popular",
    };
  }

  function getStats() {
    return { loaded, trieLoaded: trie !== null };
  }

  return { load, suggest, getStats };
};

function mapSuggestion(s: Suggestion): SuggestResult {
  return { text: s.text, display: s.display, type: s.type, score: s.score };
}

export const autocompleteEngine = createAutocompleteEngine();

autocompleteEngine.load();
