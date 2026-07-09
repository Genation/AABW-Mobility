/**
 * Query Expander — Query-time input transformation.
 *
 * Given user input, generates multiple "search forms" to probe the
 * inverted index. The goal is to maximize overlap between what the
 * user typed and how suggestions were indexed.
 *
 * Transformations:
 *   1. ORIGINAL     — normalized input as-is
 *   2. ABBREV_EXP   — expand abbreviations in the input
 *   3. ABBREV_COMP  — compress full words back to abbreviations
 *   4. SLANG_EXP    — replace slang with standard terms
 *   5. SLANG_COMP   — replace standard with slang
 *   6. CROSSLANG    — translate EN→VI and VI→EN
 *   7. REORDER      — city-first ↔ category-first
 *   8. COMPONENTS   — individual words, bigrams as standalone queries
 *   9. TYPO_FUZZY   — edit-distance corrected variants
 *   10. JOINED      — remove spaces
 *   11. PREFIX_VAR  — truncate to different lengths
 */

import { normalize } from "./nlp.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchForm {
  key: string;
  source: string;
  /** Higher score = more reliable transformation */
  confidence: number;
}

export interface ExpandConfig {
  abbrevMap: Map<string, string>;
  /** Reverse of abbrevMap: expanded form → abbreviation */
  revAbbrevMap: Map<string, string>;
  slangMap: Map<string, string[]>;
  /** Reverse: standard term → slang */
  revSlangMap: Map<string, string[]>;
  crossLangMap: Map<string, string>;
  /** Reverse cross-lang */
  revCrossLangMap: Map<string, string>;
  cities: Set<string>;
  categories: Set<string>;
}

// ---------------------------------------------------------------------------
// Expand logic
// ---------------------------------------------------------------------------

export const createQueryExpander = (config: ExpandConfig) => {
  const {
    abbrevMap,
    revAbbrevMap,
    slangMap,
    revSlangMap,
    crossLangMap,
    revCrossLangMap,
    cities,
    categories,
  } = config;

  function expand(input: string): SearchForm[] {
    const results: SearchForm[] = [];
    const norm = normalize(input);
    const words = norm.split(/\s+/).filter((w) => w.length > 0);
    if (norm.length < 2) return results;

    // --- 1. ORIGINAL ---
    results.push({ key: norm, source: "original", confidence: 1.0 });
    // Also try at various prefix lengths
    for (let i = Math.max(2, norm.length - 2); i <= norm.length; i++) {
      if (i !== norm.length) {
        results.push({
          key: norm.slice(0, i),
          source: "original_trunc",
          confidence: 0.8,
        });
      }
    }

    // --- 2. ABBREV_EXP: expand abbreviations in-place ---
    const expandedWords = words.map((w) => abbrevMap.get(w) ?? w);
    const expanded = expandedWords.join(" ");
    if (expanded !== norm) {
      results.push({ key: expanded, source: "abbrev_exp", confidence: 0.85 });
      const expandedNorm = normalize(expanded);
      for (let i = 2; i <= expandedNorm.length; i++) {
        results.push({
          key: expandedNorm.slice(0, i),
          source: "abbrev_exp_prefix",
          confidence: 0.75,
        });
      }
    }

    // --- 3. ABBREV_COMP: compress full words to abbreviations ---
    const compressedWords = words.map((w) => revAbbrevMap.get(w) ?? w);
    const compressed = compressedWords.join(" ");
    if (compressed !== norm) {
      results.push({ key: compressed, source: "abbrev_comp", confidence: 0.75 });
    }

    // --- 4. SLANG_EXP: replace slang with standard terms ---
    for (const [slang, standards] of slangMap) {
      if (norm.includes(slang)) {
        for (const std of standards) {
          const stdNorm = normalize(std);
          const slangExpanded = norm.replace(slang, stdNorm);
          results.push({
            key: slangExpanded,
            source: "slang_exp",
            confidence: 0.8,
          });
          for (let i = 2; i <= slangExpanded.length; i++) {
            results.push({
              key: slangExpanded.slice(0, i),
              source: "slang_exp_prefix",
              confidence: 0.7,
            });
          }
        }
      }
    }

    // Check for multi-word slang
    for (const [slang, standards] of slangMap) {
      const slangWords = slang.split(/\s+/);
      if (slangWords.length >= 2) {
        let allPresent = true;
        for (const sw of slangWords) {
          if (!words.includes(sw)) { allPresent = false; break; }
        }
        if (allPresent && slang !== norm) {
          for (const std of standards) {
            results.push({
              key: normalize(std),
              source: "slang_multi",
              confidence: 0.7,
            });
          }
        }
      }
    }

    // --- 5. SLANG_COMP: replace standard with slang (reverse) ---
    for (const [std, slangTerms] of revSlangMap) {
      const stdNorm = normalize(std);
      if (norm.includes(stdNorm)) {
        for (const slang of slangTerms) {
          results.push({
            key: norm.replace(stdNorm, slang),
            source: "slang_comp",
            confidence: 0.65,
          });
        }
      }
    }

    // --- 6. CROSSLANG: English ↔ Vietnamese ---
    // EN → VI
    for (const [en, vi] of crossLangMap) {
      const enNorm = normalize(en);
      const viNorm = normalize(vi);
      if (norm.includes(enNorm)) {
        const viText = norm.replace(enNorm, viNorm);
        results.push({
          key: viText,
          source: "crosslang_envi",
          confidence: 0.8,
        });
        // Also index partial prefixes
        for (let i = 2; i <= viText.length; i++) {
          results.push({
            key: viText.slice(0, i),
            source: "crosslang_envi_prefix",
            confidence: 0.7,
          });
        }
        // Try category canonical + crosslang combo
        for (const cat of categories) {
          const catNorm = normalize(cat);
          if (viNorm.includes(catNorm)) {
            const catText = viText.replace(catNorm, "");
            // category + "near" or "near" + category forms
            for (const near of ["gan day", "gan nhat", "gan"]) {
              results.push({
                key: (catText.trim() + " " + near).trim(),
                source: "crosslang_cat_near",
                confidence: 0.6,
              });
              results.push({
                key: (near + " " + catText.trim()).trim(),
                source: "crosslang_cat_near_rev",
                confidence: 0.6,
              });
            }
          }
        }
      }
    }

    // VI → EN
    for (const [vi, en] of revCrossLangMap) {
      const viNorm = normalize(vi);
      const enNorm = normalize(en);
      if (norm.includes(viNorm)) {
        const enText = norm.replace(viNorm, enNorm);
        results.push({
          key: enText,
          source: "crosslang_vien",
          confidence: 0.8,
        });
      }
    }

    // --- 7. REORDER: city-first ↔ category-first ---
    for (const city of cities) {
      const cityNorm = normalize(city);
      if (norm.startsWith(cityNorm)) {
        const rest = norm.slice(cityNorm.length).trim();
        if (rest.length > 0) {
          results.push({
            key: rest + " " + cityNorm,
            source: "reorder_city_to_end",
            confidence: 0.85,
          });
        }
      }
      if (norm.endsWith(cityNorm)) {
        const rest = norm.slice(0, -cityNorm.length).trim();
        if (rest.length > 0) {
          results.push({
            key: cityNorm + " " + rest,
            source: "reorder_city_to_front",
            confidence: 0.85,
          });
        }
      }
    }

    // --- 8. COMPONENTS: individual words, bigrams ---
    for (const word of words) {
      if (word.length >= 2) {
        results.push({ key: word, source: "component_word", confidence: 0.4 });
        for (let i = 2; i <= word.length; i++) {
          results.push({
            key: word.slice(0, i),
            source: "component_word_prefix",
            confidence: 0.35,
          });
        }
      }
    }
    for (let i = 0; i < words.length - 1; i++) {
      const bg = words[i] + " " + words[i + 1];
      results.push({ key: bg, source: "component_bigram", confidence: 0.5 });
    }
    // Also the first word as starting prefix
    if (words.length >= 1 && words[0].length >= 2) {
      results.push({
        key: words[0],
        source: "component_first_word",
        confidence: 0.45,
      });
    }

    // --- 9. JOINED: no-space variant ---
    const joined = words.join("");
    if (joined.length >= 2 && joined !== norm.replace(/\s+/g, "")) {
      results.push({ key: joined, source: "joined", confidence: 0.5 });
    }

    // --- 10. PREFIX_VAR: truncate norm to different key lengths ---
    // Already generated some above, but make sure we cover the range
    for (let i = 2; i < norm.length; i++) {
      const existing = results.find((r) => r.key === norm.slice(0, i));
      if (!existing) {
        results.push({
          key: norm.slice(0, i),
          source: "prefix_var",
          confidence: 0.5,
        });
      }
    }

    // --- 11. Abbreviation + city/region combinations ---
    // e.g., "halal hcm" → try "halal tp hcm", "nhà hàng halal tphcm"
    for (const [abbr, expanded] of abbrevMap) {
      if (norm.endsWith(" " + abbr) || norm === abbr) {
        const baseNorm = norm.endsWith(" " + abbr)
          ? norm.slice(0, -(abbr.length + 1))
          : "";
        const fullNorm = baseNorm.length > 0
          ? baseNorm + " " + normalize(expanded)
          : normalize(expanded);
        results.push({
          key: fullNorm,
          source: "abbrev_location",
          confidence: 0.75,
        });
      }
    }

    // --- 12. Partial abbreviation guessing ---
    // e.g., "dh bk" → try both full expansions
    let allAbbrev = true;
    const triedExpansions: string[] = [""];
    for (const word of words) {
      if (abbrevMap.has(word)) {
        const expandedForm = normalize(abbrevMap.get(word)!);
        triedExpansions[0] = triedExpansions[0]
          ? triedExpansions[0] + " " + expandedForm
          : expandedForm;
      } else {
        allAbbrev = false;
        triedExpansions[0] = triedExpansions[0]
          ? triedExpansions[0] + " " + word
          : word;
      }
    }
    if (allAbbrev && triedExpansions[0] !== norm) {
      const fullExp = triedExpansions[0].trim();
      results.push({
        key: fullExp,
        source: "full_abbrev_exp",
        confidence: 0.8,
      });
      for (let i = 2; i <= fullExp.length; i++) {
        results.push({
          key: fullExp.slice(0, i),
          source: "full_abbrev_exp_prefix",
          confidence: 0.7,
        });
      }
    }

    // De-duplicate by key (keep highest confidence)
    const seen = new Map<string, SearchForm>();
    for (const sf of results) {
      const existing = seen.get(sf.key);
      if (!existing || sf.confidence > existing.confidence) {
        seen.set(sf.key, sf);
      }
    }

    return Array.from(seen.values());
  }

  return { expand };
};

// ---------------------------------------------------------------------------
// Build reverse lookup maps from forward maps
// ---------------------------------------------------------------------------

export function buildRevAbbrevMap(
  abbrevMap: Map<string, string>,
): Map<string, string> {
  const rev = new Map<string, string>();
  for (const [abbr, expanded] of abbrevMap) {
    rev.set(normalize(expanded), abbr);
  }
  return rev;
}

export function buildRevSlangMap(
  slangMap: Map<string, string[]>,
): Map<string, string[]> {
  const rev = new Map<string, string[]>();
  for (const [slang, standards] of slangMap) {
    for (const std of standards) {
      const existing = rev.get(std);
      if (existing) {
        existing.push(slang);
      } else {
        rev.set(std, [slang]);
      }
    }
  }
  return rev;
}

export function buildRevCrossLangMap(
  crossLangMap: Map<string, string>,
): Map<string, string> {
  const rev = new Map<string, string>();
  for (const [en, vi] of crossLangMap) {
    rev.set(vi, en);
  }
  return rev;
}
