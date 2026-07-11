"""Benchmark P6 understanding and P7 semantic search latency.

Usage:
    HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 python -m scripts.benchmark_p6_p7

The benchmark separates startup costs from per-query latency:
    - KB load time
    - P7 engine/index initialization time
    - P6 understand() latency
    - P7 search() latency

It writes artifacts/benchmark_p6_p7.json and prints a compact summary.
"""
from __future__ import annotations

import argparse
import json
import statistics as stats
import time
from pathlib import Path
from typing import Callable, Iterable

from tascomaps.core.understand import understand
from tascomaps.data.loader import load_kb
from tascomaps.engines.semantic_search import SemanticSearchEngine

P6_QUERIES = [
    "bv bach mai",
    "12 nguyen hue q1",
    "ks da nang gan bien",
    "chi duong san bay noi bai",
    "galaxy",
    "coffee near ben thanh market",
    "atm vcb q1",
    "benh vien bach maj",
    "10.7769,106.7009",
    "vincom dong khoi",
]

P7_QUERIES = [
    "quán cà phê yên tĩnh để làm việc",
    "cafe có wifi gần hồ gươm",
    "khách sạn gần biển đà nẵng có hồ bơi",
    "nhà hàng cho gia đình có trẻ nhỏ",
    "quán ăn mở cửa sau 11 giờ tối",
    "atm rút tiền 24/7 gần phố đi bộ nguyễn huệ",
    "trạm sạc xe điện gần trung tâm đà nẵng",
    "quán cafe học bài ở hoàn kiếm",
    "địa điểm check-in đẹp ở đà lạt",
    "nơi phù hợp để hẹn hò ở quận 1",
]


def _ms(fn: Callable):
    t0 = time.perf_counter()
    out = fn()
    return (time.perf_counter() - t0) * 1000.0, out


def _percentile(values: list[float], p: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    idx = min(len(ordered) - 1, round((p / 100.0) * (len(ordered) - 1)))
    return ordered[idx]


def _summary(values: Iterable[float]) -> dict:
    vals = list(values)
    return {
        "n": len(vals),
        "min_ms": round(min(vals), 3),
        "p50_ms": round(stats.median(vals), 3),
        "mean_ms": round(stats.mean(vals), 3),
        "p95_ms": round(_percentile(vals, 95), 3),
        "max_ms": round(max(vals), 3),
    }


def _bench_queries(name: str, queries: list[str], repeat: int,
                   fn: Callable[[str], object]) -> dict:
    # Warm each query once so p50/mean describe steady-state service behavior.
    warm = []
    for q in queries:
        dt, _ = _ms(lambda q=q: fn(q))
        warm.append({"query": q, "latency_ms": round(dt, 3)})

    samples = []
    per_query: dict[str, list[float]] = {q: [] for q in queries}
    for _ in range(repeat):
        for q in queries:
            dt, _ = _ms(lambda q=q: fn(q))
            samples.append(dt)
            per_query[q].append(dt)

    return {
        "name": name,
        "queries": len(queries),
        "repeat": repeat,
        "warmup_first_pass": warm,
        "overall": _summary(samples),
        "by_query": {
            q: _summary(vals)
            for q, vals in per_query.items()
        },
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repeat", type=int, default=30,
                    help="steady-state repeats per query")
    ap.add_argument("--top-k", type=int, default=5,
                    help="P7 search result count")
    args = ap.parse_args()

    t_total = time.perf_counter()

    kb_ms, kb = _ms(load_kb)
    p6 = _bench_queries("P6 understand", P6_QUERIES, args.repeat,
                        lambda q: understand(q, kb))

    ss_init_ms, ss = _ms(lambda: SemanticSearchEngine(kb))
    embedder = ss.index.embedder.kind
    p7 = _bench_queries("P7 search", P7_QUERIES, args.repeat,
                        lambda q: ss.search(q, top_k=args.top_k))

    result = {
        "config": {
            "repeat": args.repeat,
            "top_k": args.top_k,
            "p7_embedder": embedder,
            "p6_query_count": len(P6_QUERIES),
            "p7_query_count": len(P7_QUERIES),
        },
        "startup": {
            "kb_load_ms": round(kb_ms, 3),
            "p7_engine_init_ms": round(ss_init_ms, 3),
            "total_script_ms": round((time.perf_counter() - t_total) * 1000.0, 3),
        },
        "benchmarks": {
            "p6": p6,
            "p7": p7,
        },
    }

    art = Path(__file__).resolve().parent.parent / "artifacts"
    art.mkdir(exist_ok=True)
    out_path = art / "benchmark_p6_p7.json"
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2))

    print("Tasco Maps AI benchmark")
    print(f"  embedder: {embedder}")
    print(f"  KB load: {result['startup']['kb_load_ms']} ms")
    print(f"  P7 init/index: {result['startup']['p7_engine_init_ms']} ms")
    print("  P6 understand:", result["benchmarks"]["p6"]["overall"])
    print("  P7 search:", result["benchmarks"]["p7"]["overall"])
    print(f"  wrote: {out_path}")


if __name__ == "__main__":
    main()

