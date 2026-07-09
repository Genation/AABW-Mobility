import { normalize } from "../core/nlp.ts";

const ABBREVIATION_TOKENS = new Set([
  "ks", "bv", "vcb", "dh", "cf", "bk", "bidv",
  "hcm", "hn", "dn", "sg", "tsn", "nb", "hp", "ct", "vt",
  "đl", "nt", "pq", "qb", "tphcm", "đn",
  "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10",
  "q11", "q12",
]);

const ENGLISH_WORDS = new Set([
  "coffee", "hotel", "near", "beach", "halal", "rooftop",
  "restaurant", "vegan", "spa", "gym", "atm", "mall", "bar",
  "cinema", "hospital", "pharmacy",
]);

const SEMANTIC_KEYWORDS = [
  "song ao", "tre em", "yen tinh", "lam viec", "hoc bai",
  "tren duong", "mo cua", "24 7", "wifi mien phi",
  "wifi", "hoc", "24", "check", "khu", "dep", "ngon",
];

const EN_VI_MAP: Record<string, string> = {
  "coffee": "cà phê", "hotel": "khách sạn", "near": "gần",
  "beach": "biển", "danang": "đà nẵng", "halal": "halal",
  "rooftop": "rooftop", "restaurant": "nhà hàng",
  "vegan": "chay", "atm": "ATM", "bar": "bar",
  "cinema": "rạp chiếu phim", "hospital": "bệnh viện",
  "pharmacy": "nhà thuốc", "mall": "trung tâm thương mại",
  "spa": "spa", "gym": "phòng gym",
};

export interface Strategy {
  type: "exact_prefix" | "abbreviation" | "mixed_language" | "semantic" | "navigation";
  forms: string[];
  parsed: { category?: string; attribute?: string; location?: string };
}

export function generateStrategies(
  input: string,
  abbrMap: Map<string, string>,
): Strategy[] {
  const raw = input.trim();
  const lower = raw.toLowerCase();
  const rawNorm = normalize(raw);
  const strategies: Strategy[] = [];

  // Always try exact_prefix
  strategies.push({
    type: "exact_prefix",
    forms: [rawNorm],
    parsed: {},
  });

  // Try abbreviation if input has Known abbrev tokens
  const tokens = lower.split(/\s+/).filter(Boolean);
  const hasAbbrev = tokens.some((t) => ABBREVIATION_TOKENS.has(t));
  if (hasAbbrev) {
    const expanded = tokens.map((w) => abbrMap.get(w) || w).join(" ");
    const normed = normalize(expanded);
    if (normed !== rawNorm) {
      strategies.push({
        type: "abbreviation",
        forms: [normed],
        parsed: {},
      });
    }
  }

  // Try English→VI if input has English words
  if (tokens.length >= 2 && tokens.some((t) => ENGLISH_WORDS.has(t))) {
    const translated = tokens.map((w) => EN_VI_MAP[w] || w).join(" ");
    const normed = normalize(translated);
    if (normed !== rawNorm) {
      strategies.push({
        type: "mixed_language",
        forms: [normed],
        parsed: {},
      });
    }
  }

  // Try semantic if input contains intent keywords
  if (tokens.length >= 2) {
    for (const kw of SEMANTIC_KEYWORDS) {
      const found = lower.includes(kw);
      if (!found) continue;
      const idx = lower.indexOf(kw);
      const before = lower.slice(0, idx).trim();
      const category = before || undefined;
      const attribute = kw;

      const forms: string[] = [];
      if (category && attribute) {
        forms.push(normalize(`${category} ${attribute}`));
      }
      if (category) {
        forms.push(normalize(category));
      }
      // Also try abbrev-expanded + semantic
      if (hasAbbrev) {
        const expandedTokens = tokens.map((w) => abbrMap.get(w) || w);
        const kwFirstWord = kw.includes(" ") ? kw.split(" ")[0] : kw;
        const matchIdx = tokens.findIndex((t) => t === kwFirstWord);
        if (matchIdx > 0) {
          const expandedCategory = expandedTokens.slice(0, matchIdx).join(" ");
          if (expandedCategory) {
            forms.push(normalize(`${expandedCategory} ${attribute}`));
          }
        }
      }

      if (forms.length > 0) {
        strategies.push({
          type: "semantic",
          forms: [...new Set(forms)],
          parsed: { category, attribute },
        });
      }
      // Only process the first found keyword
      break;
    }
  }

  // Try navigation
  const navMatch = raw.match(/^(duong den|chi duong)\s+(.+)$/i);
  if (navMatch) {
    strategies.push({
      type: "navigation",
      forms: [normalize(`chi duong den ${navMatch[2]}`)],
      parsed: { location: navMatch[2] },
    });
  }

  return strategies;
}
