/**
 * NLP Utilities — Unit Tests
 *
 * Pure functions only — no DB, no HTTP, no network.
 */
import { assertEquals } from "@std/assert";
import {
  buildAbbreviationMap,
  expandAbbreviations,
  generatePrefixes,
  normalize,
  normalizePair,
  stripAccents,
} from "../track-4-autocomplete.nlp.ts";

// ─── stripAccents ─────────────────────────────────────────────────────────────

Deno.test("stripAccents removes Vietnamese diacritics", () => {
  assertEquals(stripAccents("Nguyễn Huệ"), "Nguyen Hue");
});

Deno.test("stripAccents handles 'đ' and additional tones", () => {
  assertEquals(stripAccents("Đà Nẵng"), "da Nang");
});

Deno.test("stripAccents passes non-Vietnamese text through unchanged", () => {
  assertEquals(stripAccents("Hello"), "Hello");
});

Deno.test("stripAccents handles uppercase accented characters", () => {
  assertEquals(stripAccents("ĐIỆN BIẾN PHỦ"), "dIeN BIeN PHu");
});

Deno.test("stripAccents preserves digits and symbols", () => {
  assertEquals(stripAccents("Cà Phế 24/7"), "Ca Phe 24/7");
});

Deno.test("stripAccents returns empty string for empty input", () => {
  assertEquals(stripAccents(""), "");
});

Deno.test("stripAccents handles text with no accented chars (pass-through)", () => {
  assertEquals(stripAccents("abc def 123"), "abc def 123");
});

Deno.test("stripAccents handles full lowercase accented set", () => {
  assertEquals(
    stripAccents(
      "àáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵđ",
    ),
    "aaaaaaaaaaaaaaaeeeeeeeeeeiiiiiooooooooooooooouuuuuuuuuuyyyyyd",
  );
});

Deno.test("stripAccents handles full uppercase accented set", () => {
  assertEquals(
    stripAccents(
      "ÀÁẢÃẠẰẮẲẴẶẦẤẨẪẬÈÉẺẼẸỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌỒỐỔỖỘỜỚỞỠỢÙÚỦŨỤỪỨỬỮỰỲÝỶỸỴĐ",
    ),
    "aaaaaaaaaaaaaaaeeeeeeeeeeiiiiiooooooooooooooouuuuuuuuuuyyyyyd",
  );
});

Deno.test("stripAccents only strips chars present in ACCENT_MAP", () => {
  assertEquals(stripAccents("êôơưăâÊÔƠƯĂÂ"), "êôơưăâÊÔƠƯĂÂ");
});

// ─── normalize ────────────────────────────────────────────────────────────────

Deno.test("normalize strips accents, lowercases, removes punctuation, collapses whitespace", () => {
  assertEquals(normalize("Nguyễn Huệ, Quận 1"), "nguyen hue quan 1");
});

Deno.test("normalize collapses multiple spaces", () => {
  assertEquals(normalize("ATM   Vietcombank"), "atm vietcombank");
});

Deno.test("normalize removes slashes from mixed content", () => {
  assertEquals(normalize("Cà Phế 24/7"), "ca phe 24 7");
});

Deno.test("normalize returns empty string for empty input", () => {
  assertEquals(normalize(""), "");
});

Deno.test("normalize returns empty string for whitespace-only input", () => {
  assertEquals(normalize("   \t  \n  "), "");
});

Deno.test("normalize removes all punctuation defined in PUNCTUATION_RE", () => {
  assertEquals(
    normalize("a.,b/c#d!e$f%g^h&i*j;k:m{n}=o-p_q`r~s(t)"),
    "a b c d e f g h i j k m n o p q r s t",
  );
});

Deno.test("normalize handles leading and trailing spaces", () => {
  assertEquals(normalize("  hello world  "), "hello world");
});

Deno.test("normalize lowercases uppercase non-accented text", () => {
  assertEquals(normalize("HELLO WORLD"), "hello world");
});

Deno.test("normalize preserves digits", () => {
  assertEquals(normalize("Room 101 Building 42"), "room 101 building 42");
});

// ─── normalizePair ────────────────────────────────────────────────────────────

Deno.test("normalizePair returns key and display", () => {
  assertEquals(normalizePair("Đà Nẵng"), {
    key: "da nang",
    display: "Đà Nẵng",
  });
});

Deno.test("normalizePair preserves original text as display", () => {
  const result = normalizePair("Cà Phế, Quận 1!");
  assertEquals(result.display, "Cà Phế, Quận 1!");
  assertEquals(result.key, "ca phe quan 1");
});

Deno.test("normalizePair handles empty string", () => {
  assertEquals(normalizePair(""), { key: "", display: "" });
});

// ─── generatePrefixes ─────────────────────────────────────────────────────────

Deno.test("generatePrefixes generates all prefixes with default minLength=2", () => {
  assertEquals(generatePrefixes("cafe"), ["ca", "caf", "cafe"]);
});

Deno.test("generatePrefixes respects custom minLength", () => {
  assertEquals(generatePrefixes("cafe", 3), ["caf", "cafe"]);
});

Deno.test("generatePrefixes returns empty array for single character", () => {
  assertEquals(generatePrefixes("a"), []);
});

Deno.test("generatePrefixes includes space-containing prefixes for multi-word text", () => {
  assertEquals(generatePrefixes("nguyen hue"), [
    "ng",
    "ngu",
    "nguy",
    "nguye",
    "nguyen",
    "nguyen ",
    "nguyen h",
    "nguyen hu",
    "nguyen hue",
  ]);
});

Deno.test("generatePrefixes normalizes accented input before generating prefixes", () => {
  assertEquals(generatePrefixes("Đà Nẵng"), [
    "da",
    "da ",
    "da n",
    "da na",
    "da nan",
    "da nang",
  ]);
});

Deno.test("generatePrefixes returns empty array when minLength exceeds text length", () => {
  assertEquals(generatePrefixes("ab", 5), []);
});

Deno.test("generatePrefixes returns empty array for empty string", () => {
  assertEquals(generatePrefixes(""), []);
});

Deno.test("generatePrefixes with minLength=1 includes single-character prefix", () => {
  assertEquals(generatePrefixes("ab", 1), ["a", "ab"]);
});

Deno.test("generatePrefixes handles whitespace-only input", () => {
  assertEquals(generatePrefixes("   "), []);
});

Deno.test("generatePrefixes with minLength equal to text length returns one prefix", () => {
  assertEquals(generatePrefixes("cafe", 4), ["cafe"]);
});

Deno.test("generatePrefixes normalizes punctuation out before generating", () => {
  assertEquals(generatePrefixes("a,b"), ["a ", "a b"]);
});

// ─── expandAbbreviations ──────────────────────────────────────────────────────

Deno.test("expandAbbreviations replaces known abbreviations", () => {
  const map = new Map<string, string>([
    ["ks", "Khách sạn"],
    ["dn", "Đà Nẵng"],
  ]);
  assertEquals(expandAbbreviations("ks dn", map), "Khách sạn Đà Nẵng");
});

Deno.test("expandAbbreviations passes unknown words through", () => {
  assertEquals(expandAbbreviations("cafe", new Map()), "cafe");
});

Deno.test("expandAbbreviations matching is case insensitive", () => {
  const map = new Map<string, string>([
    ["ks", "Khách sạn"],
    ["dn", "Đà Nẵng"],
  ]);
  assertEquals(expandAbbreviations("KS DN", map), "Khách sạn Đà Nẵng");
});

Deno.test("expandAbbreviations returns empty string for empty input", () => {
  const map = new Map<string, string>([["ks", "Khách sạn"]]);
  assertEquals(expandAbbreviations("", map), "");
});

Deno.test("expandAbbreviations handles mixed known and unknown words", () => {
  const map = new Map<string, string>([["ks", "Khách sạn"]]);
  assertEquals(expandAbbreviations("ks saigon", map), "Khách sạn saigon");
});

Deno.test("expandAbbreviations collapses multiple spaces in input", () => {
  const map = new Map<string, string>([["a", "alpha"], ["b", "bravo"]]);
  assertEquals(expandAbbreviations("a    b", map), "alpha bravo");
});

Deno.test("expandAbbreviations handles input with only unknown words", () => {
  const map = new Map<string, string>([["ks", "Khách sạn"]]);
  assertEquals(expandAbbreviations("hello world", map), "hello world");
});

// ─── buildAbbreviationMap ─────────────────────────────────────────────────────

Deno.test("buildAbbreviationMap constructs map from database rows", () => {
  const rows = [
    { abbreviation: "ks", expandedForm: "Khách sạn" },
    { abbreviation: "dn", expandedForm: "Đà Nẵng" },
  ];
  const map = buildAbbreviationMap(rows);
  assertEquals(map.size, 2);
  assertEquals(map.get("ks"), "Khách sạn");
  assertEquals(map.get("dn"), "Đà Nẵng");
});

Deno.test("buildAbbreviationMap returns empty map for empty array", () => {
  const map = buildAbbreviationMap([]);
  assertEquals(map.size, 0);
});

Deno.test("buildAbbreviationMap lowercases abbreviation keys", () => {
  const rows = [
    { abbreviation: "KS", expandedForm: "Khách sạn" },
    { abbreviation: "DN", expandedForm: "Đà Nẵng" },
  ];
  const map = buildAbbreviationMap(rows);
  assertEquals(map.get("ks"), "Khách sạn");
  assertEquals(map.get("dn"), "Đà Nẵng");
  assertEquals(map.has("KS"), false);
});

Deno.test("buildAbbreviationMap handles single row", () => {
  const rows = [{ abbreviation: "atm", expandedForm: "Máy ATM" }];
  const map = buildAbbreviationMap(rows);
  assertEquals(map.size, 1);
  assertEquals(map.get("atm"), "Máy ATM");
});
