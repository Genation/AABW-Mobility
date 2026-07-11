# Semantics-first search experience quality

This report uses a deterministic corpus-derived regression sample and an independent
accent-safe metadata/lexicon judge. Exact expected strings are a secondary
diagnostic; semantic relevance, intent/slot fidelity, Vietnamese robustness,
and runtime behavior are the acceptance criteria. Catalog and popular-query rows
remain visible to the live engine, so this is a regression gate rather than an
estimate of performance on unseen data.

## Scorecard

| Criterion | Primary evidence |
|---|---|
| Suggestion relevance | success@6 95.9%; graded utility 72.0%; unrelated 6.3% |
| Intent prediction | strict 96.4%; macro-F1 91.6%; slot fidelity 99.7% |
| Query completion | semantic AUC 95.9%; coverage 100.0%; median savings 75.0% |
| Vietnamese handling | accentless semantic retention 99.7%; typo retention 69.6% |
| Production readiness | P6/P7/autocomplete p95 15.74/27.38/24.14 ms; concurrent errors 0.0% |

## Exact-string diagnostic

Exact target MRR is 0.291. It is reported for compatibility and is not a gate floor.

## Frozen-baseline comparison

Regressions: 0.
