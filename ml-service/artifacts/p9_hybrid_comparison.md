# P9 architecture comparison and selected hybrid

This comparison evaluates the previous Python P9, Phong's TypeScript trie
implementation, and the implemented hybrid. Public string scores are useful for
compatibility debugging, but the corpus-derived semantic suite is the primary
generalization signal.

## Architecture comparison

| Area | Previous Python P9 | Phong's trie | Selected hybrid |
|---|---|---|---|
| Corpus grounding | Live POIs, registries, aliases, coordinates, city centroids | Large generated snapshot plus direct mappings | Live corpus and registries only |
| Prefix indexing | Display prefixes and suffix keys | Typed input prefixes and display text | Both typed input prefixes and display text |
| Candidate flow | Early return from the first strong branch | Generate multiple strategies, then rank | Collect exact, semantic, and progressive first-token sources, then confidence-gated fusion |
| Vietnamese handling | Unicode folding, accents, semantic slots | Normalized trie and fuzzy/embedding fallbacks | Unicode and accent safeguards plus slot composition and transposition recovery |
| Query-specific rules | Several public-shaped answer tables | Explicit remaining-gap prefix mappings | No executable public-answer literals |
| Semantic fallback | Corpus registry and slot filtering | Lazy embeddings over a generated snapshot | Corpus-backed slot completion; embeddings stay off the hot path |
| Geography | Corpus coordinates and learned city centroids | Fixed boxes and fabricated coordinate completions | Corpus coordinates and centroids |

## Strict public diagnostic

| Implementation | Exact recall | Fuzzy recall | Exact MRR | Full exact cases |
|---|---:|---:|---:|---:|
| Previous Python P9 | 0.514 | 0.792 | 0.483 | 29/60 |
| Phong stored top-6, strictly rescored | 0.506 | 0.772 | 0.562 | 22/60 |
| Selected hybrid | 0.444 | 0.761 | 0.447 | 23/60 |

The hybrid deliberately gives up public literal compatibility to remove benchmark-
shaped rules. Its executable-source intersection with the public expected answers
is 0/96, versus 21/96 in the previous Python runtime.

## Generalization and production evidence

| Implementation | Utility@6 | Success@1 | Success@6 | Coverage | Runtime note |
|---|---:|---:|---:|---:|---|
| Previous Python P9 | 0.701 | 0.830 | 0.946 | 0.993 | Local p95 about 19 ms |
| Phong snapshot-only regression | — | — | 0.422 | 0.490 | 20 MB snapshot; lazy embedding cold-path p95 about 51 s in the audit run |
| Selected hybrid | 0.720 | 0.857 | 0.959 | 1.000 | Experience p95 about 24 ms |

The Phong snapshot regression is indicative rather than directly comparable: it
uses a different generated corpus. The strict public rescoring uses the same
matching rules for all three implementations.

## Best combination

Adopted from the previous Python implementation:

- live corpus registries and semantic slots;
- Vietnamese accent safety and Unicode normalization;
- honest OOD abstention;
- corpus coordinates and city-centroid regional behavior.

Adopted from Phong's structure:

- index the observed typed input as a first-class key;
- produce candidates from multiple strategies before final ranking.

Not adopted:

- direct mappings for evaluation-gap cases;
- Cartesian generation of millions of phrase pairs;
- lazy embeddings on the interactive path;
- fabricated coordinate strings or fixed geographic boxes;
- evaluator logic that copies expected types or uses overly permissive matching.

The selected method is therefore a small, deterministic hybrid: exact trie retrieval
for precision, guarded first-token anchoring for missing abbreviations,
corpus-backed semantic composition for intent and completion, confidence-gated
fusion for ranking, typo recovery as a lower tier, and short-prefix popular fallback
for responsiveness.
