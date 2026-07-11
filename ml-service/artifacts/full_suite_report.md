# Tasco full three-pipeline evaluation

Generated: 2026-07-11T16:48:04.905556+00:00

The suite evaluates P6 understanding, P7 ranking in TF-IDF and E5 modes,
and P9 autocomplete. Public-set results are development measurements, not
private-holdout estimates.

## Public accuracy

| Pipeline | Configuration | Primary metrics |
|---|---|---|
| P6 | Deterministic | intent 95.0%; normalized exact 50.0%; token-F1 92.6%; entity-F1 77.4% |
| P7 | TF-IDF + BM25 | Recall@3 84.2%; Recall@5 91.1%; MRR 84.2% |
| P7 | E5 + BM25 | Recall@3 90.8%; Recall@5 95.0%; MRR 94.3% |
| P9 | Trie + semantic fusion | type 58.3%; exact recall 44.4%; exact MRR 44.7%; full 23/60 |

## Robustness

| Test | Metric | Result |
|---|---|---:|
| P6 accentless queries | intent / entity-F1 | 91.7% / 75.8% |
| P7 E5 accentless queries | Recall@3 / MRR | 90.6% / 91.7% |
| P9 without semantic fusion | type / exact / fuzzy recall | 35.0% / 36.1% / 46.1% |
| P9 remove final character | type / exact / fuzzy recall | 53.3% / 38.1% / 67.5% |
| P9 add one wrong character | type / exact / fuzzy recall | 23.3% / 23.1% / 65.0% |
| P9 add two wrong characters | type / exact / fuzzy recall | 13.3% / 9.2% / 49.2% |
| P9 reverse token order | type / exact / fuzzy recall | 20.0% / 12.8% / 46.1% |

## Steady-state latency

| Pipeline | Configuration | p50 | p95 |
|---|---|---:|---:|
| P6 | Deterministic | 9.733 ms | 17.340 ms |
| P7 | TF-IDF + BM25 | 18.068 ms | 24.157 ms |
| P7 | E5 + BM25 | 28.233 ms | 35.836 ms |
| P9 | Trie + semantic fusion | 17.973 ms | 38.144 ms |

## Integrity checks

- Regression tests: PASS.
- P9 executable expected-answer occurrences in runtime source: 0/96 across 0/60 cases.
- P9 public literal metrics remain a compatibility diagnostic; semantic
  completion is accepted by the corpus-derived `experience_quality` regression
  sample, graded by an independent metadata/lexicon judge.
- Frozen E5/TF-IDF experience and P6/P7 generalization baselines are the
  merge/model-selection regression gates.

Raw worker outputs: `full_suite_tfidf.json` and `full_suite_e5.json`.
