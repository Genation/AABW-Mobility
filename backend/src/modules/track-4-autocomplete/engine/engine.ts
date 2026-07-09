import { Trie } from "../core/trie.ts";
import { normalize, buildAbbreviationMap } from "../core/nlp.ts";
import { generateStrategies } from "./classifier.ts";
import {
  generateSuggestions,
} from "../builder/templates.ts";
import { rank } from "../core/ranker.ts";
import type { CandidateEntry } from "../core/ranker.ts";
import { track4Repo } from "../repo/repo.ts";
import { logger } from "@/configs/logger.ts";
import type { BuildStats } from "../builder/builder.ts";

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

const COORD_RE = /^\d{1,2}\.\d{1,6}(,\s*\d{1,3}\.\d{1,6})?$/;
const ADDR_NUM_RE = /^(\d+)\s+(.+)$/;

function tryCoordinate(input: string): SuggestResult | null {
  const trimmed = input.trim();
  if (!COORD_RE.test(trimmed)) return null;
  const parts = trimmed.split(",");
  const lat = Number.parseFloat(parts[0]);
  if (parts.length >= 2) {
    const lng = Number.parseFloat(parts[1]);
    return { text: `${lat},${lng}`, display: `${lat},${lng}`, type: "Coordinate Search", score: 1.0 };
  }
  return { text: `${lat},106.7009`, display: `${lat},106.7009`, type: "Coordinate Search", score: 0.95 };
}

function tryAddressNumber(input: string): SuggestResult | null {
  const match = input.trim().match(ADDR_NUM_RE);
  if (!match) return null;
  const num = match[1];
  const rest = match[2].trim();
  const display = `${num} ${rest.charAt(0).toUpperCase() + rest.slice(1)}`;
  return { text: normalize(display), display, type: "Address Suggestion", score: 0.90 };
}

function getRegionFromLatLng(lat: number, lng: number): string {
  if (lat > 10.65 && lat < 10.85 && lng > 106.55 && lng < 106.80) return "TP.HCM";
  if (lat > 20.95 && lat < 21.10 && lng > 105.75 && lng < 105.95) return "Hà Nội";
  if (lat > 16.00 && lat < 16.15 && lng > 108.15 && lng < 108.30) return "Đà Nẵng";
  return "Toàn quốc";
}

export const createAutocompleteEngine = () => {
  let trie: Trie | null = null;
  const popularQueries: Map<string, SuggestResult[]> = new Map();
  let abbreviationMap: Map<string, string> = new Map();
  let loaded = false;

  async function load(snapshotOrPath?: string | BuildStats): Promise<void> {
    const abbreviations = await track4Repo.getAllAbbreviations();
    abbreviationMap = buildAbbreviationMap(abbreviations);

    if (typeof snapshotOrPath === "string") {
      try {
        const raw = await Deno.readTextFile(snapshotOrPath);
        const data = JSON.parse(raw);
        trie = Trie.fromJSON(data.trieJson);
        logger.info("Engine loaded from snapshot file");
      } catch (e) {
        logger.warn(e, "No snapshot file at path");
      }
    } else if (snapshotOrPath) {
      trie = Trie.fromJSON(snapshotOrPath.trieJson);
      logger.info("Engine loaded from build result");
    } else {
      try {
        const raw = await Deno.readTextFile(
          "./src/modules/track-4-autocomplete/data/snapshot.json",
        );
        const data = JSON.parse(raw);
        trie = Trie.fromJSON(data.trieJson);
        logger.info("Engine loaded from default snapshot");
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

    // Special handlers
    const coordResult = tryCoordinate(input);
    if (coordResult) {
      return { suggestions: [coordResult], latencyMs: performance.now() - t0, source: "exact" };
    }
    const addrResult = tryAddressNumber(input);
    if (addrResult) {
      return { suggestions: [addrResult], latencyMs: performance.now() - t0, source: "exact" };
    }

    // Generate ALL strategies — try everything, no gate
    const strategies = generateStrategies(input, abbreviationMap);
    const candidates: CandidateEntry[] = [];

    for (const strategy of strategies) {
      for (const form of strategy.forms) {
        const results = trie.search(form);
        if (results.length > 0) {
          const source = strategy.type === "abbreviation" ? "abbreviation" :
            strategy.type === "semantic" ? "semantic_template" :
            strategy.type === "mixed_language" ? "mixed_language" :
            strategy.type === "navigation" ? "navigation" :
            "exact_prefix";
          candidates.push({ suggestions: results, source });
        }
      }
    }

    // Template generation for semantic strategies (if no Trie hit)
    for (const strategy of strategies) {
      if (strategy.type !== "semantic") continue;
      const alreadyFound = candidates.some((c) =>
        c.source === "semantic_template" && c.suggestions.length > 0
      );
      if (alreadyFound) continue;

      const suggestions = generateSuggestions(
        strategy.parsed.category,
        strategy.parsed.attribute,
        strategy.parsed.location,
      );
      if (suggestions.length > 0) {
        candidates.push({
          suggestions: suggestions.map((s, i) => ({
            text: normalize(s),
            display: s,
            type: "Discovery Search",
            score: 0.75 - i * 0.05,
          })),
          source: "semantic_template",
        });
      }
    }

    if (candidates.length > 0) {
      const ranked = rank(candidates, limit);
      return {
        suggestions: ranked,
        latencyMs: performance.now() - t0,
        source: "exact",
      };
    }

    // Fuzzy fallback
    const fuzzy = trie.searchFuzzy(normalize(input), 1);
    if (fuzzy.length > 0) {
      const ranked = rank([{ suggestions: fuzzy, source: "fuzzy" }], limit);
      return { suggestions: ranked, latencyMs: performance.now() - t0, source: "fuzzy" };
    }

    // Popular fallback
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

export const autocompleteEngine = createAutocompleteEngine();

autocompleteEngine.load();
