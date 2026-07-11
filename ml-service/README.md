# Tasco Maps AI — Vietnamese Map-Search Intelligence (P6 + P7)

A Vietnamese **query-understanding core** that powers two challenge tracks and
plugs into the team's Track 4 autocomplete to form one end-to-end pipeline:

| Track | Problem | Owner | Endpoint |
|-------|---------|-------|----------|
| **P6** | AI Search Understanding (messy query → structured intent) | **this project** | `POST /understand` |
| **P7** | AI Semantic Search & Ranking (needs/attributes → ranked places) | **this project** | `POST /search` |
| **P4/P9** | Autocomplete & Suggestions (prefix → ranked suggestions) | Phong + Hai versions | `GET /autocomplete`, `GET /autocomplete/hai` |

**Integrated team pipeline:** `Track 4 autocomplete → P6 /understand → P7 /search`.
Our `/autocomplete` proxies to Phong's Track 4 Deno service when
`TRACK4_URL` is set, and falls back to a built-in local engine otherwise, so the
demo runs standalone. `/autocomplete/hai` always runs Hai's local hybrid semantic-
fusion engine, which lets the team backend compare both versions without
accidental proxying back to Phong.

Vietnamese map queries are noisy — typos, missing accents (`bv bach mai`),
abbreviations (`ks da nang`), mixed language (`hotel near da nang beach`),
incomplete addresses (`12 nguyen hue q1`), ambiguity (`galaxy`) and
natural-language needs (`quán cà phê yên tĩnh để làm việc`). We solve the
understanding once, in a shared core, and expose thin engines on top.

## Quality evidence

The primary acceptance gate is `./run.sh quality`. It never reads the public
evaluation sheets. It uses a deterministic SHA-256 corpus-derived regression
sample and a separate, accent-safe metadata/lexicon judge (not P6 and not
embedding similarity) to score
semantic suggestion relevance, intent and per-value slot fidelity, progressive
25/50/75% query completion, Vietnamese perturbations, OOD abstention,
determinism, concurrency, score safety, duplicate handling, explanations, and
runtime distributions. E5 and TF-IDF have independent frozen baselines; case
counts, evaluator settings, model identity, and corpus fingerprint must match.
Catalog and popular-query rows remain visible to the live engine, so this is a
repeatable production-regression gate—not an estimate of unseen-data quality.

The frozen full regression-sample run reports:

```text
Suggestion relevance   success@6=0.959184  success@1=0.857143  graded utility=0.719651
                       grounded=0.996992   unrelated=0.063158  slot retention=0.856426
Intent prediction      strict accuracy=0.964      macro-F1=0.916  slot fidelity=0.997
Query completion       semantic AUC=0.959184      coverage=1.000  median savings=0.750
Vietnamese             accentless/NFD/format=0.997  typo semantics=0.696
Production             deterministic/bounded/unique/OOD=1.000   concurrent errors=0
```

`./run.sh generalize` is the second, P6/P7-specific gate. It derives exact and
long POIs, direct/reference addresses, open vocabulary, structured constraints,
negation, formatting, single edits, blank/adversarial OOD, score safety, and
candidate stability from the loaded corpus and compares frozen E5/TF-IDF
baselines.

The challenge's 60-row sheets are used only as a final compatibility report.
They were visible during earlier development and therefore are **not a holdout**:

```
P6  Search Understanding   intent_acc=0.950  normalized_exact=0.500  tokenF1=0.926  entity_F1=0.774
P7  Semantic Ranking       recall@3=0.908  recall@5=0.950  MRR=0.943  nDCG@3=0.910  hit@1=0.933
P9  local fallback         type_acc=0.583333  exact_recall=0.444444
                           exact_MRR=0.447222  fuzzy_recall=0.761111
                           public exact matching is diagnostic only
```

The frozen E5 generalization run scores 100% on exact/long P6 POIs, direct-name
P7 retrieval, reference-address ranking, open-vocabulary names, bounded scores,
and adversarial OOD abstention; single-edit P6 accuracy is 98.1%, clean P7
constraint satisfaction is 97.8%, perturbed satisfaction is 80.2%, and scoped
negation ranking is 94.1%. The TF-IDF fallback reaches 86.8% on perturbed
constraints and 97.1% on negation ranking.

P6 and P7 are our primary deliverables. P9 is owned by the teammate's Track 4
service; the numbers above are our built-in **fallback** engine (used only when
the Track 4 service is unavailable). Enabling the optional LLM boost (`--llm`,
needs `OPENROUTER_API_KEY`) refines the hard P6 cases and P7 explanations on top
of this baseline. Sample outputs are in
[`artifacts/sample_outputs.md`](artifacts/sample_outputs.md).
Frozen reports and baselines live in `artifacts/experience_*` and
`artifacts/generalization_baseline_*`.

## Architecture — one core, three engines

```
  user types ─▶ GET /autocomplete ─▶ [Track 4 Trie service]  (teammate; local fallback)
                                              │  selects / submits a suggestion
                                              ▼
                         ┌───────────────────────────────────────────┐
   raw query  ──────────▶│   Vietnamese Query Understanding Core (P6)  │
                         │   normalize → candidate lattice → span-link │
                         │   → scoped constraints / route / time parse │
                         │   → compositional rewrite + confidence      │
                         └───────────────────────────────────────────┘
                            │                                        │
              ┌─────────────┘                                        └──────────────┐
              ▼                                                                      ▼
      P6 /understand                                                          P7 /search
   structured intent JSON                                             understand → hybrid
   (the core, exposed)                                                multi-view RRF retrieve
                                                                       → constraint tiers +
                                                                       quality re-rank → reasons
```

**Shared knowledge base** (`tascomaps/data`): the Track 1, 2, and 4 workbooks are
merged into one in-memory KB — 363 POIs, 150 addresses, a 73-entry abbreviation
dictionary, popular queries, an attribute taxonomy and ranking signals. Category
labels are canonicalized across Vietnamese/English (`Cafe`/`Quán cà phê`/`Cafe/Tea`
→ `Quán cà phê`). The heart is a **phrase lexicon**: one accent-insensitive,
fuzzy-searchable index of every canonical phrase (POI names, brands, streets,
districts, cities, categories, aliases). It does accent restoration, typo
correction, abbreviation grounding and entity linking *simultaneously*. Category,
and attribute vocabularies are extended from loaded corpus/taxonomy data. Dish
heads and modifiers come from the optional Track 6 `Menu Dataset` sheet, with a
conservative Track 2 fallback; evaluation sheets are never used for vocabulary.
Adding workbook values therefore does not require query-specific code.

### P6 · Query Understanding (`tascomaps/core/understand.py`)
1. **Normalize** — Unicode NFC, lowercase, punctuation, coordinate detection.
2. **Candidate lattice** — exact POI/alias spans in the original text are
   protected; typed abbreviations create alternatives instead of destructively
   replacing words inside names. Span length comes from the corpus, not a fixed cap.
3. **Grounded linking** — exact candidates win; a live-corpus progressive
   first-word lookup can recover a unique category, brand, or POI when the
   abbreviation dictionary has no entry. It requires phrase continuation or an
   independently grounded tail constraint and abstains on collisions/OOD text.
   Fuzzy POI recovery still requires token coverage and margin evidence.
4. **Intent classification** — priority rules over the 9 intents (Coordinate,
   Navigation, Ambiguous, Nearby, Address, POI, Brand-Category, Discovery,
   Category). Route segments, addresses, AM/PM time, price, positive attributes,
   and clause-scoped exclusions are parsed compositionally. Entity-owned spans
   take precedence over attribute/location meanings for the same occurrence:
   `đại học` is only a category, while `đại học để học` keeps the independently
   typed study requirement. A requested category at the first meaningful query
   position also owns later containment/proximity clauses, including expanded
   abbreviations (`khách sạn có cf`, `khách sạn gần bx`). A category-only
   facility phrase is never completed to the sole matching POI until a
   distinctive name token is present.
5. **Reconstruct** a clean canonical query without per-query answer templates;
   blank/OOD input abstains instead of inventing a POI.

### P7 · Semantic Search & Ranking (`tascomaps/engines/semantic_search.py`)
- Parse the query with the P6 core (intent, category, attributes, location).
- **Multi-view retrieval**: raw text, normalized text, and structured entities
  are independently searched with dense embeddings + BM25 and combined with
  reciprocal-rank fusion (RRF). Only evidence-bearing ranks vote.
- **Recall safety**: an adaptive candidate pool is unioned with a bounded
  structured match set before reranking; expanding `candidate_k` does not change
  scores already computed for the same item.
- **Constraint-aware re-rank**: category, scoped required/excluded attributes,
  coordinates/user location, reference POI/address, city/district, brand,
  opening time, rating, and coarse price evidence form controlled-relaxation
  tiers. Missing metadata stays
  unknown rather than becoming a false negative. Rating uses a corpus-derived
  Bayesian prior and popularity uses its empirical corpus percentile.
- **Core identity safety**: a grounded POI name or explicit requested category
  is never relaxed into a different identity/type. The rich T2 semantic index
  remains unchanged; when it has no exact representation, a bounded sidecar
  consults exact matches in the unified catalog. Sparse sidecar metadata remains
  unknown, taxonomy synonyms are matched only against non-identity metadata,
  cross-track physical duplicates are merged conservatively, and an unsupported
  identity returns `no_matches` instead of an unrelated venue.
- **Navigation safety**: route markers are selected token-wise outside linked
  POI/admin spans, accented minimal pairs such as `tôi`/`tới` stay distinct,
  route-origin proximity is a soft corpus-calibrated prior, and pure
  city-to-city routes return `navigation_only` instead of arbitrary venues.
- Every result includes bounded `[0,1]` scores, signal evidence, diagnostics, and
  human-readable Vietnamese **reason** (`phù hợp: yên tĩnh, wifi`, `cách ~0.8 km`).
  `source` plus `identity_key` provide a stable source-qualified result identity.

### P9 · Autocomplete — integration (`tascomaps/integrations/track4.py`)
The teammate's **Track 4 Deno service** (character-level Trie with precomputed
Top-10 per node, edit-distance-1 fuzzy, region fallback) is the source of truth.
`GET /autocomplete` proxies to `${TRACK4_URL}/api/v1/track-4/suggest`
(forwarding `q`, `lat`, `lng`, `limit`), normalizes the response and reports its
`source`.

If the service is not configured/reachable, a **local fallback engine** serves
suggestions offline. Two implementations (choose via `TASCO_AC_ENGINE`):

* **`trie`** (default, `engines/trie.py`) — a character-level in-memory trie with
  a **precomputed Top-K at every node**, observed input-prefix access keys,
  separate **strict-head** and **later-token** lanes (so `dong k` reaches
  *Vincom Center Đồng Khởi* without `pho` matching arbitrary names in
  *Hải Phòng*), progressive first-word anchors, and edit-distance-1 recovery.
  Vietnamese matching preserves vowel shape separately from tone: a pending
  tone such as `phơ` can complete to `phở`, while `phô` stays on `phố` and an
  explicitly typed tone never crosses to a different minimal pair. Ambiguous
  one-token typo corrections abstain instead of mixing unrelated head families.
  Exact-trie, first-word, and corpus-derived semantic candidates are merged by
  confidence-weighted reciprocal-rank fusion; fuzzy and region-aware popular
  candidates are lower-confidence recovery tiers. A first-word anchor requires
  phrase continuation or evidence in the remaining words, so a nonce suffix
  cannot bypass OOD abstention.
  Categories, attributes, dishes, brands, addresses, and observed
  category/location combinations feed bounded semantic indexes; there is no
  dish/location Cartesian product or fixed brand family.
* **`scan`** (`engines/autocomplete.py`) — the first-generation candidate-scan
  engine (~3.8 ms/query), kept for comparison.

The corpus-derived semantic regression gate is the acceptance criterion:
completion success@6 is **95.9%**, success@1 **85.7%**, graded utility
**72.0%**, coverage **100%**, grounding **99.7%**, slot retention **85.6%**, and
the unrelated-suggestion rate is **6.3%**. Exact-target and public exact-match
metrics are retained only as diagnostics. Profile any engine—including the
teammate's live service—and render the report:

```bash
python3 -m scripts.analyze_autocomplete --source trie      # or: local | service
python3 -m scripts.build_report                            # → artifacts/autocomplete_report.html
```

### Hybrid LLM boost (`tascomaps/llm/`) — optional
Uses OpenRouter (OpenAI-compatible). Model JSON is treated as untrusted: schema,
types, ranges, time/coordinate bounds, confidence, corpus grounding, lexical
boundaries, raw-query evidence, and normalized-text numeric consistency are
validated. Accepted fields merge onto (and cannot erase) deterministic
constraints; malformed, hallucinated, or contradictory output falls back safely.

## Setup

```bash
cd ml-service
python3 -m pip install -r requirements.txt      # or: ./run.sh install
```

First run downloads the ~120 MB embedding model. To run fully offline without
`torch`, set `TASCO_DISABLE_EMBED=1` (the semantic engine falls back to TF-IDF).
`TASCO_TRACK6_XLSX` can point to an optional Track 6 workbook; only its
`Menu Dataset` sheet is read.

## Run

```bash
./run.sh serve      # API + web demo → http://127.0.0.1:8000  (open / in a browser)
./run.sh quality    # independent semantic judge + corpus regression gate
./run.sh generalize # corpus-derived quality gate; compares frozen model baseline
./run.sh eval       # public compatibility report (not a holdout)
./run.sh full-eval  # P6/P7/P9 accuracy, robustness, ablation, and latency report
./run.sh eval-llm   # evaluation with the OpenRouter LLM boost
./run.sh samples    # regenerate artifacts/sample_outputs.{md,json}
```

Open `http://127.0.0.1:8000/demo/lab` for the unified Model Test Lab. It runs
P9 autocomplete, P6 understanding, and P7 ranking in one workspace and shows
live response time, model evidence, before/after accuracy, and evaluation
provenance. The three focused demo pages remain available from its navigation.

Enable the hybrid LLM boost:

```bash
export OPENROUTER_API_KEY=sk-or-...
export OPENROUTER_MODEL=openai/gpt-4o-mini   # optional
./run.sh serve
```

Integrate the teammate's Track 4 autocomplete (full team pipeline). Their Deno
service and ours both default to port 8000, so run ours on a different port:

```bash
# terminal 1 — teammate's Track 4 service (Deno), e.g. on :8000
# terminal 2 — this project, pointed at it
export TRACK4_URL=http://localhost:8000
PORT=8100 ./run.sh serve      # open http://127.0.0.1:8100
```

`/autocomplete` then proxies to Track 4 (`source: "track-4-service"`) and
silently falls back to the local engine (`source: "local-fallback"`) if it is
down. The web UI shows which source served each keystroke.

## API

| Method & path | Body / params | Returns |
|---|---|---|
| `POST /understand` | `{"query": "...", "boost": false}` | `normalized_query, intent, entities, confidence, source` |
| `GET  /autocomplete` | `?q=<prefix>&k=6&lat=&lng=&smart=false` | `{suggestion_type, suggestions:[{text,display,type,score}], source, latencyMs}` — proxies to Track 4 when configured |
| `GET  /autocomplete/hai` | `?q=<prefix>&k=6&smart=false` | Same response shape, always served by Hai's local engine |
| `POST /search` | `{"query":"...","top_k":5,"candidate_k":null,"lat":null,"lng":null,"as_of":null}` | `understanding, required_attributes, excluded_attributes, diagnostics, results:[{name,score,reasons,signals}]` |
| `GET  /health` | — | config + engine status |
| `GET  /docs` | — | interactive OpenAPI docs |

Example:

```bash
curl -s -X POST localhost:8000/understand -H 'Content-Type: application/json' \
  -d '{"query":"bv bach mai"}'
# → {"normalized_query":"Bệnh viện Bạch Mai","intent":"POI Search",
#    "entities":{"poi_name":"Bệnh viện Bạch Mai","category":"Bệnh viện"},"confidence":0.82}
```

## Tech stack

Python · FastAPI + Uvicorn · sentence-transformers (`multilingual-e5-small`,
local) with a scikit-learn TF-IDF fallback · rank-bm25 · rapidfuzz (fuzzy
Vietnamese matching) · pandas/openpyxl (data) · OpenRouter (optional LLM) ·
vanilla-JS responsive demo UI (no build step).

## Current limitations

- The bundled corpus is challenge-sized. Character TF-IDF is currently stored
  densely, and structured/attribute recall scans all POIs; a large production
  index should use sparse storage plus ANN and filtered retrieval.
- Opening hours contain ranges but no complete weekday/holiday calendar, so
  `open_now` cannot model exceptional schedules.
- Price metadata is coarse `price_level` evidence; exact monetary constraints
  cannot be guaranteed when a POI lacks a real menu or price feed.
- Near-me distance requires caller coordinates, and time-sensitive ranking is
  only definitive when the caller supplies `as_of`.

## Project layout

```
tascomaps/
  config.py            env-driven config + dataset path resolution
  constants.py         canonical categories, intents, attributes, cities
  core/text.py         Vietnamese text primitives (NFC, accent fold, coords)
  core/understand.py   P6 query-understanding engine
  data/loader.py,kb.py unified KB + phrase lexicon
  index/               embeddings + BM25 hybrid index
  engines/             P7 semantic_search; P9 local fallback: trie (default), autocomplete (scan)
  integrations/track4  client for the teammate's Track 4 autocomplete service
  scripts/             analyze_autocomplete (--source local|trie|service) + build_report
  llm/                 optional OpenRouter boost (graceful fallback)
  api/                 FastAPI app + schemas
  web/lab.html         unified P9 → P6 → P7 Model Test Lab
  web/*.html           landing page and focused model demos
eval/evaluate.py       gold-set scoring for all three tracks
scripts/samples.py     >=10 sample outputs per track
scripts/full_suite.py  reproducible full three-model evaluation
scripts/generalization_gate.py  corpus-derived, baseline-comparing P6/P7 quality gate
scripts/experience_quality.py   independent semantic judge + production gate
```

*Datasets are synthetic hackathon data (Tasco Maps AI Challenge) and do not
represent production data.*
