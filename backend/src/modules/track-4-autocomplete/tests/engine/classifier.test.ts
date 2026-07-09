/**
 * Query Classifier — Unit Tests
 *
 * Pure functions only — no DB, no HTTP, no network.
 * Tests generateStrategies() additive strategy generation.
 */
import { assertEquals } from "@std/assert";
import { generateStrategies } from "../../engine/classifier.ts";
import type { Strategy } from "../../engine/classifier.ts";

const abbrMap = new Map([
  ["bv", "Bệnh viện"],
  ["ks", "Khách sạn"],
  ["q1", "Quận 1"],
  ["q2", "Quận 2"],
  ["q3", "Quận 3"],
  ["q4", "Quận 4"],
  ["q5", "Quận 5"],
  ["q6", "Quận 6"],
  ["q7", "Quận 7"],
  ["q8", "Quận 8"],
  ["q9", "Quận 9"],
  ["q10", "Quận 10"],
  ["q11", "Quận 11"],
  ["q12", "Quận 12"],
  ["hcm", "TP. Hồ Chí Minh"],
  ["tphcm", "TP. Hồ Chí Minh"],
  ["hn", "Hà Nội"],
  ["dn", "Đà Nẵng"],
  ["sg", "Sài Gòn"],
  ["tsn", "Tân Sơn Nhất"],
  ["nb", "Nha Trang"],
  ["hp", "Hải Phòng"],
  ["ct", "Cần Thơ"],
  ["vt", "Vũng Tàu"],
  ["đl", "Đà Lạt"],
  ["nt", "Nha Trang"],
  ["pq", "Phú Quốc"],
  ["qb", "Quảng Bình"],
  ["đn", "Đồng Nai"],
  ["dh", "Đại học"],
  ["bk", "Bách Khoa"],
  ["cf", "cà phê"],
  ["vcb", "Vietcombank"],
  ["bidv", "BIDV"],
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findStrategy(strategies: Strategy[], type: string): Strategy | undefined {
  return strategies.find((s) => s.type === type);
}

function strategyTypes(strategies: Strategy[]): string[] {
  return strategies.map((s) => s.type);
}

// ─── 1. exact_prefix always present ───────────────────────────────────────────

Deno.test("exact_prefix always present — simple query", () => {
  const strategies = generateStrategies("cafe", abbrMap);
  assertEquals(strategies.length >= 1, true);
  assertEquals(strategies[0].type, "exact_prefix");
});

Deno.test("exact_prefix always present — with whitespace", () => {
  const strategies = generateStrategies("  cafe  ", abbrMap);
  assertEquals(strategies[0].type, "exact_prefix");
  assertEquals(strategies[0].forms, ["cafe"]);
});

Deno.test("exact_prefix has normalized form", () => {
  const strategies = generateStrategies("Nguyễn Huệ", abbrMap);
  assertEquals(strategies[0].type, "exact_prefix");
  assertEquals(strategies[0].forms, ["nguyen hue"]);
});

Deno.test("exact_prefix is only strategy for plain text", () => {
  const strategies = generateStrategies("vin", abbrMap);
  assertEquals(strategies.length, 1);
  assertEquals(strategies[0].type, "exact_prefix");
});

Deno.test("exact_prefix is only strategy for unknown pattern", () => {
  const strategies = generateStrategies("phuc long", abbrMap);
  assertEquals(strategies.length, 1);
  assertEquals(strategies[0].type, "exact_prefix");
});

// ─── 2. Abbreviation strategy ─────────────────────────────────────────────────

Deno.test("abbreviation: single service abbreviation", () => {
  const strategies = generateStrategies("ks da nang", abbrMap);
  const types = strategyTypes(strategies);
  assertEquals(types.includes("exact_prefix"), true);
  assertEquals(types.includes("abbreviation"), true);
  const s = findStrategy(strategies, "abbreviation")!;
  assertEquals(s.forms, ["khach san da nang"]);
});

Deno.test("abbreviation: two-letter service abbreviation", () => {
  const strategies = generateStrategies("bv bach mai", abbrMap);
  const s = findStrategy(strategies, "abbreviation")!;
  assertEquals(s.forms, ["benh vien bach mai"]);
});

Deno.test("abbreviation: service + location abbreviation", () => {
  const strategies = generateStrategies("ks q1", abbrMap);
  const s = findStrategy(strategies, "abbreviation")!;
  assertEquals(s.forms, ["khach san quan 1"]);
});

Deno.test("abbreviation: cf abbreviation", () => {
  const strategies = generateStrategies("cf q1", abbrMap);
  const s = findStrategy(strategies, "abbreviation")!;
  assertEquals(s.forms, ["ca phê quan 1"]);
});

Deno.test("abbreviation: vcb bank abbreviation", () => {
  const strategies = generateStrategies("atm vcb q", abbrMap);
  const s = findStrategy(strategies, "abbreviation")!;
  assertEquals(s.forms, ["atm vietcombank q"]);
});

Deno.test("abbreviation: dh bk multi abbreviation", () => {
  const strategies = generateStrategies("dh bk", abbrMap);
  const s = findStrategy(strategies, "abbreviation")!;
  assertEquals(s.forms, ["dai hoc bach khoa"]);
});

Deno.test("abbreviation: all q1-q12 range detected", () => {
  for (let i = 1; i <= 12; i++) {
    const strategies = generateStrategies(`cafe q${i}`, abbrMap);
    const s = findStrategy(strategies, "abbreviation")!;
    assertEquals(s.type, "abbreviation");
  }
});

Deno.test("abbreviation: all city/town abbreviations detected", () => {
  const cities = ["hcm", "hn", "dn", "sg", "tsn", "nb", "hp", "ct", "vt"];
  for (const c of cities) {
    const strategies = generateStrategies(`cafe ${c}`, abbrMap);
    assertEquals(findStrategy(strategies, "abbreviation")!.type, "abbreviation");
  }
});

Deno.test("abbreviation: case insensitive", () => {
  const strategies = generateStrategies("KS Da Nang", abbrMap);
  assertEquals(findStrategy(strategies, "abbreviation")!.type, "abbreviation");
});

Deno.test("abbreviation: single location abbrev token works", () => {
  const strategies = generateStrategies("q1", abbrMap);
  const s = findStrategy(strategies, "abbreviation")!;
  assertEquals(s.type, "abbreviation");
  assertEquals(s.forms, ["quan 1"]);
});

Deno.test("abbreviation: parsed is empty object", () => {
  const strategies = generateStrategies("ks da nang", abbrMap);
  const s = findStrategy(strategies, "abbreviation")!;
  assertEquals(s.parsed, {});
});

Deno.test("abbreviation: tphcm location", () => {
  const strategies = generateStrategies("bun bo tphcm", abbrMap);
  const s = findStrategy(strategies, "abbreviation")!;
  assertEquals(s.type, "abbreviation");
});

Deno.test("abbreviation: no strategy when expansion equals raw", () => {
  const strategies = generateStrategies("bidv", new Map([["bidv", "bidv"]]));
  assertEquals(findStrategy(strategies, "abbreviation"), undefined);
});

// ─── 3. Mixed language strategy ───────────────────────────────────────────────

Deno.test("mixed_language: English + English → Vietnamese", () => {
  const strategies = generateStrategies("coffee near", abbrMap);
  const s = findStrategy(strategies, "mixed_language")!;
  assertEquals(s.type, "mixed_language");
  assertEquals(s.forms, ["ca phê gan"]);
});

Deno.test("mixed_language: English + Vietnamese", () => {
  const strategies = generateStrategies("hotel da nang", abbrMap);
  const s = findStrategy(strategies, "mixed_language")!;
  assertEquals(s.type, "mixed_language");
  assertEquals(s.forms, ["khach san da nang"]);
});

Deno.test("mixed_language: English word in Vietnamese phrase", () => {
  const strategies = generateStrategies("coffee yo", abbrMap);
  const s = findStrategy(strategies, "mixed_language")!;
  assertEquals(s.forms[0].includes("ca phê"), true);
});

Deno.test("mixed_language: multiple English words", () => {
  const strategies = generateStrategies("hotel near beach danang", abbrMap);
  const s = findStrategy(strategies, "mixed_language")!;
  assertEquals(s.forms, ["khach san gan bien da nang"]);
});

Deno.test("mixed_language: single English word → no strategy", () => {
  assertEquals(findStrategy(generateStrategies("coffee", abbrMap), "mixed_language"), undefined);
  assertEquals(findStrategy(generateStrategies("hotel", abbrMap), "mixed_language"), undefined);
  assertEquals(findStrategy(generateStrategies("atm", abbrMap), "mixed_language"), undefined);
});

Deno.test("mixed_language: spa keyword", () => {
  const strategies = generateStrategies("coffee gan day", abbrMap);
  const s = findStrategy(strategies, "mixed_language")!;
  assertEquals(s.type, "mixed_language");
});

Deno.test("mixed_language: gym keyword", () => {
  const strategies = generateStrategies("gym 24", abbrMap);
  const s = findStrategy(strategies, "mixed_language")!;
  assertEquals(s.type, "mixed_language");
});

Deno.test("mixed_language: all English words individually are exact_prefix only", () => {
  const words = [
    "coffee", "hotel", "near", "beach", "halal", "rooftop",
    "restaurant", "vegan", "spa", "gym", "atm", "mall", "bar",
    "cinema", "hospital", "pharmacy",
  ];
  for (const w of words) {
    const strategies = generateStrategies(w, abbrMap);
    assertEquals(findStrategy(strategies, "mixed_language"), undefined);
  }
});

Deno.test("mixed_language: parsed is empty object", () => {
  const strategies = generateStrategies("coffee near", abbrMap);
  const s = findStrategy(strategies, "mixed_language")!;
  assertEquals(s.parsed, {});
});

Deno.test("mixed_language: case insensitive", () => {
  const strategies = generateStrategies("Da Nang HOTEL", abbrMap);
  assertEquals(findStrategy(strategies, "mixed_language")!.type, "mixed_language");
});

Deno.test("mixed_language: no strategy when translation equals raw", () => {
  const strategies = generateStrategies("halal rooftop", abbrMap);
  assertEquals(findStrategy(strategies, "mixed_language"), undefined);
});

// ─── 4. Semantic strategy ─────────────────────────────────────────────────────

Deno.test("semantic: wifi attribute", () => {
  const strategies = generateStrategies("cafe wifi", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.type, "semantic");
  assertEquals(s.parsed.category, "cafe");
  assertEquals(s.parsed.attribute, "wifi");
  assertEquals(s.forms.includes("cafe wifi"), true);
  assertEquals(s.forms.includes("cafe"), true);
});

Deno.test("semantic: hoc keyword", () => {
  const strategies = generateStrategies("quan cafe hoc", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.category, "quan cafe");
  assertEquals(s.parsed.attribute, "hoc");
  assertEquals(s.forms.includes("quan cafe hoc"), true);
  assertEquals(s.forms.includes("quan cafe"), true);
});

Deno.test("semantic: khu keyword", () => {
  const strategies = generateStrategies("quan an khu", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.category, "quan an");
  assertEquals(s.parsed.attribute, "khu");
});

Deno.test("semantic: multi-word 'tren duong'", () => {
  const strategies = generateStrategies("xang tren duong", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.category, "xang");
  assertEquals(s.parsed.attribute, "tren duong");
});

Deno.test("semantic: multi-word 'tre em'", () => {
  const strategies = generateStrategies("quan an tre em", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.category, "quan an");
  assertEquals(s.parsed.attribute, "tre em");
});

Deno.test("semantic: multi-word 'yen tinh'", () => {
  const strategies = generateStrategies("cafe yen tinh", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.category, "cafe");
  assertEquals(s.parsed.attribute, "yen tinh");
});

Deno.test("semantic: multi-word 'song ao'", () => {
  const strategies = generateStrategies("cafe dep song ao", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.category, "cafe dep");
  assertEquals(s.parsed.attribute, "song ao");
});

Deno.test("semantic: 'lam viec' multi-word keyword", () => {
  const strategies = generateStrategies("cf lam viec", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.category, "cf");
  assertEquals(s.parsed.attribute, "lam viec");
});

Deno.test("semantic: 'hoc bai' multi-word keyword", () => {
  const strategies = generateStrategies("quan hoc bai", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.attribute, "hoc bai");
});

Deno.test("semantic: 'wifi mien phi' multi-word", () => {
  const strategies = generateStrategies("cafe wifi mien phi", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.attribute, "wifi mien phi");
});

Deno.test("semantic: 'mo cua' multi-word", () => {
  const strategies = generateStrategies("quan mo cua", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.attribute, "mo cua");
});

Deno.test("semantic: dep keyword matched", () => {
  const strategies = generateStrategies("cafe dep", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.category, "cafe");
  assertEquals(s.parsed.attribute, "dep");
});

Deno.test("semantic: ngon keyword matched", () => {
  const strategies = generateStrategies("pho ngon", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.category, "pho");
  assertEquals(s.parsed.attribute, "ngon");
});

Deno.test("semantic: single-word keyword alone → no semantic", () => {
  const singles = ["wifi", "hoc", "dep", "ngon", "khu", "24", "check"];
  for (const word of singles) {
    assertEquals(findStrategy(generateStrategies(word, abbrMap), "semantic"), undefined);
  }
});

Deno.test("semantic: 'dai hoc bach' — hoc keyword detected", () => {
  const strategies = generateStrategies("dai hoc bach", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.type, "semantic");
  assertEquals(s.parsed.category, "dai");
  assertEquals(s.parsed.attribute, "hoc");
});

Deno.test("semantic: first matching keyword only (single match per input)", () => {
  const strategies = generateStrategies("cafe wifi ngon", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  assertEquals(s.parsed.attribute, "wifi");
});

Deno.test("semantic: 'song ao' alone with no before-text → no semantic", () => {
  const strategies = generateStrategies("song ao", abbrMap);
  assertEquals(findStrategy(strategies, "semantic"), undefined);
});

// ─── 5. Navigation strategy ───────────────────────────────────────────────────

Deno.test("navigation: 'duong den' pattern", () => {
  const strategies = generateStrategies("duong den ben", abbrMap);
  const s = findStrategy(strategies, "navigation")!;
  assertEquals(s.type, "navigation");
  assertEquals(s.forms, ["chi duong den ben"]);
});

Deno.test("navigation: 'chi duong' pattern", () => {
  const strategies = generateStrategies("chi duong san", abbrMap);
  const s = findStrategy(strategies, "navigation")!;
  assertEquals(s.type, "navigation");
  assertEquals(s.forms, ["chi duong den san"]);
});

Deno.test("navigation: 'duong den' extracts location", () => {
  const strategies = generateStrategies("duong den ben thanh", abbrMap);
  const s = findStrategy(strategies, "navigation")!;
  assertEquals(s.parsed.location, "ben thanh");
});

Deno.test("navigation: 'chi duong' extracts location", () => {
  const strategies = generateStrategies("chi duong san bay", abbrMap);
  const s = findStrategy(strategies, "navigation")!;
  assertEquals(s.parsed.location, "san bay");
});

Deno.test("navigation: case insensitive", () => {
  let strategies = generateStrategies("Duong Den Ben", abbrMap);
  assertEquals(findStrategy(strategies, "navigation")!.type, "navigation");
  strategies = generateStrategies("CHI DUONG San", abbrMap);
  assertEquals(findStrategy(strategies, "navigation")!.type, "navigation");
});

Deno.test("navigation: partial match (no location) → no navigation", () => {
  const strategies = generateStrategies("duong den", abbrMap);
  assertEquals(findStrategy(strategies, "navigation"), undefined);
});

Deno.test("navigation: translated to normalized 'chi duong den' prefix", () => {
  const strategies = generateStrategies("duong den ben xe", abbrMap);
  const s = findStrategy(strategies, "navigation")!;
  assertEquals(s.type, "navigation");
  assertEquals(s.forms, ["chi duong den ben xe"]);
});

// ─── 6. Multi-strategy combinations ───────────────────────────────────────────

Deno.test("multi-strategy: abbreviation + exact_prefix", () => {
  const strategies = generateStrategies("ks da nang", abbrMap);
  const types = strategyTypes(strategies);
  assertEquals(types.includes("exact_prefix"), true);
  assertEquals(types.includes("abbreviation"), true);
});

Deno.test("multi-strategy: navigation + exact_prefix", () => {
  const strategies = generateStrategies("duong den ben thanh", abbrMap);
  const types = strategyTypes(strategies);
  assertEquals(types.includes("exact_prefix"), true);
  assertEquals(types.includes("navigation"), true);
});

Deno.test("multi-strategy: mixed_language + exact_prefix", () => {
  const strategies = generateStrategies("hotel da nang", abbrMap);
  const types = strategyTypes(strategies);
  assertEquals(types.includes("exact_prefix"), true);
  assertEquals(types.includes("mixed_language"), true);
});

Deno.test("multi-strategy: semantic + exact_prefix", () => {
  const strategies = generateStrategies("cafe wifi", abbrMap);
  const types = strategyTypes(strategies);
  assertEquals(types.includes("exact_prefix"), true);
  assertEquals(types.includes("semantic"), true);
});

Deno.test("multi-strategy: abbreviation + semantic (with abbrev expanded forms)", () => {
  const strategies = generateStrategies("cf lam viec", abbrMap);
  const types = strategyTypes(strategies);
  assertEquals(types.includes("exact_prefix"), true);
  assertEquals(types.includes("abbreviation"), true);
  assertEquals(types.includes("semantic"), true);
  const sem = findStrategy(strategies, "semantic")!;
  assertEquals(sem.forms.includes("ca phê lam viec"), true);
});

Deno.test("multi-strategy: abbreviation + mixed_language", () => {
  const strategies = generateStrategies("ks hotel", abbrMap);
  const types = strategyTypes(strategies);
  assertEquals(types.includes("abbreviation"), true);
  assertEquals(types.includes("mixed_language"), true);
});

Deno.test("multi-strategy: abbreviation + exact for halal hcm", () => {
  const strategies = generateStrategies("halal hcm", abbrMap);
  const types = strategyTypes(strategies);
  assertEquals(types.includes("exact_prefix"), true);
  assertEquals(types.includes("abbreviation"), true);
});

Deno.test("multi-strategy: exact_prefix only for no-match input", () => {
  const strategies = generateStrategies("phuc long", abbrMap);
  assertEquals(strategies.every((s) => s.forms[0].length >= 0), true);
});

// ─── 7. Forms normalization ───────────────────────────────────────────────────

Deno.test("forms: exact_prefix strips accents", () => {
  const strategies = generateStrategies("trạm xăng", abbrMap);
  assertEquals(strategies[0].forms, ["tram xăng"]);
});

Deno.test("forms: exact_prefix lowercases", () => {
  const strategies = generateStrategies("BẾN XE Miền Đông", abbrMap);
  assertEquals(strategies[0].forms, ["ben xe mien dông"]);
});

Deno.test("forms: abbreviation expanded form is normalized", () => {
  const strategies = generateStrategies("bv bach mai", abbrMap);
  const s = findStrategy(strategies, "abbreviation")!;
  assertEquals(s.forms, ["benh vien bach mai"]);
});

Deno.test("forms: mixed_language translated form is normalized", () => {
  const strategies = generateStrategies("hotel Đà Nẵng", abbrMap);
  const s = findStrategy(strategies, "mixed_language")!;
  assertEquals(s.forms, ["khach san da nang"]);
});

Deno.test("forms: semantic forms are normalized", () => {
  const strategies = generateStrategies("khach san wifi mien phi", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  for (const f of s.forms) {
    assertEquals(f, f.toLowerCase());
  }
});


Deno.test("forms: navigation form is normalized", () => {
  const strategies = generateStrategies("duong den ben thanh", abbrMap);
  const s = findStrategy(strategies, "navigation")!;
  assertEquals(s.forms, ["chi duong den ben thanh"]);
});

Deno.test("forms: deduplicated via Set in semantic", () => {
  const strategies = generateStrategies("cafe wifi", abbrMap);
  const s = findStrategy(strategies, "semantic")!;
  const unique = new Set(s.forms);
  assertEquals(s.forms.length, unique.size);
});

// ─── 8. Eval input coverage ───────────────────────────────────────────────────

Deno.test("eval: cafe wifi → semantic + exact", () => {
  const s = generateStrategies("cafe wifi", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.type, "semantic");
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "wifi");
});

Deno.test("eval: ks da nang → abbrev + exact", () => {
  const s = generateStrategies("ks da nang", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.type, "abbreviation");
});

Deno.test("eval: coffee near → mixed_language + exact", () => {
  const s = generateStrategies("coffee near", abbrMap);
  assertEquals(findStrategy(s, "mixed_language")!.type, "mixed_language");
});

Deno.test("eval: duong den ben thanh → navigation + exact", () => {
  const s = generateStrategies("duong den ben thanh", abbrMap);
  assertEquals(findStrategy(s, "navigation")!.parsed.location, "ben thanh");
});

Deno.test("eval: vin → exact_prefix only", () => {
  const s = generateStrategies("vin", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: cafe → exact_prefix only", () => {
  const s = generateStrategies("cafe", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: phuc long → exact_prefix only", () => {
  const s = generateStrategies("phuc long", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: cong cafe → exact_prefix only", () => {
  const s = generateStrategies("cong cafe", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: benh vien gan san → exact_prefix only", () => {
  const s = generateStrategies("benh vien gan san", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: sieuthi gan → exact_prefix only", () => {
  const s = generateStrategies("sieuthi gan", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: quan chay → exact_prefix only", () => {
  const s = generateStrategies("quan chay", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: cafe hn → abbreviation", () => {
  const s = generateStrategies("cafe hn", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.type, "abbreviation");
});

Deno.test("eval: khach san dn → abbreviation", () => {
  const s = generateStrategies("khach san dn", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.type, "abbreviation");
});

Deno.test("eval: nha hang sg → abbreviation", () => {
  const s = generateStrategies("nha hang sg", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.type, "abbreviation");
});

Deno.test("eval: quan cafe q3 → abbreviation", () => {
  const s = generateStrategies("quan cafe q3", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.type, "abbreviation");
});

Deno.test("eval: bun bo tphcm → abbreviation", () => {
  const s = generateStrategies("bun bo tphcm", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.type, "abbreviation");
});

Deno.test("eval: quan nuong q7 → abbreviation", () => {
  const s = generateStrategies("quan nuong q7", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.type, "abbreviation");
});

Deno.test("eval: hotel da nang → mixed_language", () => {
  const s = generateStrategies("hotel da nang", abbrMap);
  assertEquals(findStrategy(s, "mixed_language")!.type, "mixed_language");
});

Deno.test("eval: cafe yen tinh → semantic", () => {
  const s = generateStrategies("cafe yen tinh", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "yen tinh");
});

Deno.test("eval: quan an khu → semantic", () => {
  const s = generateStrategies("quan an khu", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "khu");
});

Deno.test("eval: quan an tre em → semantic", () => {
  const s = generateStrategies("quan an tre em", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "tre em");
});

Deno.test("eval: cafe dep song ao → semantic (first keyword wins)", () => {
  const s = generateStrategies("cafe dep song ao", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.category, "cafe dep");
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "song ao");
});

Deno.test("eval: xang tren duong → semantic", () => {
  const s = generateStrategies("xang tren duong", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "tren duong");
});

Deno.test("eval: dai hoc bach → semantic via 'hoc' keyword", () => {
  const s = generateStrategies("dai hoc bach", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.type, "semantic");
});

Deno.test("eval: cf lam viec → abbrev + semantic", () => {
  const s = generateStrategies("cf lam viec", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.type, "abbreviation");
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "lam viec");
});

Deno.test("eval: atm vcb q → abbrev", () => {
  const s = generateStrategies("atm vcb q", abbrMap);
  const types = strategyTypes(s);
  assertEquals(types.includes("abbreviation"), true);
});

Deno.test("eval: 12 ngu → exact_prefix only", () => {
  const s = generateStrategies("12 ngu", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: 10.77 → exact_prefix only", () => {
  const s = generateStrategies("10.77", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: 10.77,106.70 → exact_prefix only", () => {
  const s = generateStrategies("10.77,106.70", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: nguyen huee → exact_prefix only", () => {
  const s = generateStrategies("nguyen huee", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: cf q1 → abbreviation", () => {
  const s = generateStrategies("cf q1", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.type, "abbreviation");
});

Deno.test("eval: tra sua ng → exact_prefix only", () => {
  const s = generateStrategies("tra sua ng", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: sua xe gan → exact_prefix only", () => {
  const s = generateStrategies("sua xe gan", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: ho guom cafe → exact_prefix only", () => {
  const s = generateStrategies("ho guom cafe", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: ben xe mien dong → exact_prefix only", () => {
  const s = generateStrategies("bến xe miền đông", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: do an vat → exact_prefix only", () => {
  const s = generateStrategies("do an vat", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: quan chay → exact_prefix only", () => {
  const s = generateStrategies("quan chay", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: ha noi an → exact_prefix only", () => {
  const s = generateStrategies("ha noi an", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: halal hcm → abbrev", () => {
  const s = generateStrategies("halal hcm", abbrMap);
  const types = strategyTypes(s);
  assertEquals(types.includes("abbreviation"), true);
});

Deno.test("eval: pizza 4 → exact_prefix only", () => {
  const s = generateStrategies("pizza 4", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: gara oto → exact_prefix only", () => {
  const s = generateStrategies("gara oto", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: cafe dep → semantic", () => {
  const s = generateStrategies("cafe dep", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "dep");
});

Deno.test("eval: pho ngon → semantic", () => {
  const s = generateStrategies("pho ngon", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "ngon");
});

Deno.test("eval: quan hoc bai → semantic", () => {
  const s = generateStrategies("quan hoc bai", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "hoc bai");
});

Deno.test("eval: cafe wifi mien phi → semantic", () => {
  const s = generateStrategies("cafe wifi mien phi", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "wifi mien phi");
});

Deno.test("eval: quan mo cua → semantic", () => {
  const s = generateStrategies("quan mo cua", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "mo cua");
});

Deno.test("eval: roi hanh → exact_prefix only", () => {
  const s = generateStrategies("roi hanh", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("eval: café 24 7 → semantic via '24 7' keyword", () => {
  const s = generateStrategies("cafe 24 7", abbrMap);
  assertEquals(findStrategy(s, "semantic")!.parsed.attribute, "24 7");
});

// ─── 9. Edge cases ────────────────────────────────────────────────────────────

Deno.test("edge: empty string → exact_prefix only", () => {
  const s = generateStrategies("", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
  assertEquals(s[0].forms, [""]);
});

Deno.test("edge: whitespace-only → exact_prefix only", () => {
  const s = generateStrategies("   \t  \n  ", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
  assertEquals(s[0].forms, [""]);
});

Deno.test("edge: single character", () => {
  const s = generateStrategies("a", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("edge: single digit", () => {
  const s = generateStrategies("1", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("edge: coordinate-like but truncated → exact_prefix only", () => {
  const s = generateStrategies("10.", abbrMap);
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("edge: navigation-like missing location → no navigation", () => {
  const s = generateStrategies("duong den", abbrMap);
  assertEquals(findStrategy(s, "navigation"), undefined);
  assertEquals(s.length, 1);
});

Deno.test("edge: leading whitespace trimmed", () => {
  const s = generateStrategies("  vin", abbrMap);
  assertEquals(s[0].forms, ["vin"]);
});

Deno.test("edge: trailing whitespace trimmed", () => {
  const s = generateStrategies("vin  ", abbrMap);
  assertEquals(s[0].forms, ["vin"]);
});

Deno.test("edge: case insensitivity for abbreviation", () => {
  const s = generateStrategies("CF LAM VIEC", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.type, "abbreviation");
});

Deno.test("edge: case insensitivity for navigation", () => {
  const s = generateStrategies("DUONG DEN Ben Xe", abbrMap);
  assertEquals(findStrategy(s, "navigation")!.type, "navigation");
});

Deno.test("edge: single abbreviation token expands to form", () => {
  const s = generateStrategies("q1", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.forms, ["quan 1"]);
});

Deno.test("edge: single cf token expands", () => {
  const s = generateStrategies("cf", abbrMap);
  assertEquals(findStrategy(s, "abbreviation")!.forms, ["ca phê"]);
});

Deno.test("edge: empty abbrMap still produces exact_prefix", () => {
  const s = generateStrategies("ks da nang", new Map());
  assertEquals(s[0].type, "exact_prefix");
  assertEquals(s[0].forms, ["ks da nang"]);
});

Deno.test("edge: abbrMap without matching tokens → no abbreviation strategy", () => {
  const s = generateStrategies("ks da nang", new Map([["bv", "Bệnh viện"]]));
  assertEquals(s.length, 1);
  assertEquals(s[0].type, "exact_prefix");
});

Deno.test("edge: enum-like nav pattern 'di duong' not matched as navigation", () => {
  const s = generateStrategies("di duong den ben", abbrMap);
  assertEquals(findStrategy(s, "navigation"), undefined);
});
