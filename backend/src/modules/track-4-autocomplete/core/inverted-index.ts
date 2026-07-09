/**
 * Inverted Index — replaces character-Trie with a multi-key hash index.
 *
 * Architecture:
 *   Build-time: each suggestion is indexed under MANY query forms
 *   Query-time: user input is expanded into MANY search forms
 *   Overlap between the two sets = suggestion candidates
 *
 * This solves the "an gi" → "Ăn đêm gần đây" problem: the suggestion
 * is indexed under "an dem", "an dem gan day", "an", "dem", etc.
 * The query generates forms like "an gi", "an", "gi", "an dem" (if
 * "gi" has an abbreviation or intent mapping to "dem"), so they overlap.
 */

export interface Suggestion {
  text: string;
  display: string;
  type: string;
  score: number;
}

export interface IndexedSuggestion extends Suggestion {
  id: number;
  popularity: number;
  region?: string;
  lat?: number;
  lng?: number;
  category?: string;
  brand?: string;
  city?: string;
  tags?: string[];
}

export interface HitEntry {
  suggestionId: number;
  /** Which form generator matched */
  source: string;
  /** Longer key prefixes get higher weight (more specific) */
  keyLength: number;
  /** How many query tokens were covered by this match */
  matchedTokens: number;
}

export class InvertedIndex {
  private index: Map<string, HitEntry[]> = new Map();
  private suggestions: Map<number, IndexedSuggestion> = new Map();
  private nextId = 1;

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  addSuggestion(s: IndexedSuggestion): number {
    const id = this.nextId++;
    this.suggestions.set(id, { ...s, id });
    return id;
  }

  /**
   * Insert one query-form → suggestion mapping.
   * Multiple forms can point to the same suggestion.
   */
  insert(
    key: string,
    suggestionId: number,
    source: string,
    matchedTokens: number,
  ): void {
    if (key.length < 2) return;

    let entries = this.index.get(key);
    if (!entries) {
      entries = [];
      this.index.set(key, entries);
    }

    // Avoid exact duplicates
    const dup = entries.find(
      (e) => e.suggestionId === suggestionId && e.source === source,
    );
    if (dup) {
      if (key.length > dup.keyLength) dup.keyLength = key.length;
      if (matchedTokens > dup.matchedTokens) dup.matchedTokens = matchedTokens;
      return;
    }

    entries.push({
      suggestionId,
      source,
      keyLength: key.length,
      matchedTokens,
    });
  }

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  search(key: string): HitEntry[] {
    const exact = this.index.get(key);
    if (exact) return exact;

    // Prefix fallback: find all keys that start with the given prefix
    const results: HitEntry[] = [];
    const dedup = new Set<number>();

    for (const [k, entries] of this.index) {
      if (k.startsWith(key)) {
        for (const e of entries) {
          if (!dedup.has(e.suggestionId)) {
            dedup.add(e.suggestionId);
            results.push(e);
          }
        }
      }
    }

    return results;
  }

  /**
   * Search multiple query forms and aggregate results.
   * Returns deduplicated hits with accumulated match info.
   */
  searchBatch(keys: string[]): Map<number, HitEntry[]> {
    const agg = new Map<number, HitEntry[]>();

    for (const key of keys) {
      const hits = this.search(key);
      for (const hit of hits) {
        let list = agg.get(hit.suggestionId);
        if (!list) {
          list = [];
          agg.set(hit.suggestionId, list);
        }
        // Merge: keep best keyLength per source
        const existing = list.find((e) => e.source === hit.source);
        if (existing) {
          if (hit.keyLength > existing.keyLength) {
            existing.keyLength = hit.keyLength;
          }
          if (hit.matchedTokens > existing.matchedTokens) {
            existing.matchedTokens = hit.matchedTokens;
          }
        } else {
          list.push(hit);
        }
      }
    }

    return agg;
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  getSuggestion(id: number): IndexedSuggestion | undefined {
    return this.suggestions.get(id);
  }

  getSuggestionCount(): number {
    return this.suggestions.size;
  }

  getIndexSize(): number {
    return this.index.size;
  }

  getAllSuggestions(): ReadonlyMap<number, IndexedSuggestion> {
    return this.suggestions;
  }

  // ---------------------------------------------------------------------------
  // Serialization
  // ---------------------------------------------------------------------------

  toJSON(): string {
    const data = {
      nextId: this.nextId,
      suggestions: Array.from(this.suggestions.entries()),
      index: Array.from(this.index.entries()),
    };
    return JSON.stringify(data);
  }

  static fromJSON(json: string): InvertedIndex {
    const data = JSON.parse(json) as {
      nextId: number;
      suggestions: [number, IndexedSuggestion][];
      index: [string, HitEntry[]][];
    };
    const idx = new InvertedIndex();
    idx.nextId = data.nextId;
    idx.suggestions = new Map(data.suggestions);
    idx.index = new Map(data.index);
    return idx;
  }

  getStats() {
    return {
      suggestionCount: this.suggestions.size,
      indexSize: this.index.size,
    };
  }
}
