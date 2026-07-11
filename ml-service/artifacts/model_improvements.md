# P9 generalization refactor: before and after

Measured on 2026-07-11. The primary comparison uses the corpus-derived semantic
experience suite. Public expected strings are reported only as a compatibility
diagnostic and are not a model-selection gate.

## Generalization quality

| Metric | Before hybrid | Current hybrid | Change |
|---|---:|---:|---:|
| Graded utility@6 | 0.701074 | 0.719651 | +0.018577 |
| Semantic success@1 | 0.829932 | 0.857143 | +0.027211 |
| Semantic success@3 | 0.911565 | 0.925170 | +0.013605 |
| Semantic success@6 | 0.945578 | 0.959184 | +0.013606 |
| Unrelated suggestion rate | 0.070769 | 0.063158 | -0.007611 |
| Grounded suggestion rate | 0.996923 | 0.996992 | +0.000069 |
| Top-1 slot retention | 0.848930 | 0.856426 | +0.007496 |
| List coverage | 0.993197 | 1.000000 | +0.006803 |
| Semantic completion AUC | 0.945578 | 0.959184 | +0.013606 |
| Exact-target MRR diagnostic | 0.281066 | 0.291497 | +0.010431 |

## Public compatibility diagnostic

| Metric | Before hybrid | Current hybrid |
|---|---:|---:|
| Suggestion-type accuracy | 0.650 | 0.583 |
| Strict exact recall | 0.514 | 0.444 |
| Strict exact MRR | 0.483 | 0.447 |
| Full exact-recall cases | 29/60 | 23/60 |
| Permissive fuzzy recall | 0.792 | 0.761 |
| Executable expected-answer occurrences | 21/96 | 0/96 |

The public-string metrics fell because query-specific answer tables and direct
expected-answer branches were removed. That trade is intentional: the independent
corpus-derived measures improved, while the runtime source audit now finds no
public expected-answer literals.

## Implemented changes

- Index the observed typed prefix as well as the displayed completion.
- Collect exact trie and semantic KB candidates before ranking instead of returning
  from the first matching branch.
- Compose completions from parsed category, attribute, location, brand, and
  reference slots backed by live corpus values.
- Fuse candidates with confidence-gated source weights, deduplication, provenance,
  and bounded monotonic scores.
- Use fuzzy matching only as recovery and popular suggestions only for unknown
  one- or two-character prefixes.
- Support adjacent transpositions in addition to insertion, deletion, and
  substitution recovery.
- Resolve progressive first words from the live corpus when phrase continuation
  or a grounded tail constraint disambiguates them; reject collisions and nonce
  suffixes rather than adding more abbreviation literals.
- Preserve NFC/NFD equivalence and Vietnamese accent disambiguation.

## Verification

- 95 unit and regression tests pass.
- E5 and TF-IDF frozen experience gates pass with zero regressions.
- Full P6/P7/P9 evaluation passes.
- Autocomplete p95 is approximately 24 ms in the production-oriented experience
  run, with deterministic, unique, bounded results and zero request errors.
- Runtime AST audit: 0/96 public expected-answer occurrences across 0/60 cases.

## Next improvement plan

1. Add a real P9 holdout built from unseen prefix sessions, paraphrases, slot
   combinations, and Vietnamese noise instead of relying on public literals.
2. Log impressions, selections, abandonment, and first-relevant keystroke; train a
   small pairwise ranker only after enough unbiased interaction data exists.
3. Add length-aware Vietnamese typo costs, keyboard-neighbor errors, and Telex/VNI
   normalization behind regression gates.
4. Separate query intent from suggestion item type and evaluate both with macro-F1.
5. Consider a prewarmed semantic-vector candidate source only if it improves the
   holdout without harming OOD abstention or interactive latency.
