/**
 * Semantic embedding test — prove embedding solves the 3 remaining failures.
 *
 * Tests pure cosine similarity between user input and candidate suggestions.
 * No Trie, no rules, no DB — just embedding similarity.
 */

import { assertEquals } from "@std/assert";
import { createEmbeddingService } from "./embedding.service.ts";

const TEST_CASES = [
  {
    id: "PUB021",
    input: "quan cafe hoc",
    correct: "Quán cà phê phù hợp học tập",
    distractors: [
      "quán cafe học bài",
      "quán cafe gần đây hà nội",
      "quán cafe đẹp hà nội",
      "quán cafe view đẹp sài gòn",
    ],
    note: "Semantic: hoc → học tập matching",
  },
  {
    id: "PUB032",
    input: "halal hcm",
    correct: "Nhà hàng halal TP.HCM",
    distractors: [
      "sân bay nội bài",
      "thời tiết hôm nay",
      "khách sạn gần đây",
      "nhà hàng ngon gần đây",
    ],
    note: "Cross-lingual: English query → Vietnamese answer",
  },
  {
    id: "PUB034",
    input: "my khe hotel",
    correct: "Khách sạn gần biển Mỹ Khê",
    distractors: [
      "sân bay nội bài",
      "khách sạn gần đây",
      "trạm xăng gần nhất",
      "cửa hàng tiện lợi 24h",
    ],
    note: "Cross-lingual: EN query → VI answer with location context",
  },
];

Deno.test("EmbeddingService — model loads", async () => {
  const svc = createEmbeddingService({
    model: "Xenova/all-MiniLM-L6-v2", // Tiny model for fast CI
  });
  await svc.load();
  assertEquals(svc.isLoaded(), true);
});

Deno.test("EmbeddingService — embed returns valid vector", async () => {
  const svc = createEmbeddingService({ model: "Xenova/all-MiniLM-L6-v2" });
  const result = await svc.embed("quán cà phê");
  assertEquals(result.dim, 384);
  assertEquals(result.vector.length, 384);
  // Normalized: magnitude ≈ 1.0
  const mag = Math.sqrt(result.vector.reduce((s: number, v: number) => s + v * v, 0));
  assertEquals(Math.abs(mag - 1.0) < 0.01, true);
});

Deno.test("EmbeddingService — cosineSimilarity self = 1.0", async () => {
  const svc = createEmbeddingService({ model: "Xenova/all-MiniLM-L6-v2" });
  const v = await svc.embed("test");
  const sim = svc.cosineSimilarity(v.vector, v.vector);
  assertEquals(Math.abs(sim - 1.0) < 0.001, true);
});

Deno.test("EmbeddingService — semantic similarity: related > unrelated", async () => {
  const svc = createEmbeddingService({ model: "Xenova/all-MiniLM-L6-v2" });
  const input = await svc.embed("coffee shop");
  const related = await svc.embed("quán cà phê");
  const unrelated = await svc.embed("bệnh viện gần đây");

  const simRelated = svc.cosineSimilarity(input.vector, related.vector);
  const simUnrelated = svc.cosineSimilarity(input.vector, unrelated.vector);

  console.log(`  coffee↔cà phê: ${simRelated.toFixed(4)}, coffee↔bệnh viện: ${simUnrelated.toFixed(4)}`);
  assertEquals(simRelated > simUnrelated, true, "Related pair should have higher similarity");
});

// ---------------------------------------------------------------------------
// Full eval simulator: for each case, rank candidates by cosine similarity.
// The correct answer must appear in top-1 or at least top-3.
// ---------------------------------------------------------------------------

Deno.test("EmbeddingService — simulates retrieval for 3 failing cases (multilingual)", async () => {
  const svc = createEmbeddingService(); // Uses multilingual-e5-small default
  await svc.load();

  let top1 = 0;
  let top3 = 0;

  for (const tc of TEST_CASES) {
    const qVec = await svc.embed(tc.input);

    const candidates = [tc.correct, ...tc.distractors];
    const scored = await Promise.all(
      candidates.map(async (c) => {
        const cVec = await svc.embed(c);
        const sim = svc.cosineSimilarity(qVec.vector, cVec.vector);
        return { text: c, score: sim };
      }),
    );
    scored.sort((a, b) => b.score - a.score);

    console.log(`\n  ${tc.id}: "${tc.input}" → top-3:`);
    for (let i = 0; i < Math.min(3, scored.length); i++) {
      const marker = scored[i].text === tc.correct ? " ✓" : "";
      console.log(`    ${i + 1}. "${scored[i].text}" (${scored[i].score.toFixed(4)})${marker}`);
    }

    const rank = scored.findIndex((s) => s.text === tc.correct) + 1;
    if (rank === 1) top1++;
    if (rank <= 3) top3++;
    console.log(`    Correct rank: ${rank} | ${tc.note}`);
  }

  console.log(`\n  Top-1: ${top1}/${TEST_CASES.length}, Top-3: ${top3}/${TEST_CASES.length}`);
  assertEquals(top3, TEST_CASES.length, "All correct answers should be in top-3 by embedding similarity");
});

Deno.test("EmbeddingService — pure-Vietnamese semantic (all-MiniLM for coverage)", async () => {
  const svc = createEmbeddingService({
    model: "Xenova/all-MiniLM-L6-v2",
  });
  await svc.load();

  const q = await svc.embed("quan cafe hoc");
  const correct = await svc.embed("Quán cà phê phù hợp học tập");
  const wrong = await svc.embed("quán cafe đẹp hà nội");

  const simCorrect = svc.cosineSimilarity(q.vector, correct.vector);
  const simWrong = svc.cosineSimilarity(q.vector, wrong.vector);

  console.log(`  "quan cafe hoc" ↔ correct: ${simCorrect.toFixed(4)}`);
  console.log(`  "quan cafe hoc" ↔ wrong: ${simWrong.toFixed(4)}`);
  assertEquals(simCorrect > simWrong, true);
});
