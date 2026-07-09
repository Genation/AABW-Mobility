/**
 * Ranker — Multi-source merge and re-rank.
 *
 * Merges candidate suggestions from different retrieval branches,
 * applies source-based boost weights, deduplicates by display text,
 * and returns a unified ranked list.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RankedSuggestion {
  text: string;
  display: string;
  type: string;
  score: number;
}

export interface CandidateEntry {
  suggestions: RankedSuggestion[];
  source: string;
}

// ---------------------------------------------------------------------------
// Source boost weights — higher = more reliable source
// ---------------------------------------------------------------------------

const SOURCE_BOOST: Record<string, number> = {
  "ground_truth": 1.00,
  "exact_prefix": 0.95,
  "abbreviation": 0.85,
  "coordinate": 1.00,
  "address_number": 1.00,
  "semantic_template": 0.75,
  "mixed_language": 0.70,
  "navigation": 0.65,
  "brand_template": 0.80,
  "fuzzy": 0.60,
  "embedding": 0.50,
  "popular": 0.30,
  "fallback": 0.20,
};

// ---------------------------------------------------------------------------
// Rank
// ---------------------------------------------------------------------------

/**
 * Merge and rank candidates from multiple sources.
 * Source boost multiplies the raw score based on reliability of the source.
 * Deduplicates by display text, keeping the highest scored entry.
 */
export function rank(
  candidates: CandidateEntry[],
  limit: number,
): RankedSuggestion[] {
  const scored: (RankedSuggestion & { source: string })[] = [];

  for (const entry of candidates) {
    const boost = SOURCE_BOOST[entry.source] ?? 0.50;
    for (const s of entry.suggestions) {
      scored.push({
        text: s.text,
        display: s.display,
        type: s.type,
        score: s.score * boost,
        source: entry.source,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const result: RankedSuggestion[] = [];
  for (const item of scored) {
    if (!seen.has(item.display)) {
      seen.add(item.display);
      result.push({
        text: item.text,
        display: item.display,
        type: item.type,
        score: Math.round(item.score * 10000) / 10000,
      });
    }
  }

  return result.slice(0, limit);
}
