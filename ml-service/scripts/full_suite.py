"""Reproducible full evaluation for P6, P7, and P9.

Run both retrieval configurations and write a consolidated report:

    python -m scripts.full_suite --all

Run one worker configuration only:

    TASCO_DISABLE_EMBED=1 python -m scripts.full_suite --mode tfidf
    TASCO_DISABLE_EMBED=0 python -m scripts.full_suite --mode e5

The suite covers public accuracy, difficulty splits, accentless robustness,
steady-state latency, P9 smart-pattern ablation, prefix perturbations, and a
literal-answer source audit. Public gold results remain development-set
measurements, not private-holdout estimates.
"""
from __future__ import annotations

import argparse
import ast
import json
import math
import os
import statistics
import subprocess
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Iterable

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = ROOT / "artifacts"


def _ids(value) -> list[str]:
    return [part.strip() for part in str(value).split(";") if part.strip()]


def _percentile(values: list[float], percentile: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1,
                round((percentile / 100.0) * (len(ordered) - 1)))
    return ordered[index]


def _latency_summary(values: Iterable[float]) -> dict:
    samples = list(values)
    return {
        "n": len(samples),
        "p50_ms": round(statistics.median(samples), 4),
        "mean_ms": round(statistics.mean(samples), 4),
        "p95_ms": round(_percentile(samples, 95), 4),
        "max_ms": round(max(samples), 4),
    }


def _benchmark(inputs: list[str], fn: Callable[[str], object], repeat: int) -> dict:
    for value in inputs:
        fn(value)
    samples = []
    for _ in range(repeat):
        for value in inputs:
            started = time.perf_counter()
            fn(value)
            samples.append((time.perf_counter() - started) * 1000.0)
    return _latency_summary(samples)


def _evaluate_p6(rows, understander, transform=lambda value: value) -> dict:
    from eval.evaluate import _entity_f1, _tok_f1
    from tascomaps.core.text import fold

    intent = normalized = 0.0
    token_f1 = entity_f1 = 0.0
    for row in rows:
        result = understander(transform(row["input_query"]))
        intent += result.intent == row["expected_intent"]
        normalized += fold(result.normalized_query) == fold(row["expected_normalized_query"])
        token_f1 += _tok_f1(result.normalized_query, row["expected_normalized_query"])
        try:
            gold_entities = json.loads(row["expected_entities_json"])
        except Exception:
            gold_entities = {}
        entity_f1 += _entity_f1(result.entities, gold_entities)
    n = len(rows) or 1
    return {
        "n": len(rows),
        "intent_acc": intent / n,
        "normalized_exact": normalized / n,
        "normalized_tokenF1": token_f1 / n,
        "entity_F1": entity_f1 / n,
    }


def _evaluate_p7(rows, engine, transform=lambda value: value) -> dict:
    recall3 = recall5 = mrr = ndcg3 = hit1 = 0.0
    for row in rows:
        gold = set(_ids(row["expected_top_poi_ids"]))
        predicted = [result["poi_id"] for result in
                     engine.search(transform(row["input_query"]), top_k=5)["results"]]
        if not gold:
            continue
        recall3 += len(gold & set(predicted[:3])) / len(gold)
        recall5 += len(gold & set(predicted[:5])) / len(gold)
        mrr += next((1 / (index + 1) for index, poi_id in enumerate(predicted)
                     if poi_id in gold), 0.0)
        dcg = sum(1 / math.log2(index + 2)
                  for index, poi_id in enumerate(predicted[:3]) if poi_id in gold)
        ideal = sum(1 / math.log2(index + 2)
                    for index in range(min(3, len(gold)))) or 1.0
        ndcg3 += dcg / ideal
        hit1 += bool(predicted and predicted[0] in gold)
    n = len(rows) or 1
    return {
        "n": len(rows),
        "recall@3": recall3 / n,
        "recall@5": recall5 / n,
        "MRR": mrr / n,
        "nDCG@3": ndcg3 / n,
        "hit@1": hit1 / n,
    }


def _evaluate_p9(rows, suggester, transform=lambda value: value) -> dict:
    from rapidfuzz import fuzz
    from tascomaps.core.text import fold

    type_acc = exact = fuzzy_recall = exact_full = fuzzy_full = mrr = 0.0
    for row in rows:
        result = suggester(transform(row["input_prefix"]))
        predicted = [suggestion["text"] for suggestion in result["suggestions"]]
        expected = _ids(row["expected_top_suggestions"])
        type_acc += result.get("suggestion_type") == row["expected_suggestion_type"]
        exact_hits = sum(any(fold(prediction) == fold(target)
                             for prediction in predicted) for target in expected)
        fuzzy_hits = sum(any(
            fold(prediction) == fold(target)
            or fuzz.token_set_ratio(fold(target), fold(prediction)) >= 85
            for prediction in predicted) for target in expected)
        exact_ratio = exact_hits / len(expected) if expected else 0.0
        fuzzy_ratio = fuzzy_hits / len(expected) if expected else 0.0
        exact += exact_ratio
        fuzzy_recall += fuzzy_ratio
        exact_full += exact_ratio >= 0.999
        fuzzy_full += fuzzy_ratio >= 0.999
        first = next((index for index, prediction in enumerate(predicted)
                      if any(fold(prediction) == fold(target) for target in expected)), None)
        mrr += 1 / (first + 1) if first is not None else 0.0
    n = len(rows) or 1
    return {
        "n": len(rows),
        "type_acc": type_acc / n,
        "exact_recall": exact / n,
        "exact_MRR": mrr / n,
        "exact_full_cases": int(exact_full),
        "fuzzy_recall": fuzzy_recall / n,
        "fuzzy_full_cases": int(fuzzy_full),
    }


def _difficulty(rows, evaluator: Callable[[list], dict]) -> dict:
    groups = defaultdict(list)
    for row in rows:
        groups[str(row.get("difficulty") or "Unknown")].append(row)
    return {difficulty: evaluator(group)
            for difficulty, group in sorted(groups.items())}


def _source_audit(rows) -> dict:
    from tascomaps.core.text import fold

    source = (ROOT / "tascomaps/engines/trie.py").read_text()
    tree = ast.parse(source)
    literals = {
        fold(node.value) for node in ast.walk(tree)
        if isinstance(node, ast.Constant) and isinstance(node.value, str)
    }
    occurrences = [phrase for row in rows
                   for phrase in _ids(row["expected_top_suggestions"])]
    literal_occurrences = [phrase for phrase in occurrences
                           if fold(phrase) in literals]
    affected_cases = sum(any(fold(phrase) in literals
                             for phrase in _ids(row["expected_top_suggestions"]))
                         for row in rows)
    return {
        "expected_occurrences": len(occurrences),
        "literal_occurrences": len(literal_occurrences),
        "unique_expected": len(set(occurrences)),
        "unique_literal": len(set(literal_occurrences)),
        "affected_cases": affected_cases,
        "literal_phrases": sorted(set(literal_occurrences)),
    }


def _run_worker(mode: str, repeat: int, p9_repeat: int, output: Path) -> dict:
    # Imports happen here so --all can launch independent processes with
    # different embedder environment variables.
    from tascomaps.core.text import strip_accents
    from tascomaps.core.understand import understand
    from tascomaps.data.loader import load_eval, load_kb
    from tascomaps.engines.semantic_search import SemanticSearchEngine
    from tascomaps.engines.trie import TrieAutocomplete

    started = time.perf_counter()
    kb_started = time.perf_counter()
    kb = load_kb()
    kb_ms = (time.perf_counter() - kb_started) * 1000.0

    search_started = time.perf_counter()
    search = SemanticSearchEngine(kb)
    search_init_ms = (time.perf_counter() - search_started) * 1000.0
    actual_embedder = search.index.embedder.kind
    expected_embedder = "tfidf" if mode == "tfidf" else "sentence-transformer"
    if actual_embedder != expected_embedder:
        raise RuntimeError(
            f"requested {mode}, but initialized {actual_embedder}; "
            "check the E5 model cache and dependencies")

    autocomplete_started = time.perf_counter()
    autocomplete = TrieAutocomplete(kb)
    autocomplete_init_ms = (time.perf_counter() - autocomplete_started) * 1000.0

    p6_rows = load_eval("T1")
    p7_rows = load_eval("T2")
    p9_rows = load_eval("T4")
    understander = lambda query: understand(query, kb)
    suggester = lambda prefix: autocomplete.suggest(prefix, top_k=6)

    p6_public = _evaluate_p6(p6_rows, understander)
    p7_public = _evaluate_p7(p7_rows, search)
    p9_public = _evaluate_p9(p9_rows, suggester)

    ablated = TrieAutocomplete(kb)
    ablated._smart_patterns = lambda prefix, key, top_k, t0: None

    p9_mutations = {
        "remove_final_character": lambda value: value[:-1],
        "add_one_wrong_character": lambda value: value + "x",
        "add_two_wrong_characters": lambda value: value + "xy",
        "reverse_token_order": lambda value: " ".join(reversed(value.split())),
    }

    result = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "mode": mode,
        "actual_embedder": actual_embedder,
        "config": {"repeat": repeat, "p9_repeat": p9_repeat},
        "startup": {
            "kb_ms": round(kb_ms, 3),
            "p7_engine_ms": round(search_init_ms, 3),
            "p9_engine_ms": round(autocomplete_init_ms, 3),
        },
        "public": {"p6": p6_public, "p7": p7_public, "p9": p9_public},
        "difficulty": {
            "p6": _difficulty(p6_rows, lambda rows: _evaluate_p6(rows, understander)),
            "p7": _difficulty(p7_rows, lambda rows: _evaluate_p7(rows, search)),
        },
        "robustness": {
            "p6_accentless": _evaluate_p6(p6_rows, understander, strip_accents),
            "p7_accentless": _evaluate_p7(p7_rows, search, strip_accents),
            "p9_without_smart_patterns": _evaluate_p9(
                p9_rows, lambda prefix: ablated.suggest(prefix, top_k=6)),
            "p9_mutations": {
                name: _evaluate_p9(p9_rows, suggester, mutation)
                for name, mutation in p9_mutations.items()
            },
            "p9_source_audit": _source_audit(p9_rows),
        },
        "latency": {
            "p6": _benchmark([row["input_query"] for row in p6_rows],
                             understander, repeat),
            "p7": _benchmark([row["input_query"] for row in p7_rows],
                             lambda query: search.search(query, top_k=5), repeat),
            "p9": _benchmark([row["input_prefix"] for row in p9_rows],
                             suggester, p9_repeat),
        },
        "elapsed_seconds": round(time.perf_counter() - started, 3),
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def _pct(value) -> str:
    return f"{100 * value:.1f}%"


def _render_report(tfidf: dict, e5: dict, regression_tests_ok: bool) -> str:
    p6 = e5["public"]["p6"]
    p9 = e5["public"]["p9"]
    audit = e5["robustness"]["p9_source_audit"]
    lines = [
        "# Tasco full three-pipeline evaluation",
        "",
        f"Generated: {e5['generated_at']}",
        "",
        "The suite evaluates P6 understanding, P7 ranking in TF-IDF and E5 modes,",
        "and P9 autocomplete. Public-set results are development measurements, not",
        "private-holdout estimates.",
        "",
        "## Public accuracy",
        "",
        "| Pipeline | Configuration | Primary metrics |",
        "|---|---|---|",
        (f"| P6 | Deterministic | intent {_pct(p6['intent_acc'])}; normalized exact "
         f"{_pct(p6['normalized_exact'])}; token-F1 {_pct(p6['normalized_tokenF1'])}; "
         f"entity-F1 {_pct(p6['entity_F1'])} |"),
        (f"| P7 | TF-IDF + BM25 | Recall@3 {_pct(tfidf['public']['p7']['recall@3'])}; "
         f"Recall@5 {_pct(tfidf['public']['p7']['recall@5'])}; "
         f"MRR {_pct(tfidf['public']['p7']['MRR'])} |"),
        (f"| P7 | E5 + BM25 | Recall@3 {_pct(e5['public']['p7']['recall@3'])}; "
         f"Recall@5 {_pct(e5['public']['p7']['recall@5'])}; "
         f"MRR {_pct(e5['public']['p7']['MRR'])} |"),
        (f"| P9 | Trie + semantic fusion | type {_pct(p9['type_acc'])}; exact recall "
         f"{_pct(p9['exact_recall'])}; exact MRR {_pct(p9['exact_MRR'])}; "
         f"full {p9['exact_full_cases']}/60 |"),
        "",
        "## Robustness",
        "",
        "| Test | Metric | Result |",
        "|---|---|---:|",
        (f"| P6 accentless queries | intent / entity-F1 | "
         f"{_pct(e5['robustness']['p6_accentless']['intent_acc'])} / "
         f"{_pct(e5['robustness']['p6_accentless']['entity_F1'])} |"),
        (f"| P7 E5 accentless queries | Recall@3 / MRR | "
         f"{_pct(e5['robustness']['p7_accentless']['recall@3'])} / "
         f"{_pct(e5['robustness']['p7_accentless']['MRR'])} |"),
        (f"| P9 without semantic fusion | type / exact / fuzzy recall | "
         f"{_pct(e5['robustness']['p9_without_smart_patterns']['type_acc'])} / "
         f"{_pct(e5['robustness']['p9_without_smart_patterns']['exact_recall'])} / "
         f"{_pct(e5['robustness']['p9_without_smart_patterns']['fuzzy_recall'])} |"),
    ]
    for name, metrics in e5["robustness"]["p9_mutations"].items():
        lines.append(
            f"| P9 {name.replace('_', ' ')} | type / exact / fuzzy recall | "
            f"{_pct(metrics['type_acc'])} / {_pct(metrics['exact_recall'])} / "
            f"{_pct(metrics['fuzzy_recall'])} |")

    lines.extend([
        "",
        "## Steady-state latency",
        "",
        "| Pipeline | Configuration | p50 | p95 |",
        "|---|---|---:|---:|",
        (f"| P6 | Deterministic | {e5['latency']['p6']['p50_ms']:.3f} ms | "
         f"{e5['latency']['p6']['p95_ms']:.3f} ms |"),
        (f"| P7 | TF-IDF + BM25 | {tfidf['latency']['p7']['p50_ms']:.3f} ms | "
         f"{tfidf['latency']['p7']['p95_ms']:.3f} ms |"),
        (f"| P7 | E5 + BM25 | {e5['latency']['p7']['p50_ms']:.3f} ms | "
         f"{e5['latency']['p7']['p95_ms']:.3f} ms |"),
        (f"| P9 | Trie + semantic fusion | {e5['latency']['p9']['p50_ms']:.3f} ms | "
         f"{e5['latency']['p9']['p95_ms']:.3f} ms |"),
        "",
        "## Integrity checks",
        "",
        f"- Regression tests: {'PASS' if regression_tests_ok else 'FAIL'}.",
        (f"- P9 executable expected-answer occurrences in runtime source: "
         f"{audit['literal_occurrences']}/{audit['expected_occurrences']} across "
         f"{audit['affected_cases']}/60 cases."),
        "- P9 public literal metrics remain a compatibility diagnostic; semantic",
        "  completion is accepted by the corpus-derived `experience_quality` regression",
        "  sample, graded by an independent metadata/lexicon judge.",
        "- Frozen E5/TF-IDF experience and P6/P7 generalization baselines are the",
        "  merge/model-selection regression gates.",
        "",
        "Raw worker outputs: `full_suite_tfidf.json` and `full_suite_e5.json`.",
    ])
    return "\n".join(lines) + "\n"


def _run_all(args) -> None:
    ARTIFACTS.mkdir(exist_ok=True)
    test_env = os.environ.copy()
    test_env["TASCO_DISABLE_EMBED"] = "1"
    tests = subprocess.run(
        [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-v"],
        cwd=ROOT, env=test_env, text=True)
    if tests.returncode != 0:
        raise SystemExit("regression tests failed")

    outputs = {}
    for mode in ("tfidf", "e5"):
        output = ARTIFACTS / f"full_suite_{mode}.json"
        env = os.environ.copy()
        env["TASCO_DISABLE_EMBED"] = "1" if mode == "tfidf" else "0"
        if mode == "e5" and not args.allow_download:
            env["HF_HUB_OFFLINE"] = "1"
            env["TRANSFORMERS_OFFLINE"] = "1"
        command = [
            sys.executable, "-m", "scripts.full_suite", "--mode", mode,
            "--repeat", str(args.repeat), "--p9-repeat", str(args.p9_repeat),
            "--output", str(output),
        ]
        subprocess.run(command, cwd=ROOT, env=env, check=True)
        outputs[mode] = json.loads(output.read_text())

    report = _render_report(outputs["tfidf"], outputs["e5"], True)
    report_path = ARTIFACTS / "full_suite_report.md"
    report_path.write_text(report)
    print(report)
    print(f"Wrote {report_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true",
                        help="run tests plus TF-IDF and E5 workers")
    parser.add_argument("--mode", choices=("tfidf", "e5"))
    parser.add_argument("--repeat", type=int, default=10,
                        help="steady-state repeats per P6/P7 public query")
    parser.add_argument("--p9-repeat", type=int, default=25,
                        help="steady-state repeats per P9 public prefix")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--allow-download", action="store_true",
                        help="allow E5 model download instead of requiring cache")
    args = parser.parse_args()

    if args.all or not args.mode:
        _run_all(args)
        return
    output = args.output or ARTIFACTS / f"full_suite_{args.mode}.json"
    result = _run_worker(args.mode, args.repeat, args.p9_repeat, output)
    print(json.dumps({
        "mode": result["mode"],
        "embedder": result["actual_embedder"],
        "public": result["public"],
        "elapsed_seconds": result["elapsed_seconds"],
        "output": str(output),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
