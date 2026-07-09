const ACCENT_MAP: Record<string, string> = {
  "à": "a",
  "á": "a",
  "ả": "a",
  "ã": "a",
  "ạ": "a",
  "ằ": "a",
  "ắ": "a",
  "ẳ": "a",
  "ẵ": "a",
  "ặ": "a",
  "ầ": "a",
  "ấ": "a",
  "ẩ": "a",
  "ẫ": "a",
  "ậ": "a",
  "è": "e",
  "é": "e",
  "ẻ": "e",
  "ẽ": "e",
  "ẹ": "e",
  "ề": "e",
  "ế": "e",
  "ể": "e",
  "ễ": "e",
  "ệ": "e",
  "ì": "i",
  "í": "i",
  "ỉ": "i",
  "ĩ": "i",
  "ị": "i",
  "ò": "o",
  "ó": "o",
  "ỏ": "o",
  "õ": "o",
  "ọ": "o",
  "ồ": "o",
  "ố": "o",
  "ổ": "o",
  "ỗ": "o",
  "ộ": "o",
  "ờ": "o",
  "ớ": "o",
  "ở": "o",
  "ỡ": "o",
  "ợ": "o",
  "ù": "u",
  "ú": "u",
  "ủ": "u",
  "ũ": "u",
  "ụ": "u",
  "ừ": "u",
  "ứ": "u",
  "ử": "u",
  "ữ": "u",
  "ự": "u",
  "ỳ": "y",
  "ý": "y",
  "ỷ": "y",
  "ỹ": "y",
  "ỵ": "y",
  "đ": "d",
  "À": "a",
  "Á": "a",
  "Ả": "a",
  "Ã": "a",
  "Ạ": "a",
  "Ằ": "a",
  "Ắ": "a",
  "Ẳ": "a",
  "Ẵ": "a",
  "Ặ": "a",
  "Ầ": "a",
  "Ấ": "a",
  "Ẩ": "a",
  "Ẫ": "a",
  "Ậ": "a",
  "È": "e",
  "É": "e",
  "Ẻ": "e",
  "Ẽ": "e",
  "Ẹ": "e",
  "Ề": "e",
  "Ế": "e",
  "Ể": "e",
  "Ễ": "e",
  "Ệ": "e",
  "Ì": "i",
  "Í": "i",
  "Ỉ": "i",
  "Ĩ": "i",
  "Ị": "i",
  "Ò": "o",
  "Ó": "o",
  "Ỏ": "o",
  "Õ": "o",
  "Ọ": "o",
  "Ồ": "o",
  "Ố": "o",
  "Ổ": "o",
  "Ỗ": "o",
  "Ộ": "o",
  "Ờ": "o",
  "Ớ": "o",
  "Ở": "o",
  "Ỡ": "o",
  "Ợ": "o",
  "Ù": "u",
  "Ú": "u",
  "Ủ": "u",
  "Ũ": "u",
  "Ụ": "u",
  "Ừ": "u",
  "Ứ": "u",
  "Ử": "u",
  "Ữ": "u",
  "Ự": "u",
  "Ỳ": "y",
  "Ý": "y",
  "Ỷ": "y",
  "Ỹ": "y",
  "Ỵ": "y",
  "Đ": "d",
};

const PUNCTUATION_RE = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;

/**
 * Strip Vietnamese diacritics (accents) from text.
 * "Nguyễn Huệ" → "Nguyen Hue"
 */
export function stripAccents(text: string): string {
  return text
    .split("")
    .map((char) => ACCENT_MAP[char] ?? char)
    .join("");
}

/**
 * Normalize text for Trie indexing:
 * - Strip accents
 * - Lowercase
 * - Remove punctuation
 * - Collapse whitespace
 *
 * "Nguyễn Huệ, Quận 1" → "nguyen hue quan 1"
 */
export function normalize(text: string): string {
  return stripAccents(text)
    .toLowerCase()
    .replace(PUNCTUATION_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize but preserve original for display.
 * Returns both the lookup key and the display text.
 */
export function normalizePair(
  text: string,
): { key: string; display: string } {
  return {
    key: normalize(text),
    display: text,
  };
}

/**
 * Expand abbreviations in input text using a dictionary.
 * "ks da nang" → "khách sạn đà nẵng"
 */
export function expandAbbreviations(
  input: string,
  abbreviations: Map<string, string>,
): string {
  const words = input.toLowerCase().split(/\s+/);
  return words
    .map((word) => abbreviations.get(word) ?? word)
    .join(" ");
}

/**
 * Generate all prefixes (length >= 2) for a given text.
 * "cafe" → ["ca", "caf", "cafe"]
 */
export function generatePrefixes(
  text: string,
  minLength = 2,
): string[] {
  const normalized = normalize(text);
  const results: string[] = [];
  for (let i = minLength; i <= normalized.length; i++) {
    results.push(normalized.slice(0, i));
  }
  return results;
}

/**
 * Build abbreviation lookup map from abbreviation table rows.
 */
export function buildAbbreviationMap(
  rows: { abbreviation: string; expandedForm: string }[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of rows) {
    map.set(row.abbreviation.toLowerCase(), row.expandedForm);
  }
  return map;
}
