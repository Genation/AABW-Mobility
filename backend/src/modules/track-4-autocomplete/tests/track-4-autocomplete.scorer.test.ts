import { assert, assertEquals } from "@std/assert";

import {
  scoreAutocomplete,
  scorePOI,
  scorePopularQuery,
  scoreTemplate,
} from "../core/scorer.ts";

// =============================================================================
// scoreAutocomplete
// =============================================================================

Deno.test("scoreAutocomplete: ground truth (isGenerated=false, full prefix) maps originalScore to [0.80, 0.99]", () => {
  const result = scoreAutocomplete(0.82, null, 10, 10, false);
  assertEquals(result, 0.80 + 0.82 * 0.19);
});

Deno.test("scoreAutocomplete: prefix variant decays by length ratio", () => {
  const full = scoreAutocomplete(0.9, null, 10, 10, false);
  const prefix = scoreAutocomplete(0.9, null, 5, 10, false);
  assert(prefix < full, "prefix variant should score lower than full match");
  assertEquals(prefix, 0.80 + (0.9 * 0.19) * (5 / 10));
});

Deno.test("scoreAutocomplete: shorter prefix = lower score", () => {
  const prefix3 = scoreAutocomplete(0.9, null, 3, 10, false);
  const prefix7 = scoreAutocomplete(0.9, null, 7, 10, false);
  assert(prefix3 < prefix7, "shorter prefix should have lower score");
});

Deno.test("scoreAutocomplete: prefix variant never exceeds full-length ground truth", () => {
  const groundTruth = scoreAutocomplete(0.9, null, 10, 10, false);
  const prefix = scoreAutocomplete(0.9, null, 9, 10, false);
  assert(
    prefix < groundTruth,
    "prefix variant must be strictly less than ground truth",
  );
});

Deno.test("scoreAutocomplete: generated with frequency scores by freq ratio", () => {
  const result = scoreAutocomplete(0.9, 5000, 5, 10, true);
  assertEquals(result, 0.25 + (5000 / 15000) * 0.14);
});

Deno.test("scoreAutocomplete: generated with frequency at MAX caps at 0.39", () => {
  const result = scoreAutocomplete(0.9, 15000, 5, 10, true);
  assertEquals(result, 0.25 + 1.0 * 0.14);
});

Deno.test("scoreAutocomplete: generated with frequency > MAX caps at 0.39", () => {
  const result = scoreAutocomplete(0.9, 20000, 5, 10, true);
  assertEquals(result, 0.25 + 1.0 * 0.14);
});

Deno.test("scoreAutocomplete: generated with null frequency defaults to 0.3 freq ratio", () => {
  const result = scoreAutocomplete(0.9, null, 5, 10, true);
  assertEquals(result, 0.25 + 0.3 * 0.14);
});

Deno.test("scoreAutocomplete: generated data scores lower than equivalent non-generated", () => {
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

Deno.test("scorePopularQuery: frequency at MAX returns 0.74 for non-generated", () => {
  const result = scorePopularQuery(15000, false);
  assertEquals(result, 0.60 + 1.0 * 0.14);
});

Deno.test("scorePopularQuery: frequency at MAX returns 0.49 for generated", () => {
  const result = scorePopularQuery(15000, true);
  assertEquals(result, 0.40 + 1.0 * 0.09);
});

Deno.test("scorePopularQuery: frequency > MAX caps at tier ceiling", () => {
  const result = scorePopularQuery(30000, false);
  assertEquals(result, 0.60 + 1.0 * 0.14);
});

Deno.test("scorePopularQuery: generated scores lower than equivalent non-generated", () => {
  const nonGenerated = scorePopularQuery(5000, false);
  const generated = scorePopularQuery(5000, true);
  assert(
    generated < nonGenerated,
    "generated should score lower than original",
  );
});

Deno.test("scorePopularQuery: zero frequency returns tier base (not zero)", () => {
  assertEquals(scorePopularQuery(0, false), 0.60);
  assertEquals(scorePopularQuery(0, true), 0.40);
});

// =============================================================================
// scorePOI
// =============================================================================

Deno.test("scorePOI: popularity 98 maps to [0.50, 0.59] range", () => {
  assertEquals(scorePOI(98), 0.50 + (98 / 100) * 0.09);
});

Deno.test("scorePOI: popularity 50 maps to mid-range", () => {
  assertEquals(scorePOI(50), 0.50 + (50 / 100) * 0.09);
});

Deno.test("scorePOI: popularity 0 returns tier base 0.50", () => {
  assertEquals(scorePOI(0), 0.50);
});

Deno.test("scorePOI: popularity 100 returns max 0.59", () => {
  assertEquals(scorePOI(100), 0.59);
});

Deno.test("scorePOI: popularity > 100 is capped at 100", () => {
  assertEquals(scorePOI(150), 0.59);
});

// =============================================================================
// scoreTemplate
// =============================================================================

Deno.test("scoreTemplate: brand_nearby returns 0.24", () => {
  assertEquals(scoreTemplate("brand_nearby"), 0.24);
});

Deno.test("scoreTemplate: category_nearby returns 0.22", () => {
  assertEquals(scoreTemplate("category_nearby"), 0.22);
});

Deno.test("scoreTemplate: category_city returns 0.20", () => {
  assertEquals(scoreTemplate("category_city"), 0.20);
});

Deno.test("scoreTemplate: category_attribute returns 0.18", () => {
  assertEquals(scoreTemplate("category_attribute"), 0.18);
});

Deno.test("scoreTemplate: discovery returns 0.16", () => {
  assertEquals(scoreTemplate("discovery"), 0.16);
});

Deno.test("scoreTemplate: navigation returns 0.14", () => {
  assertEquals(scoreTemplate("navigation"), 0.14);
});

Deno.test("scoreTemplate: category_entry returns 0.12", () => {
  assertEquals(scoreTemplate("category_entry"), 0.12);
});

Deno.test("scoreTemplate: unknown type defaults to 0.12", () => {
  assertEquals(scoreTemplate("unknown_type"), 0.12);
  assertEquals(scoreTemplate(""), 0.12);
});

// =============================================================================
// Tier separation guarantees
// =============================================================================

Deno.test("tier: ground truth always outranks popular query original", () => {
  const gtMin = scoreAutocomplete(0.01, null, 3, 20, false);
  const pqMax = scorePopularQuery(20000, false);
  assert(
    gtMin > pqMax,
    `ground truth min ${gtMin} should exceed popular query max ${pqMax}`,
  );
});

Deno.test("tier: ground truth always outranks POI name", () => {
  const gtMin = scoreAutocomplete(0.01, null, 3, 20, false);
  const poiMax = scorePOI(100);
  assert(
    gtMin > poiMax,
    `ground truth min ${gtMin} should exceed POI max ${poiMax}`,
  );
});

Deno.test("tier: ground truth always outranks generated entries", () => {
  const gtMin = scoreAutocomplete(0.01, null, 3, 20, false);
  const acGenMax = scoreAutocomplete(0.99, 20000, 5, 10, true);
  const pqGenMax = scorePopularQuery(20000, true);
  assert(
    gtMin > acGenMax,
    `ground truth min ${gtMin} should exceed autocomplete gen max ${acGenMax}`,
  );
  assert(
    gtMin > pqGenMax,
    `ground truth min ${gtMin} should exceed popular gen max ${pqGenMax}`,
  );
});

Deno.test("tier: ground truth always outranks templates", () => {
  const gtMin = scoreAutocomplete(0.01, null, 3, 20, false);
  const tplMax = scoreTemplate("brand_nearby");
  assert(
    gtMin > tplMax,
    `ground truth min ${gtMin} should exceed template max ${tplMax}`,
  );
});

Deno.test("tier: popular query original always outranks POI name", () => {
  const pqMin = scorePopularQuery(0, false);
  const poiMax = scorePOI(100);
  assert(
    pqMin > poiMax,
    `popular original min ${pqMin} should exceed POI max ${poiMax}`,
  );
});

Deno.test("tier: popular query original always outranks generated entries", () => {
  const pqMin = scorePopularQuery(0, false);
  const acGenMax = scoreAutocomplete(0.99, 20000, 5, 10, true);
  const pqGenMax = scorePopularQuery(20000, true);
  assert(
    pqMin > acGenMax,
    `popular original min ${pqMin} should exceed autocomplete gen max ${acGenMax}`,
  );
  assert(
    pqMin > pqGenMax,
    `popular original min ${pqMin} should exceed popular gen max ${pqGenMax}`,
  );
});

Deno.test("tier: POI name always outranks generated entries", () => {
  const poiMin = scorePOI(0);
  const acGenMax = scoreAutocomplete(0.99, 20000, 5, 10, true);
  const pqGenMax = scorePopularQuery(20000, true);
  assert(
    poiMin > acGenMax,
    `POI min ${poiMin} should exceed autocomplete gen max ${acGenMax}`,
  );
  assert(
    poiMin > pqGenMax,
    `POI min ${poiMin} should exceed popular gen max ${pqGenMax}`,
  );
});

Deno.test("tier: POI name always outranks templates", () => {
  const poiMin = scorePOI(0);
  const tplMax = scoreTemplate("brand_nearby");
  assert(
    poiMin > tplMax,
    `POI min ${poiMin} should exceed template max ${tplMax}`,
  );
});

Deno.test("tier: generated entries always outrank templates", () => {
  const acGenMin = scoreAutocomplete(0.01, 0, 5, 10, true);
  const pqGenMin = scorePopularQuery(0, true);
  const tplMax = scoreTemplate("brand_nearby");
  assert(
    acGenMin > tplMax,
    `autocomplete gen min ${acGenMin} should exceed template max ${tplMax}`,
  );
  assert(
    pqGenMin > tplMax,
    `popular gen min ${pqGenMin} should exceed template max ${pqGenMin}`,
  );
});
