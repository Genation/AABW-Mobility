import { assert, assertEquals } from "jsr:@std/assert";

import {
  scoreAutocomplete,
  scorePOI,
  scorePopularQuery,
  scoreTemplate,
} from "../track-4-autocomplete.scorer.ts";

// =============================================================================
// scoreAutocomplete
// =============================================================================

Deno.test("scoreAutocomplete: ground truth keeps original score (isGenerated=false, full prefix)", () => {
  const result = scoreAutocomplete(0.82, null, 10, 10, false);
  assertEquals(result, 0.82);
});

Deno.test("scoreAutocomplete: prefix variant decays by length ratio", () => {
  // score = 0.9 * (0.85 + 0.15 * 5/10) = 0.9 * 0.925 = 0.8325
  const full = scoreAutocomplete(0.9, null, 10, 10, false);
  const prefix = scoreAutocomplete(0.9, null, 5, 10, false);
  assert(prefix < full, "prefix variant should score lower than full match");
  assertEquals(prefix, 0.9 * (0.85 + 0.15 * 5 / 10));
});

Deno.test("scoreAutocomplete: shorter prefix = lower score", () => {
  const prefix3 = scoreAutocomplete(0.9, null, 3, 10, false);
  const prefix7 = scoreAutocomplete(0.9, null, 7, 10, false);
  assert(prefix3 < prefix7, "shorter prefix should have lower score");
});

Deno.test("scoreAutocomplete: prefix variant never exceeds ground truth score", () => {
  const groundTruth = scoreAutocomplete(0.9, null, 10, 10, false);
  const prefix = scoreAutocomplete(0.9, null, 9, 10, false);
  assert(
    prefix < groundTruth,
    "prefix variant must be strictly less than ground truth",
  );
});

Deno.test("scoreAutocomplete: generated with frequency scores by freq ratio", () => {
  // score = (5000 / MAX_FREQUENCY) * 0.55 = (5000/15000) * 0.55 = 0.1833...
  const result = scoreAutocomplete(0.9, 5000, 5, 10, true);
  assertEquals(result, (5000 / 15000) * 0.55);
});

Deno.test("scoreAutocomplete: generated with frequency at max caps at 0.55", () => {
  const result = scoreAutocomplete(0.9, 15000, 5, 10, true);
  assertEquals(result, 0.55);
});

Deno.test("scoreAutocomplete: generated with frequency > MAX caps at 0.55", () => {
  const result = scoreAutocomplete(0.9, 20000, 5, 10, true);
  assertEquals(result, 0.55);
});

Deno.test("scoreAutocomplete: generated with null frequency defaults to 0.3 * 0.55", () => {
  const result = scoreAutocomplete(0.9, null, 5, 10, true);
  assertEquals(result, 0.3 * 0.55);
});

Deno.test("scoreAutocomplete: generated data scores lower than equivalent non-generated", () => {
  // non-generated partial: 0.9 * (0.85 + 0.15) = 0.9
  const nonGenerated = scoreAutocomplete(0.9, 15000, 8, 10, false);
  const generated = scoreAutocomplete(0.9, 15000, 8, 10, true);
  assert(
    generated < nonGenerated,
    "generated should score lower than non-generated",
  );
});

Deno.test("scoreAutocomplete: originalScore is ignored when isGenerated=true", () => {
  const high = scoreAutocomplete(0.99, 3000, 5, 10, true);
  const low = scoreAutocomplete(0.1, 3000, 5, 10, true);
  assertEquals(high, low);
});

// =============================================================================
// scorePopularQuery
// =============================================================================

Deno.test("scorePopularQuery: higher frequency = higher score (non-generated)", () => {
  const low = scorePopularQuery(100, false);
  const high = scorePopularQuery(5000, false);
  assert(high > low, "higher frequency should produce higher score");
});

Deno.test("scorePopularQuery: higher frequency = higher score (generated)", () => {
  const low = scorePopularQuery(100, true);
  const high = scorePopularQuery(5000, true);
  assert(high > low, "higher frequency should produce higher score");
});

Deno.test("scorePopularQuery: frequency at MAX returns 0.75 for non-generated", () => {
  const result = scorePopularQuery(15000, false);
  assertEquals(result, 0.75);
});

Deno.test("scorePopularQuery: frequency at MAX returns 0.55 for generated", () => {
  const result = scorePopularQuery(15000, true);
  assertEquals(result, 0.55);
});

Deno.test("scorePopularQuery: frequency > MAX caps at multiplier", () => {
  const result = scorePopularQuery(30000, false);
  assertEquals(result, 0.75);
});

Deno.test("scorePopularQuery: generated scores lower than equivalent non-generated", () => {
  const nonGenerated = scorePopularQuery(5000, false);
  const generated = scorePopularQuery(5000, true);
  assert(
    generated < nonGenerated,
    "generated should score lower than original",
  );
});

Deno.test("scorePopularQuery: zero frequency returns 0", () => {
  assertEquals(scorePopularQuery(0, false), 0);
  assertEquals(scorePopularQuery(0, true), 0);
});

// =============================================================================
// scorePOI
// =============================================================================

Deno.test("scorePOI: popularity 98 returns 0.98", () => {
  assertEquals(scorePOI(98), 0.98);
});

Deno.test("scorePOI: popularity 50 returns 0.50", () => {
  assertEquals(scorePOI(50), 0.50);
});

Deno.test("scorePOI: popularity 0 returns 0", () => {
  assertEquals(scorePOI(0), 0);
});

Deno.test("scorePOI: popularity 100 returns 1.00", () => {
  assertEquals(scorePOI(100), 1.0);
});

// =============================================================================
// scoreTemplate
// =============================================================================

Deno.test("scoreTemplate: brand_nearby returns 0.55", () => {
  assertEquals(scoreTemplate("brand_nearby"), 0.55);
});

Deno.test("scoreTemplate: category_nearby returns 0.50", () => {
  assertEquals(scoreTemplate("category_nearby"), 0.50);
});

Deno.test("scoreTemplate: category_city returns 0.48", () => {
  assertEquals(scoreTemplate("category_city"), 0.48);
});

Deno.test("scoreTemplate: category_attribute returns 0.46", () => {
  assertEquals(scoreTemplate("category_attribute"), 0.46);
});

Deno.test("scoreTemplate: discovery returns 0.42", () => {
  assertEquals(scoreTemplate("discovery"), 0.42);
});

Deno.test("scoreTemplate: navigation returns 0.40", () => {
  assertEquals(scoreTemplate("navigation"), 0.40);
});

Deno.test("scoreTemplate: category_entry returns 0.35", () => {
  assertEquals(scoreTemplate("category_entry"), 0.35);
});

Deno.test("scoreTemplate: unknown type defaults to 0.40", () => {
  assertEquals(scoreTemplate("unknown_type"), 0.40);
  assertEquals(scoreTemplate(""), 0.40);
});
