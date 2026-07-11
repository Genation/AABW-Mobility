# P7 model trade-off benchmark

Run on 2026-07-10 in the isolated `codex/model-tradeoff-eval` worktree on
Apple Silicon, Python 3.12. The public Track 2 evaluation set contains 60
queries. Latencies are steady-state measurements over 300 searches after one
warm-up pass per query.

| Metric | TF-IDF + BM25 | multilingual-e5-small + BM25 |
|---|---:|---:|
| Recall@3 | 0.836 | 0.892 |
| Recall@5 | 0.897 | 0.944 |
| MRR | 0.855 | 0.951 |
| nDCG@3 | 0.816 | 0.900 |
| Hit@1 | 0.800 | 0.933 |
| Search p50 | 1.794 ms | 9.053 ms |
| Search p95 | 3.719 ms | 12.707 ms |
| Index/model startup | 0.652 s | 11.933 s |
| Peak process RSS | ~154 MiB | ~922 MiB |
| External model cache | none | ~470 MiB |

## Difficulty split

| Difficulty | TF-IDF Recall@3 | E5 Recall@3 | TF-IDF Hit@1 | E5 Hit@1 |
|---|---:|---:|---:|---:|
| Easy (5) | 1.000 | 1.000 | 0.800 | 1.000 |
| Medium (30) | 0.889 | 0.883 | 0.833 | 0.900 |
| Hard (25) | 0.740 | 0.880 | 0.760 | 0.960 |

## Interpretation

E5 improves overall Recall@3 by 5.6 percentage points and Hit@1 by 13.3
points. Most of the improvement is on hard semantic queries. It costs roughly
5x median steady-state latency, 18x benchmarked startup time, 6x peak process
memory, and a 470 MiB model cache. Both modes remain below 15 ms p95 for the
current 111-POI evaluation corpus; scaling behavior was not measured here.

P6 and P9 do not use the semantic embedder, so their accuracy is identical in
both configurations.

## Reproduction

```bash
cd ml-service

TASCO_DISABLE_EMBED=1 .venv/bin/python -m eval.evaluate
TASCO_DISABLE_EMBED=1 .venv/bin/python -m scripts.benchmark_p6_p7 --repeat 30

TASCO_DISABLE_EMBED=0 .venv/bin/python -m eval.evaluate
TASCO_DISABLE_EMBED=0 .venv/bin/python -m scripts.benchmark_p6_p7 --repeat 30
```

The public evaluation set was used during development, so these measurements
compare implementations on that set; they are not a private holdout estimate.
