import { Trie } from "./track-4-autocomplete.trie.ts";
import { track4Repo } from "./track-4-autocomplete.repo.ts";
import {
  buildAbbreviationMap,
  generatePrefixes,
  normalize,
} from "./track-4-autocomplete.nlp.ts";
import {
  scoreAutocomplete,
  scorePOI,
  scorePopularQuery,
  scoreTemplate,
} from "./track-4-autocomplete.scorer.ts";
import { logger } from "@/configs/logger.ts";

export interface BuildStats {
  version: number;
  buildTime: string;
  trieJson: string;
  totalNodes: number;
  totalPairs: number;
  sourceCounts: Record<string, number>;
}

export async function buildSnapshot(): Promise<BuildStats> {
  const trie = new Trie();
  const sourceCounts: Record<string, number> = {};
  let totalPairs = 0;

  const abbreviations = await track4Repo.getAllAbbreviations();
  const _abbrMap = buildAbbreviationMap(abbreviations);

  const acEntries = await track4Repo.getAllAutocompleteEntries();
  for (const entry of acEntries) {
    const normalized = normalize(entry.suggestionText);
    const prefixes = generatePrefixes(normalized, 2);
    for (const prefix of prefixes) {
      const score = scoreAutocomplete(
        Number(entry.score),
        entry.queryFrequency,
        prefix.length,
        normalized.length,
        entry.isGenerated,
      );
      trie.insert(prefix, {
        text: normalized,
        display: entry.suggestionText,
        type: entry.suggestionType,
        score,
      });
      totalPairs++;
      const src = entry.isGenerated ? "ac_generated" : "ac_ground_truth";
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }
  }

  const pois = await track4Repo.getAllPois();
  const categories = new Set<string>();
  const brands = new Set<string>();

  for (const poi of pois) {
    if (poi.category) categories.add(poi.category);
    if (poi.brand) brands.add(poi.brand);

    const poiName = poi.poiName;
    if (poiName) {
      const normalizedName = normalize(poiName);
      const namePrefixes = generatePrefixes(normalizedName, 2);
      for (const prefix of namePrefixes) {
        const s = scorePOI(poi.popularityScore ?? 50);
        trie.insert(prefix, {
          text: normalizedName,
          display: poiName,
          type: "POI Suggestion",
          score: s,
        });
        totalPairs++;
        sourceCounts["poi_name"] = (sourceCounts["poi_name"] || 0) + 1;
      }
    }
  }

  for (const cat of categories) {
    const catNorm = normalize(cat);
    const fullText = catNorm + " gan day";
    const displayText = cat + " gần đây";
    const prefixes = generatePrefixes(fullText, 2);
    const sc = scoreTemplate("category_nearby");
    for (const prefix of prefixes) {
      trie.insert(prefix, {
        text: fullText,
        display: displayText,
        type: "Category Search",
        score: sc,
      });
      totalPairs++;
      sourceCounts["template_category_nearby"] =
        (sourceCounts["template_category_nearby"] || 0) + 1;
    }
  }

  for (const brand of brands) {
    const brandNorm = normalize(brand);
    const fullText = brandNorm + " gan nhat";
    const displayText = brand + " gần nhất";
    const prefixes = generatePrefixes(fullText, 2);
    const sc = scoreTemplate("brand_nearby");
    for (const prefix of prefixes) {
      trie.insert(prefix, {
        text: fullText,
        display: displayText,
        type: "Brand Search",
        score: sc,
      });
      totalPairs++;
      sourceCounts["template_brand_nearby"] =
        (sourceCounts["template_brand_nearby"] || 0) + 1;
    }
  }

  const popularQueries = await track4Repo.getAllPopularQueries();
  for (const pq of popularQueries) {
    const normalized = normalize(pq.queryText);
    const prefixes = generatePrefixes(normalized, 2);
    const score = scorePopularQuery(pq.monthlyFrequency, pq.isGenerated);
    for (const prefix of prefixes) {
      trie.insert(prefix, {
        text: normalized,
        display: pq.queryText,
        type: pq.intentType,
        score,
      });
      totalPairs++;
      const src = pq.isGenerated ? "pq_generated" : "pq_original";
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }
  }

  const trieJson = trie.toJSON();

  function countNodes(obj: Record<string, unknown>): number {
    let count = 1;
    const children = obj.c as
      | Record<string, Record<string, unknown>>
      | undefined;
    if (children) {
      for (const child of Object.values(children)) {
        count += countNodes(child);
      }
    }
    return count;
  }
  const parsedRoot = JSON.parse(trieJson);
  const totalNodes = countNodes(parsedRoot as Record<string, unknown>);

  const snapshotPath = "./src/modules/track-4-autocomplete/data/snapshot.json";
  const snapshot: BuildStats = {
    version: 1,
    buildTime: new Date().toISOString(),
    trieJson,
    totalNodes,
    totalPairs,
    sourceCounts,
  };
  await Deno.writeTextFile(snapshotPath, JSON.stringify(snapshot));

  logger.info({
    buildTime: snapshot.buildTime,
    totalNodes,
    totalPairs,
    sourceCounts,
  }, "Build complete, snapshot saved");
  return snapshot;
}
