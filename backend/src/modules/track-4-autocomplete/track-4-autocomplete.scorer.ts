const MAX_FREQUENCY = 15000;

export function scoreAutocomplete(
  originalScore: number,
  queryFrequency: number | null,
  prefixLen: number,
  fullLen: number,
  isGenerated: boolean,
): number {
  if (!isGenerated) {
    if (prefixLen >= fullLen) {
      return originalScore;
    }
    return originalScore * (0.85 + 0.15 * (prefixLen / fullLen));
  }

  const freqRatio = queryFrequency !== null
    ? Math.min(queryFrequency / MAX_FREQUENCY, 1.0)
    : 0.3;
  return freqRatio * 0.55;
}

export function scorePopularQuery(
  frequency: number,
  isGenerated: boolean,
): number {
  const multiplier = isGenerated ? 0.55 : 0.75;
  return Math.min(frequency / MAX_FREQUENCY, 1.0) * multiplier;
}

export function scorePOI(popularityScore: number): number {
  return popularityScore / 100;
}

const TEMPLATE_SCORES: Record<string, number> = {
  brand_nearby: 0.55,
  category_nearby: 0.50,
  category_city: 0.48,
  category_attribute: 0.46,
  discovery: 0.42,
  navigation: 0.40,
  category_entry: 0.35,
};

export function scoreTemplate(templateType: string): number {
  return TEMPLATE_SCORES[templateType] ?? 0.40;
}
