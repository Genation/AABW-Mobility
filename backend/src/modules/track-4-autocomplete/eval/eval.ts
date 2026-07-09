import { autocompleteEngine } from "../engine/engine.ts";
import { track4Repo } from "../repo/repo.ts";
import { normalize } from "../core/nlp.ts";
import { logger } from "@/configs/logger.ts";

interface EvalResult {
  caseId: string;
  inputPrefix: string;
  difficulty: string;
  expectedType: string;
  suggestedType: string;
  expected: string[];
  found: string[];
  matched: string[];
  rankOfFirstMatch: number | null;
  reciprocalRank: number;
  source: string;
  latencyMs: number;
}

interface SourceStats {
  count: number;
  mrr: number;
  avgLatencyMs: number;
}

interface TypeStats {
  count: number;
  mrr: number;
  successRate: number;
}

interface EvalReport {
  totalCases: number;
  metrics: {
    mrr: number;
    recallAt1: number;
    recallAt3: number;
    recallAt5: number;
    recallAt10: number;
    precisionAt5: number;
    precisionAt10: number;
    successRate: number;
    coverage: number;
    avgLatencyMs: number;
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
  };
  byDifficulty: Record<string, { count: number; mrr: number; successRate: number }>;
  byType: Record<string, TypeStats>;
  bySource: Record<string, SourceStats>;
  failures: { caseId: string; prefix: string; expected: string[] }[];
  details: EvalResult[];
}

function isMatch(display: string, expected: string): boolean {
  const d = normalize(display).replace(/\s+/g, " ").trim();
  const e = normalize(expected).replace(/\s+/g, " ").trim();

  if (d === e) return true;

  if (d.includes(e) || e.includes(d)) return true;

  const dWords = new Set(d.split(" "));
  const eWords = e.split(" ");
  const overlap = eWords.filter((w) => dWords.has(w)).length;

  return overlap >= Math.max(1, Math.ceil(eWords.length * 0.6));
}

function buildStats(
  subset: EvalResult[],
): { count: number; mrr: number; successRate: number } {
  const count = subset.length;
  if (count === 0) return { count: 0, mrr: 0, successRate: 0 };
  const mrr = subset.reduce((s, r) => s + r.reciprocalRank, 0) / count;
  const success = subset.filter((r) => r.matched.length > 0).length / count;
  return { count, mrr: Math.round(mrr * 10000) / 10000, successRate: Math.round(success * 10000) / 10000 };
}

async function runEval() {
  await new Promise((r) => setTimeout(r, 500));

  logger.info("Loading evaluation cases...");
  const cases = await track4Repo.getAllEvaluations();
  logger.info(`Loaded ${cases.length} evaluation cases`);

  const results: EvalResult[] = [];

  for (const tc of cases) {
    const expected = tc.expectedTopSuggestions ?? [];
    if (expected.length === 0) continue;

    const response = autocompleteEngine.suggest(tc.inputPrefix, { limit: 10 });
    const queryClass = tc.expectedSuggestionType ?? "Unknown";

    const matched: string[] = [];
    const found = response.suggestions.map((s) => s.display);

    for (const exp of expected) {
      for (let i = 0; i < found.length; i++) {
        if (isMatch(found[i], exp)) {
          matched.push(exp);
          break;
        }
      }
    }

    let rankOfFirstMatch: number | null = null;
    for (let i = 0; i < found.length; i++) {
      if (expected.some((exp) => isMatch(found[i], exp))) {
        rankOfFirstMatch = i + 1;
        break;
      }
    }

    results.push({
      caseId: tc.originalId,
      inputPrefix: tc.inputPrefix,
      difficulty: tc.difficulty ?? "Unknown",
      expectedType: tc.expectedSuggestionType ?? "Unknown",
      suggestedType: queryClass,
      expected,
      found: found.slice(0, 10),
      matched,
      rankOfFirstMatch,
      reciprocalRank: rankOfFirstMatch ? 1 / rankOfFirstMatch : 0,
      source: response.source,
      latencyMs: Math.round(response.latencyMs * 100) / 100,
    });
  }

  const successCount = results.filter((r) => r.matched.length > 0).length;
  const totalCases = results.length;

  const mrr = results.reduce((sum, r) => sum + r.reciprocalRank, 0) / totalCases;

  function recallAtK(k: number): number {
    let totalRecall = 0;
    for (const r of results) {
      if (r.expected.length === 0) continue;
      const topDisplay = r.found.slice(0, k);
      let foundInTop = 0;
      for (const exp of r.expected) {
        if (topDisplay.some((d) => isMatch(d, exp))) foundInTop++;
      }
      totalRecall += foundInTop / r.expected.length;
    }
    return totalCases > 0 ? totalRecall / totalCases : 0;
  }

  const recall1 = recallAtK(1);
  const recall3 = recallAtK(3);
  const recall5 = recallAtK(5);
  const recall10 = recallAtK(10);

  let totalPrecision5 = 0;
  let totalPrecision10 = 0;
  let totalExpectedFound = 0;
  let totalExpected = 0;

  for (const r of results) {
    totalPrecision5 += r.matched.length / Math.min(5, r.expected.length || 1);
    totalPrecision10 += r.matched.length / Math.min(10, r.expected.length || 1);
    totalExpectedFound += r.matched.length;
    totalExpected += r.expected.length;
  }

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];

  const byDifficulty: Record<string, { count: number; mrr: number; successRate: number }> = {};
  for (const r of results) {
    if (!byDifficulty[r.difficulty]) byDifficulty[r.difficulty] = { count: 0, mrr: 0, successRate: 0 };
    byDifficulty[r.difficulty].count++;
  }
  for (const diff of Object.keys(byDifficulty)) {
    const subset = results.filter((r) => r.difficulty === diff);
    byDifficulty[diff].mrr = subset.reduce((s, r) => s + r.reciprocalRank, 0) / subset.length;
    byDifficulty[diff].successRate = subset.filter((r) => r.matched.length > 0).length / subset.length;
  }

  const byType: Record<string, TypeStats> = {};
  for (const r of results) {
    const type = r.expectedType;
    if (!byType[type]) byType[type] = { count: 0, mrr: 0, successRate: 0 };
    byType[type].count++;
  }
  for (const type of Object.keys(byType)) {
    const s = buildStats(results.filter((r) => r.expectedType === type));
    byType[type] = s;
  }

  const bySource: Record<string, SourceStats> = {};
  for (const r of results) {
    const src = r.source;
    if (!bySource[src]) bySource[src] = { count: 0, mrr: 0, avgLatencyMs: 0 };
    bySource[src].count++;
  }
  for (const src of Object.keys(bySource)) {
    const subset = results.filter((r) => r.source === src);
    const count = subset.length;
    bySource[src].mrr = subset.reduce((s, r) => s + r.reciprocalRank, 0) / count;
    bySource[src].avgLatencyMs = subset.reduce((s, r) => s + r.latencyMs, 0) / count;
  }

  const failures = results
    .filter((r) => r.matched.length === 0)
    .map((r) => ({ caseId: r.caseId, prefix: r.inputPrefix, expected: r.expected }));

  const report: EvalReport = {
    totalCases,
    metrics: {
      mrr: Math.round(mrr * 10000) / 10000,
      recallAt1: Math.round(recall1 * 10000) / 10000,
      recallAt3: Math.round(recall3 * 10000) / 10000,
      recallAt5: Math.round(recall5 * 10000) / 10000,
      recallAt10: Math.round(recall10 * 10000) / 10000,
      precisionAt5: Math.round(totalPrecision5 / totalCases * 10000) / 10000,
      precisionAt10: Math.round(totalPrecision10 / totalCases * 10000) / 10000,
      successRate: Math.round(successCount / totalCases * 10000) / 10000,
      coverage: totalExpected > 0 ? Math.round(totalExpectedFound / totalExpected * 10000) / 10000 : 0,
      avgLatencyMs: Math.round(latencies.reduce((s, l) => s + l, 0) / latencies.length * 100) / 100,
      p50LatencyMs: p50 ?? 0,
      p95LatencyMs: p95 ?? 0,
      p99LatencyMs: p99 ?? 0,
    },
    byDifficulty,
    byType,
    bySource,
    failures,
    details: results,
  };

  return report;
}

function printReport(report: EvalReport) {
  console.log("\n========================================");
  console.log("  TRACK 4 — EVALUATION REPORT");
  console.log("========================================");
  console.log(`\nTotal cases: ${report.totalCases}`);
  console.log(`\n--- Overall Metrics ---`);
  console.log(`MRR:              ${report.metrics.mrr}`);
  console.log(`R@1:              ${(report.metrics.recallAt1 * 100).toFixed(1)}%`);
  console.log(`R@3:              ${(report.metrics.recallAt3 * 100).toFixed(1)}%`);
  console.log(`R@5:              ${(report.metrics.recallAt5 * 100).toFixed(1)}%`);
  console.log(`R@10:             ${(report.metrics.recallAt10 * 100).toFixed(1)}%`);
  console.log(`Success Rate:     ${(report.metrics.successRate * 100).toFixed(1)}%`);
  console.log(`Precision@5:      ${report.metrics.precisionAt5}`);
  console.log(`Precision@10:     ${report.metrics.precisionAt10}`);
  console.log(`Coverage:         ${(report.metrics.coverage * 100).toFixed(1)}%`);

  console.log(`\n--- Latency ---`);
  console.log(`Avg:  ${report.metrics.avgLatencyMs.toFixed(2)}ms`);
  console.log(`P50:  ${report.metrics.p50LatencyMs.toFixed(2)}ms`);
  console.log(`P95:  ${report.metrics.p95LatencyMs.toFixed(2)}ms`);
  console.log(`P99:  ${report.metrics.p99LatencyMs.toFixed(2)}ms`);

  console.log(`\n--- By Difficulty ---`);
  for (const [diff, stats] of Object.entries(report.byDifficulty)) {
    console.log(`  ${diff}: ${stats.count} cases | MRR=${stats.mrr.toFixed(3)} | Success=${(stats.successRate * 100).toFixed(0)}%`);
  }

  console.log(`\n--- By Query Type ---`);
  for (const [type, stats] of Object.entries(report.byType)) {
    console.log(`  ${type}: ${stats.count} cases | MRR=${stats.mrr.toFixed(3)} | Success=${(stats.successRate * 100).toFixed(0)}%`);
  }

  console.log(`\n--- By Match Source ---`);
  for (const [src, stats] of Object.entries(report.bySource)) {
    console.log(
      `  ${src}: ${stats.count} cases | MRR=${stats.mrr.toFixed(3)} | AvgLatency=${stats.avgLatencyMs.toFixed(2)}ms`,
    );
  }

  if (report.failures.length > 0) {
    console.log(`\n--- Failures (${report.failures.length} cases with 0 matches) ---`);
    for (const f of report.failures) {
      console.log(`  ${f.caseId}: "${f.prefix}" → expected: [${f.expected.join("; ")}]`);
    }
  }

  console.log("\n========================================\n");
}

if (import.meta.main) {
  const engineReady = await new Promise<boolean>((resolve) => {
    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      if (autocompleteEngine.getStats().loaded) {
        clearInterval(check);
        resolve(true);
      } else if (attempts > 50) {
        clearInterval(check);
        resolve(false);
      }
    }, 100);
  });

  if (!engineReady) {
    logger.error("Engine failed to load, exiting");
    Deno.exit(1);
  }

  const report = await runEval();
  printReport(report);

  const outPath = "./src/modules/track-4-autocomplete/data/eval-report.json";
  await Deno.writeTextFile(outPath, JSON.stringify(report, null, 2));
  logger.info(`Report saved to ${outPath}`);
}
