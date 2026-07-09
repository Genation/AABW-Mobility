/**
 * Signature Generator — Build-time index key generation.
 *
 * For each suggestion, generates multiple "query signatures" (index keys)
 * using different strategies. A suggestion is findable by ANY of its
 * signatures, not just character prefixes of the full text.
 *
 * Strategy overview:
 *   1. PREFIX     — character prefixes of full normalized text (like old Trie)
 *   2. SUFFIX     — skip first word(s), prefix the rest
 *   3. WORD       — each individual word as a standalone key
 *   4. BIGRAM     — consecutive word pairs with prefix variance
 *   5. TRIGRAM    — consecutive word triplets with prefix variance
 *   6. ABBREV     — abbreviated forms using the abbrev dictionary
 *   7. CANONICAL  — map to canonical category/brand names
 *   8. SLANG      — slang → standard intent mappings
 *   9. CROSSLANG  — English ↔ Vietnamese equivalents
 *   10. REVERSE   — reversed word order (city-first, etc.)
 *   11. JOINED    — no-space variants (cayxang, sieuthi)
 *   12. INTENT    — intent keyword → specific suggestion mapping
 */

import { normalize } from "./nlp.ts";
import type { IndexedSuggestion } from "./inverted-index.ts";

// ---------------------------------------------------------------------------
// Signature entry — describes one (key → suggestion) insertion
// ---------------------------------------------------------------------------

export interface SigInsert {
  key: string;
  source: string;
  matchedTokens: number;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface SigGenConfig {
  abbrevMap: Map<string, string>;
  /** Mapping from slang term → standard concept */
  slangMap: Map<string, string[]>;
  /** Intent keyword → specific suggestion display texts */
  intentMap: Map<string, string[]>;
  /** English → Vietnamese translation pairs */
  crossLangMap: Map<string, string>;
  /** Words that should be preserved with spaces removed for joined indexing */
  joinableCompounds: Set<string>;
  /** All known city names (for reverse-order indexing) */
  cities: Set<string>;
  /** All known categories (for canonical indexing) */
  categories: Set<string>;
  /** All known brands */
  brands: Set<string>;
}

// ---------------------------------------------------------------------------
// Default slang map (can be extended)
// ---------------------------------------------------------------------------

export const DEFAULT_SLANG_MAP: Map<string, string[]> = new Map([
  ["song ao", ["check in", "check-in"]],
  ["cf", ["ca phe", "cà phê"]],
  ["gara", ["sua chua o to", "oto"]],
  ["24 7", ["mo cua 24 7"]],
  ["hoc bai", ["hoc tap", "hoc"]],
  ["lam viec", ["lam viec"]],
  ["an gi", ["an dem", "an uong", "an vat"]],
  ["dep", ["check in", "song ao"]],
]);

// ---------------------------------------------------------------------------
// Default cross-language map
// ---------------------------------------------------------------------------

export const DEFAULT_CROSSLANG_MAP: Map<string, string> = new Map([
  ["hotel", "khach san"],
  ["restaurant", "nha hang"],
  ["coffee", "ca phe"],
  ["cafe", "ca phe"],
  ["beach", "bien"],
  ["atm", "atm"],
  ["halal", "halal"],
  ["vegan", "chay"],
  ["rooftop", "rooftop"],
  ["bar", "bar"],
  ["mall", "trung tam thuong mai"],
  ["parking", "bai do xe"],
  ["pharmacy", "nha thuoc"],
  ["hospital", "benh vien"],
  ["bank", "ngan hang"],
  ["gym", "phong gym"],
  ["gas", "tram xang"],
  ["station", "tram"],
  ["market", "cho"],
  ["airport", "san bay"],
]);

// ---------------------------------------------------------------------------
// Default joinable compounds
// ---------------------------------------------------------------------------

export const DEFAULT_JOINABLE: Set<string> = new Set([
  "sieuthi",
  "cayxang",
  "tramxang",
  "benhvien",
  "nhahang",
  "quanan",
  "khachsan",
  "cuahang",
  "nhathuoc",
  "phonggym",
  "tramsac",
  "trungtam",
  "ca phe",
  "ca phe",
]);

// ---------------------------------------------------------------------------
// Generator factory
// ---------------------------------------------------------------------------

export const createSignatureGenerator = (config: SigGenConfig) => {
  const { abbrevMap, slangMap, intentMap, crossLangMap, cities, categories } = config;

  /**
   * Generate all index keys for one suggestion, using all strategies.
   */
  function generate(s: IndexedSuggestion): SigInsert[] {
    const results: SigInsert[] = [];
    const norm = normalize(s.display);
    const words = norm.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) return results;

    // --- 1. PREFIX: all character prefixes of full text (min length 2) ---
    for (let i = 2; i <= norm.length; i++) {
      results.push({
        key: norm.slice(0, i),
        source: "prefix",
        matchedTokens: words.length,
      });
    }

    // --- 2. SUFFIX: skip first N words, prefix the remaining ---
    for (let skip = 1; skip < words.length; skip++) {
      const suffixText = words.slice(skip).join(" ");
      for (let i = 2; i <= suffixText.length; i++) {
        results.push({
          key: suffixText.slice(0, i),
          source: "suffix",
          matchedTokens: words.length - skip,
        });
      }
    }

    // --- 3. WORD: each individual word ---
    for (const word of words) {
      if (word.length >= 2) {
        results.push({ key: word, source: "word", matchedTokens: 1 });
      }
      // Also prefix of each word for partial typing
      for (let i = 2; i <= word.length; i++) {
        results.push({
          key: word.slice(0, i),
          source: "word_prefix",
          matchedTokens: 1,
        });
      }
    }

    // --- 4. BIGRAM: consecutive word pairs ---
    for (let i = 0; i < words.length - 1; i++) {
      const bg = words[i] + " " + words[i + 1];
      for (let j = 2; j <= bg.length; j++) {
        results.push({
          key: bg.slice(0, j),
          source: "bigram",
          matchedTokens: 2,
        });
      }
    }

    // --- 5. TRIGRAM: consecutive word triplets ---
    for (let i = 0; i < words.length - 2; i++) {
      const tg = words[i] + " " + words[i + 1] + " " + words[i + 2];
      for (let j = 3; j <= tg.length; j++) {
        results.push({
          key: tg.slice(0, j),
          source: "trigram",
          matchedTokens: 3,
        });
      }
    }

    // --- 6. ABBREV: generate abbreviated forms of the text ---
    const abbrWords = words.map((w) => {
      // Find if this word is an expanded form of some abbreviation
      for (const [abbr, expanded] of abbrevMap) {
        if (normalize(expanded) === w) return abbr;
      }
      return null;
    });

    if (abbrWords.some((a) => a !== null)) {
      const abbrevText = words.map((w, i) => abbrWords[i] ?? w).join(" ");
      for (let i = 2; i <= abbrevText.length; i++) {
        results.push({
          key: abbrevText.slice(0, i),
          source: "abbrev",
          matchedTokens: words.length,
        });
      }
    }

    // --- 7. CANONICAL: normalize category/brand names ---
    for (const cat of categories) {
      const catNorm = normalize(cat);
      if (norm.includes(catNorm)) {
        // Also index by common aliases
        const aliases = getCategoryAliases(catNorm);
        for (const alias of aliases) {
          const aliasText = norm.replace(catNorm, alias);
          for (let i = 2; i <= aliasText.length; i++) {
            results.push({
              key: aliasText.slice(0, i),
              source: "canonical",
              matchedTokens: words.length,
            });
          }
        }
      }
    }

    // --- 8. SLANG: slang → standard intent ---
    // If the suggestion display contains standard terms, index by slang too
    const displayNorm = normalize(s.display);
    for (const [slang, standards] of slangMap) {
      const matchesStandard = standards.some((std) =>
        displayNorm.includes(normalize(std))
      );
      if (matchesStandard) {
        // Index the suggestion under the slang term
        for (let i = 2; i <= slang.length; i++) {
          results.push({
            key: slang.slice(0, i),
            source: "slang",
            matchedTokens: 1,
          });
        }
        // Also index full text with slang replacement
        for (const std of standards) {
          const stdNorm = normalize(std);
          if (displayNorm.includes(stdNorm)) {
            const slangText = displayNorm.replace(stdNorm, slang);
            for (const [otherSlang, otherStds] of slangMap) {
              for (const otherStd of otherStds) {
                const otherNorm = normalize(otherStd);
                if (slangText.includes(otherNorm)) {
                  const multiSlangText = slangText.replace(otherNorm, otherSlang);
                  for (let i = 2; i <= multiSlangText.length; i++) {
                    results.push({
                      key: multiSlangText.slice(0, i),
                      source: "slang",
                      matchedTokens: words.length,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    // --- 9. CROSSLANG: English ↔ Vietnamese ---
    for (const [en, vi] of crossLangMap) {
      const viNorm = normalize(vi);
      const enNorm = normalize(en);

      if (norm.includes(viNorm)) {
        // Index with English replacement
        const enText = norm.replace(viNorm, enNorm);
        for (let i = 2; i <= enText.length; i++) {
          results.push({
            key: enText.slice(0, i),
            source: "crosslang",
            matchedTokens: words.length,
          });
        }
      }

      if (norm.includes(enNorm)) {
        // Index with Vietnamese replacement
        const viText = norm.replace(enNorm, viNorm);
        for (let i = 2; i <= viText.length; i++) {
          results.push({
            key: viText.slice(0, i),
            source: "crosslang",
            matchedTokens: words.length,
          });
        }
      }
    }

    // --- 10. REVERSE: city-first → category-first ordering ---
    if (cities.size > 0) {
      for (const city of cities) {
        const cityNorm = normalize(city);
        if (norm.startsWith(cityNorm)) {
          const rest = norm.slice(cityNorm.length).trim();
          if (rest.length > 0) {
            const reversed = rest + " " + cityNorm;
            for (let i = 2; i <= reversed.length; i++) {
              results.push({
                key: reversed.slice(0, i),
                source: "reverse",
                matchedTokens: words.length,
              });
            }
          }
        }
        if (norm.endsWith(cityNorm)) {
          const rest = norm.slice(0, -cityNorm.length).trim();
          if (rest.length > 0) {
            const reversed = cityNorm + " " + rest;
            for (let i = 2; i <= reversed.length; i++) {
              results.push({
                key: reversed.slice(0, i),
                source: "reverse",
                matchedTokens: words.length,
              });
            }
          }
        }
      }
    }

    // --- 11. JOINED: no-space variants ---
    const joined = words.join("");
    if (joined.length >= 2 && joined !== norm.replace(/\s+/g, "")) {
      // Only index if it's actually different from the already-indexed text
      for (let i = 2; i <= joined.length; i++) {
        results.push({
          key: joined.slice(0, i),
          source: "joined",
          matchedTokens: words.length,
        });
      }
    }

    // --- 12. INTENT: if this suggestion matches an intent mapping, index by the keyword ---
    for (const [keyword, targetDisplays] of intentMap) {
      for (const targetDisplay of targetDisplays) {
        const targetNorm = normalize(targetDisplay);
        // Check if this suggestion's display matches a target
        if (displayNorm.includes(targetNorm) || targetNorm.includes(displayNorm)) {
          for (let i = 2; i <= keyword.length; i++) {
            results.push({
              key: keyword.slice(0, i),
              source: "intent",
              matchedTokens: 1,
            });
          }
        }
      }
    }

    // De-duplicate by (key, source) — keep best matchedTokens
    const deduped = new Map<string, SigInsert>();
    for (const sig of results) {
      const compoundKey = `${sig.key}::${sig.source}`;
      const existing = deduped.get(compoundKey);
      if (!existing || sig.matchedTokens > existing.matchedTokens) {
        deduped.set(compoundKey, sig);
      }
    }

    return Array.from(deduped.values());
  }

  return { generate };
};

// ---------------------------------------------------------------------------
// Category alias map (for canonical indexing)
// ---------------------------------------------------------------------------

function getCategoryAliases(catNorm: string): string[] {
  const aliases: Record<string, string[]> = {
    "ca phe": ["cafe", "coffee", "cf"],
    "nha hang": ["restaurant", "quan an"],
    "khach san": ["hotel", "ks"],
    "tram xang": ["cay xang", "gas station"],
    "phong gym": ["gym", "phong tap"],
    "sieu thi": ["sieuthi", "supermarket"],
    "benh vien": ["benhvien", "hospital"],
    "nha thuoc": ["nhathuoc", "pharmacy"],
    "cua hang": ["cuahang", "shop", "store"],
    "quan an": ["quanan", "restaurant"],
    "trung tam thuong mai": ["tttm", "mall", "shopping mall"],
    "bai do xe": ["parking", "parking lot"],
    "ngan hang": ["bank", "atm", "atm bank"],
    "tiem banh": ["bakery", "banh"],
    "tra sua": ["trasua", "milk tea", "bubble tea"],
    "san bay": ["airport", "san bay"],
    "ben xe": ["bus station", "bus stop"],
    "cho": ["market", "cho"],
    "cong vien": ["park", "congvien"],
    "bien": ["beach", "bai bien"],
    "ho": ["lake", "lake view"],
  };
  return aliases[catNorm] ?? [];
}

// ---------------------------------------------------------------------------
// Module-level singleton
// ---------------------------------------------------------------------------

export const signatureGenerator = createSignatureGenerator({
  abbrevMap: new Map(),
  slangMap: DEFAULT_SLANG_MAP,
  intentMap: new Map(),
  crossLangMap: DEFAULT_CROSSLANG_MAP,
  joinableCompounds: DEFAULT_JOINABLE,
  cities: new Set(),
  categories: new Set(),
  brands: new Set(),
});
