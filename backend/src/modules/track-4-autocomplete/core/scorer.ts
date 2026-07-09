const MAX_FREQUENCY = 15000;
const MAX_POPULARITY = 100;

export function scoreAutocomplete(
  originalScore: number,
  queryFrequency: number | null,
  prefixLen: number,
  fullLen: number,
  isGenerated: boolean,
): number {
  if (!isGenerated) {
    if (prefixLen >= fullLen) {
      return 0.80 + originalScore * 0.19;
    }
    return 0.80 + (originalScore * 0.19) * (prefixLen / fullLen);
  }

  const freqRatio = queryFrequency !== null
    ? Math.min(queryFrequency / MAX_FREQUENCY, 1.0)
    : 0.3;
  return 0.25 + freqRatio * 0.14;
}

export function scorePopularQuery(
  frequency: number,
  isGenerated: boolean,
): number {
  const freqRatio = Math.min(frequency / MAX_FREQUENCY, 1.0);
  if (!isGenerated) {
    return 0.60 + freqRatio * 0.14;
  }
  return 0.40 + freqRatio * 0.09;
}

export function scorePOI(popularityScore: number): number {
  const capped = Math.min(popularityScore, MAX_POPULARITY);
  return 0.50 + (capped / MAX_POPULARITY) * 0.09;
}

const TEMPLATE_SCORES: Record<string, number> = {
  brand_nearby: 0.24,
  category_nearby: 0.22,
  category_city: 0.20,
  category_attribute: 0.18,
  discovery: 0.16,
  navigation: 0.14,
  category_entry: 0.12,
};

export function scoreTemplate(templateType: string): number {
  return TEMPLATE_SCORES[templateType] ?? 0.12;
}
