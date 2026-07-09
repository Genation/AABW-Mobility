import { assertEquals } from "jsr:@std/assert";
import { EN_VI_MAP, normalize, translateToVI } from "../../engine/expander.ts";

// --- EN_VI_MAP ---

Deno.test("EN_VI_MAP has expected size", () => {
  assertEquals(Object.keys(EN_VI_MAP).length, 17);
});

Deno.test("EN_VI_MAP: common English words map to correct Vietnamese", () => {
  assertEquals(EN_VI_MAP["coffee"], "c\u00e0 ph\u00ea");
  assertEquals(EN_VI_MAP["hotel"], "kh\u00e1ch s\u1ea1n");
  assertEquals(EN_VI_MAP["near"], "g\u1ea7n");
  assertEquals(EN_VI_MAP["beach"], "bi\u1ec3n");
  assertEquals(EN_VI_MAP["restaurant"], "nh\u00e0 h\u00e0ng");
  assertEquals(EN_VI_MAP["hospital"], "b\u1ec7nh vi\u1ec7n");
});

Deno.test("EN_VI_MAP: loanword entries are identity mappings", () => {
  assertEquals(EN_VI_MAP["halal"], "halal");
  assertEquals(EN_VI_MAP["rooftop"], "rooftop");
  assertEquals(EN_VI_MAP["atm"], "ATM");
  assertEquals(EN_VI_MAP["bar"], "bar");
  assertEquals(EN_VI_MAP["spa"], "spa");
});

Deno.test("EN_VI_MAP: multi-word Vietnamese values are correct", () => {
  assertEquals(EN_VI_MAP["cinema"], "r\u1ea1p chi\u1ebfu phim");
  assertEquals(EN_VI_MAP["pharmacy"], "nh\u00e0 thu\u1ed1c");
  assertEquals(EN_VI_MAP["mall"], "trung t\u00e2m th\u01b0\u01a1ng m\u1ea1i");
  assertEquals(EN_VI_MAP["gym"], "ph\u00f2ng gym");
});

// --- translateToVI ---

Deno.test("translateToVI: single English word becomes Vietnamese", () => {
  assertEquals(translateToVI("coffee"), "c\u00e0 ph\u00ea");
  assertEquals(translateToVI("hotel"), "kh\u00e1ch s\u1ea1n");
});

Deno.test("translateToVI: mixed EN/VI input translates only known words", () => {
  assertEquals(translateToVI("coffee near"), "c\u00e0 ph\u00ea g\u1ea7n");
  assertEquals(translateToVI("hotel near beach danang"), "kh\u00e1ch s\u1ea1n g\u1ea7n bi\u1ec3n \u0111\u00e0 n\u1eb5ng");
});

Deno.test("translateToVI: only unknown words returns unchanged", () => {
  assertEquals(translateToVI("c\u00e0 ph\u00ea"), "c\u00e0 ph\u00ea");
  assertEquals(translateToVI("khach san"), "khach san");
});

Deno.test("translateToVI: preserves case-folding (handles mixed case)", () => {
  assertEquals(translateToVI("Coffee"), "c\u00e0 ph\u00ea");
  assertEquals(translateToVI("HOTEL"), "kh\u00e1ch s\u1ea1n");
});

Deno.test("translateToVI: empty string returns empty", () => {
  assertEquals(translateToVI(""), "");
});

// --- normalize ---

Deno.test("normalize: lowercases input", () => {
  assertEquals(normalize("Cafe"), "cafe");
  assertEquals(normalize("H\u1ed8I AN"), "hoi an");
});

Deno.test("normalize: strips Vietnamese accents", () => {
  assertEquals(normalize("kh\u00e1ch s\u1ea1n"), "khach san");
  assertEquals(normalize("\u0111\u00e0 n\u1eb5ng"), "da nang");
  assertEquals(normalize("b\u1ec7nh vi\u1ec7n"), "benh vien");
  assertEquals(normalize("c\u00e0 ph\u00ea"), "ca ph\u00ea");
});

Deno.test("normalize: removes punctuation", () => {
  assertEquals(normalize("cafe, wifi"), "cafe wifi");
  assertEquals(normalize("hotel (near) beach!"), "hotel near beach");
  assertEquals(normalize("test; test: test"), "test test test");
});

Deno.test("normalize: collapses multiple whitespace", () => {
  assertEquals(normalize("cafe    wifi"), "cafe wifi");
  assertEquals(normalize("  cafe   wifi  "), "cafe wifi");
  assertEquals(normalize("cafe\nwifi"), "cafe wifi");
});

Deno.test("normalize: handles empty / whitespace-only input", () => {
  assertEquals(normalize(""), "");
  assertEquals(normalize("   "), "");
});

Deno.test("normalize: mixed effects -- accents + caps + punctuation + whitespace", () => {
  assertEquals(
    normalize("Nguy\u1ec5n Hu\u1ec7,   Qu\u1eadn 1!\n"),
    "nguyen hue quan 1",
  );
});
