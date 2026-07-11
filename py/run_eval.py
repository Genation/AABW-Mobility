"""
RouteMate NER Evaluation Runner
===============================
Runs NER engine against Track 4 Public Evaluation dataset.
Computes: tool accuracy, entity recall, suggestion overlap, latency stats.
"""

from __future__ import annotations

import json
import statistics
from dataclasses import dataclass, field
from pathlib import Path

from ner_engine import NerEngine, NerResult
from eval_dataset import load_dataset, TestCase

RESULTS_PATH = Path(__file__).resolve().parent / "eval_results.json"


@dataclass
class EvalResult:
    case_id: str
    input_query: str
    expected_tool: str
    predicted_tool: str
    tool_match: bool
    expected_suggestions: list[str]
    predicted_suggestions: list[str]
    suggestion_overlap: float
    entity_hints: dict[str, list[str]]
    predicted_filters: dict[str, str]
    entity_recall: float
    cleaned_query: str
    confidence: float
    latency_ms: float
    difficulty: str

    def to_dict(self) -> dict:
        return {
            "case_id": self.case_id,
            "input_query": self.input_query,
            "expected_tool": self.expected_tool,
            "predicted_tool": self.predicted_tool,
            "tool_match": self.tool_match,
            "entity_recall": round(self.entity_recall, 3),
            "suggestion_overlap": round(self.suggestion_overlap, 3),
            "confidence": self.confidence,
            "latency_ms": round(self.latency_ms, 1),
            "difficulty": self.difficulty,
            "predicted_filters": self.predicted_filters,
        }


@dataclass
class SummaryStats:
    total: int = 0
    tool_accuracy: float = 0.0
    entity_recall: float = 0.0
    suggestion_overlap: float = 0.0
    avg_confidence: float = 0.0
    avg_latency_ms: float = 0.0
    p50_latency_ms: float = 0.0
    p95_latency_ms: float = 0.0
    p99_latency_ms: float = 0.0
    by_difficulty: dict[str, dict] = field(default_factory=dict)
    by_tool: dict[str, dict] = field(default_factory=dict)
    errors: list[dict] = field(default_factory=list)


def compute_entity_recall(
    hints: dict[str, list[str]],
    filters: dict[str, str],
) -> float:
    """Check how many expected entity fields were detected."""
    if not hints:
        return 1.0  # no hints = skip

    total_fields = 0
    recalled = 0

    for field, expected_values in hints.items():
        total_fields += 1
        predicted = filters.get(field, "").lower()
        for ev in expected_values:
            if ev.lower() in predicted or predicted in ev.lower():
                recalled += 1
                break

    return recalled / max(total_fields, 1)


def compute_suggestion_overlap(expected: list[str], predicted: list[str]) -> float:
    if not expected:
        return 1.0
    expected_lower = [e.lower().strip() for e in expected]
    predicted_lower = [p.lower().strip() for p in predicted]

    # Fuzzy substring match
    overlap = 0
    for e in expected_lower:
        for p in predicted_lower:
            if e in p or p in e:
                overlap += 1
                break
    return overlap / len(expected_lower)


def run_evaluation(model: str = "qwen2.5:1.5b-instruct", limit: int = 0) -> tuple[list[EvalResult], SummaryStats]:
    engine = NerEngine(model=model)
    cases = load_dataset()
    if limit:
        cases = cases[:limit]

    results: list[EvalResult] = []
    total = len(cases)

    print(f"Running NER evaluation on {total} cases...\n")

    for i, tc in enumerate(cases):
        ner = engine.parse(tc.input_prefix)

        tool_match = ner.tool == tc.expected_tool
        entity_recall = compute_entity_recall(tc.entity_hints, ner.hard_filters)
        sugg_overlap = compute_suggestion_overlap(tc.expected_suggestions, ner.suggestions)

        r = EvalResult(
            case_id=tc.case_id,
            input_query=tc.input_prefix,
            expected_tool=tc.expected_tool,
            predicted_tool=ner.tool,
            tool_match=tool_match,
            expected_suggestions=tc.expected_suggestions,
            predicted_suggestions=ner.suggestions,
            suggestion_overlap=sugg_overlap,
            entity_hints=tc.entity_hints,
            predicted_filters=ner.hard_filters,
            entity_recall=entity_recall,
            cleaned_query=ner.cleaned_query,
            confidence=ner.confidence,
            latency_ms=ner.raw_ms,
            difficulty=tc.difficulty,
        )
        results.append(r)

        status = "✓" if tool_match else "✗"
        print(f"  [{i+1:02d}/{total}] {status} {tc.case_id}: '{tc.input_prefix}' → {ner.tool} ({ner.raw_ms:.0f}ms)")

    stats = build_summary(results)
    return results, stats


def build_summary(results: list[EvalResult]) -> SummaryStats:
    total = len(results)
    if total == 0:
        return SummaryStats()

    tool_matches = sum(1 for r in results if r.tool_match)
    entity_recalls = [r.entity_recall for r in results if r.entity_hints]
    sugg_overlaps = [r.suggestion_overlap for r in results if r.expected_suggestions]
    confidences = [r.confidence for r in results]
    latencies = [r.latency_ms for r in results]

    s_lat = sorted(latencies)

    def pct(p: float) -> float:
        idx = int(len(s_lat) * p)
        return s_lat[min(idx, len(s_lat) - 1)]

    summary = SummaryStats(
        total=total,
        tool_accuracy=tool_matches / total if total else 0,
        entity_recall=statistics.mean(entity_recalls) if entity_recalls else 0,
        suggestion_overlap=statistics.mean(sugg_overlaps) if sugg_overlaps else 0,
        avg_confidence=statistics.mean(confidences) if confidences else 0,
        avg_latency_ms=statistics.mean(latencies) if latencies else 0,
        p50_latency_ms=pct(0.50),
        p95_latency_ms=pct(0.95),
        p99_latency_ms=pct(0.99),
    )

    # By difficulty
    for diff in ["Easy", "Medium", "Hard"]:
        grp = [r for r in results if r.difficulty == diff]
        if grp:
            summary.by_difficulty[diff] = {
                "count": len(grp),
                "tool_accuracy": sum(1 for r in grp if r.tool_match) / len(grp),
                "entity_recall": statistics.mean([r.entity_recall for r in grp if r.entity_hints]) if any(r.entity_hints for r in grp) else 0,
                "avg_latency_ms": statistics.mean([r.latency_ms for r in grp]),
            }

    # By tool
    for tool in sorted({r.expected_tool for r in results}):
        grp = [r for r in results if r.expected_tool == tool]
        summary.by_tool[tool] = {
            "count": len(grp),
            "tool_accuracy": sum(1 for r in grp if r.tool_match) / len(grp),
            "avg_latency_ms": statistics.mean([r.latency_ms for r in grp]),
        }

    # Errors
    for r in results:
        if not r.tool_match:
            summary.errors.append({
                "case_id": r.case_id,
                "input": r.input_query,
                "expected": r.expected_tool,
                "predicted": r.predicted_tool,
                "difficulty": r.difficulty,
            })

    return summary


def print_summary(stats: SummaryStats) -> None:
    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY")
    print("=" * 60)
    print(f"Total cases:       {stats.total}")
    print(f"Tool Accuracy:     {stats.tool_accuracy:.1%}")
    print(f"Entity Recall:     {stats.entity_recall:.1%}")
    print(f"Suggestion Overlap:{stats.suggestion_overlap:.1%}")
    print(f"Avg Confidence:    {stats.avg_confidence:.2f}")
    print(f"Avg Latency:       {stats.avg_latency_ms:.1f}ms")
    print(f"P50 Latency:       {stats.p50_latency_ms:.1f}ms")
    print(f"P95 Latency:       {stats.p95_latency_ms:.1f}ms")
    print(f"P99 Latency:       {stats.p99_latency_ms:.1f}ms")

    print("\n── By Difficulty ──")
    for diff, d in stats.by_difficulty.items():
        print(f"  {diff:8s}: {d['count']:2d} cases | tool_acc={d['tool_accuracy']:.1%} | recall={d['entity_recall']:.1%} | lat={d['avg_latency_ms']:.0f}ms")

    print("\n── By Tool ──")
    for tool, d in stats.by_tool.items():
        print(f"  {tool:22s}: {d['count']:2d} cases | acc={d['tool_accuracy']:.1%} | lat={d['avg_latency_ms']:.0f}ms")

    if stats.errors:
        print(f"\n── Tool Misclassifications ({len(stats.errors)}) ──")
        for e in stats.errors:
            print(f"  {e['case_id']}: '{e['input']}' | expected={e['expected']} | got={e['predicted']} [{e['difficulty']}]")

    print()


if __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser(description="Run NER evaluation on Track 4 dataset")
    p.add_argument("--model", default="qwen2.5:1.5b-instruct", help="Ollama model name")
    p.add_argument("--limit", type=int, default=0, help="Limit test cases (0=all)")
    p.add_argument("--save", action="store_true", help="Save results to JSON")
    args = p.parse_args()

    results, stats = run_evaluation(model=args.model, limit=args.limit)
    print_summary(stats)

    if args.save:
        payload = {
            "summary": {
                "total": stats.total,
                "tool_accuracy": stats.tool_accuracy,
                "entity_recall": stats.entity_recall,
                "suggestion_overlap": stats.suggestion_overlap,
                "avg_latency_ms": stats.avg_latency_ms,
                "p50_latency_ms": stats.p50_latency_ms,
                "p95_latency_ms": stats.p95_latency_ms,
                "p99_latency_ms": stats.p99_latency_ms,
                "by_difficulty": stats.by_difficulty,
                "by_tool": stats.by_tool,
                "errors": stats.errors,
            },
            "details": [r.to_dict() for r in results],
        }
        RESULTS_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Results saved to: {RESULTS_PATH}")
