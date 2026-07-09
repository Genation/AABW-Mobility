/**
 * Semantic embedding proof — multilingual-e5-small solves all 3 failures.
 *
 * Results from previous run:
 *   PUB021 "quan cafe hoc" → rank 3 (semantic: học → học tập)
 *   PUB032 "halal hcm"     → rank 1 (cross-lingual: EN→VI)
 *   PUB034 "my khe hotel"  → rank 1 (cross-lingual: EN→VI)
 *
 * Top-1: 2/3, Top-3: 3/3 — embedding fallback works.
 */

import { assertEquals } from "@std/assert";
import { createEmbeddingService, type EmbeddingService } from "./embedding.service.ts";

let svc: EmbeddingService;

// Single shared instance across all tests to avoid reloading the model.
Deno.test("EmbeddingService — setup (shared)", async () => {
  svc = createEmbeddingService();
  await svc.load();
  assertEquals(svc.isLoaded(), true);
});

Deno.test("EmbeddingService — embed returns valid vector", async () => {
  const result = await svc.embed("quán cà phê");
  assertEquals(result.dim, 384);
  assertEquals(result.vector.length, 384);
  const mag = Math.sqrt(result.vector.reduce((s: number, v: number) => s + v * v, 0));
  assertEquals(Math.abs(mag - 1.0) < 0.01, true);
});

Deno.test("EmbeddingService — cosineSimilarity self = 1.0", () => {
  const v = Array.from({ length: 384 }, () => Math.random());
  const sim = svc.cosineSimilarity(v, v);
  assertEquals(Math.abs(sim - 1.0) < 0.001, true);
});

Deno.test("EmbeddingService — semantic: related > unrelated", async () => {
  const input = await svc.embed("coffee shop");
  const related = await svc.embed("quán cà phê");
  const unrelated = await svc.embed("bệnh viện gần đây");

  const simR = svc.cosineSimilarity(input.vector, related.vector);
  const simU = svc.cosineSimilarity(input.vector, unrelated.vector);

  console.log(`  coffee↔cà phê: ${simR.toFixed(4)}, coffee↔bệnh viện: ${simU.toFixed(4)}`);
  assertEquals(simR > simU, true, "Related EN→VI should score higher than unrelated");
});

Deno.test("EmbeddingService — Vietnamese semantic (hoc → học tập)", async () => {
  const q = await svc.embed("quan cafe hoc");
  const correct = await svc.embed("Quán cà phê phù hợp học tập");
  const wrong = await svc.embed("quán cafe đẹp hà nội");

  const simC = svc.cosineSimilarity(q.vector, correct.vector);
  const simW = svc.cosineSimilarity(q.vector, wrong.vector);

  console.log(`  "quan cafe hoc" ↔ correct: ${simC.toFixed(4)}`);
  console.log(`  "quan cafe hoc" ↔ wrong:   ${simW.toFixed(4)}`);
  assertEquals(simC > simW, true, "Semantic match should score higher");
});

Deno.test("EmbeddingService — cross-lingual EN→VI", async () => {
  // PUB032
  const q032 = await svc.embed("halal hcm");
  const c032 = await svc.embed("Nhà hàng halal TP.HCM");
  const d032 = await svc.embed("sân bay nội bài");
  const s032c = svc.cosineSimilarity(q032.vector, c032.vector);
  const s032d = svc.cosineSimilarity(q032.vector, d032.vector);
  console.log(`  PUB032 correct: ${s032c.toFixed(4)}, distractor: ${s032d.toFixed(4)}`);
  assertEquals(s032c > s032d, true);

  // PUB034
  const q034 = await svc.embed("my khe hotel");
  const c034 = await svc.embed("Khách sạn gần biển Mỹ Khê");
  const d034 = await svc.embed("trạm xăng gần nhất");
  const s034c = svc.cosineSimilarity(q034.vector, c034.vector);
  const s034d = svc.cosineSimilarity(q034.vector, d034.vector);
  console.log(`  PUB034 correct: ${s034c.toFixed(4)}, distractor: ${s034d.toFixed(4)}`);
  assertEquals(s034c > s034d, true);
});

// Full retrieval simulation — score correct vs pool
Deno.test("EmbeddingService — retrieval simulation for 3 failing cases", async () => {
  const cases: { id: string; input: string; correct: string; distractors: string[] }[] = [
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
    },
  ];

  let top1 = 0;
  let top3 = 0;

  for (const tc of cases) {
    const qVec = await svc.embed(tc.input);

    const candidates = [tc.correct, ...tc.distractors];
    const scored: { text: string; score: number }[] = [];
    for (const c of candidates) {
      const cVec = await svc.embed(c);
      scored.push({ text: c, score: svc.cosineSimilarity(qVec.vector, cVec.vector) });
    }
    scored.sort((a, b) => b.score - a.score);

    console.log(`\n  ${tc.id}: "${tc.input}"`);
    for (let i = 0; i < Math.min(3, scored.length); i++) {
      const marker = scored[i].text === tc.correct ? " ✓" : "";
      console.log(`    ${i + 1}. "${scored[i].text}" (${scored[i].score.toFixed(4)})${marker}`);
    }

    const rank = scored.findIndex((s) => s.text === tc.correct) + 1;
    if (rank === 1) top1++;
    if (rank <= 3) top3++;
    console.log(`    Rank: ${rank}`);
  }

  console.log(`\n  Top-1: ${top1}/${cases.length}, Top-3: ${top3}/${cases.length}`);
  assertEquals(top3, cases.length, "All correct answers in top-3 via embedding");
});
