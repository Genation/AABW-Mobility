# Tasco Maps AI Methods

This document explains the technical solution across the three selected Tasco
Maps tasks:

- P6: AI Search Understanding for Maps
- P7: AI Semantic Search & Ranking
- P9: AI-Powered Autocomplete & Query Suggestions

The main design choice is to build one shared Vietnamese map-search knowledge
base and query-understanding core, then expose task-specific engines on top.
Autocomplete predicts likely completed queries, search understanding converts
the submitted query into structured intent, and semantic search uses that intent
to retrieve and rank places.

## 1. Unified System Architecture

The system is implemented as a FastAPI service with three primary endpoints:

| Task | Endpoint | Purpose |
|---|---|---|
| P6 | `POST /understand` | Convert raw query text into structured intent JSON |
| P7 | `POST /search` | Return ranked POIs with relevance scores and explanations |
| P9 | `GET /autocomplete` | Return ranked real-time suggestions for typed prefixes |

The runtime pipeline is:

```text
user typing
  -> P9 autocomplete
  -> selected/submitted query
  -> P6 query understanding
  -> P7 semantic retrieval and ranking
  -> ranked map results with reasons
```

The implementation keeps P6 as the shared intelligence layer. P7 calls P6 before
ranking, and P9 reuses the same knowledge base, abbreviation dictionary, category
normalization, and phrase lexicon.

## 2. Shared Knowledge Base

The data loader merges the Track 1, Track 2, and Track 4 workbooks into one
in-memory `KnowledgeBase`. It can optionally read only the `Menu Dataset` sheet
from Track 6 to enrich food vocabulary; no Track 6 evaluation rows are loaded.

The KB contains:

- POIs from all loaded tracks
- addresses and street aliases
- abbreviation dictionaries
- autocomplete pairs
- popular queries
- attribute taxonomy
- ranking signals
- brands, districts, cities, categories, aliases
- corpus/menu-derived dish phrases, heads, modifiers, and categories
- an accent-insensitive phrase lexicon

The phrase lexicon is the central lookup structure for Vietnamese map language.
Every canonical phrase is indexed in folded form, meaning accents and casing are
removed for matching:

```text
Bệnh viện Bạch Mai -> benh vien bach mai
Nguyễn Huệ          -> nguyen hue
Đà Nẵng             -> da nang
```

This allows the same lookup layer to support:

- accent restoration
- typo-tolerant fuzzy matching
- abbreviation grounding
- entity linking
- prefix retrieval
- POI/brand/street/category detection

Categories are canonicalized across Vietnamese and English variants. For
example:

```text
cafe, coffee, Cafe/Tea, quán cà phê -> Quán cà phê
hotel, khách sạn                    -> Khách sạn
gas station, trạm xăng, cây xăng    -> Cây xăng
```

## 3. P6 Method: AI Search Understanding

P6 solves noisy Vietnamese map query understanding. The target output is a
structured object containing:

- raw query
- normalized query
- detected intent
- extracted entities
- confidence score
- source

Example:

```json
{
  "raw": "bv bach mai",
  "normalized_query": "Bệnh viện Bạch Mai",
  "intent": "POI Search",
  "entities": {
    "poi_name": "Bệnh viện Bạch Mai",
    "category": "Bệnh viện"
  },
  "confidence": 0.82,
  "source": "deterministic"
}
```

### 3.1 Query Normalization

The input query is normalized before interpretation:

- Unicode NFC normalization
- lowercase conversion
- punctuation cleanup
- Vietnamese accent folding for matching
- tokenization
- coordinate detection

Coordinate-like queries are handled first because they are unambiguous:

```text
21.028,105.852 -> Coordinate Search
```

### 3.2 Type-Aware Abbreviation Expansion

The abbreviation dictionary contains both the expansion and a type. The type is
important because not all abbreviations should simply be substituted into text.

Place-like abbreviations become typed alternatives:

```text
bv  -> Bệnh viện
ks  -> Khách sạn
q1  -> Quận 1
vcb -> Vietcombank
```

Intent-like abbreviations become hints:

```text
chỉ đường, duong den -> Navigation hint
gan day, near me     -> current-location/nearby hint
```

Before expansion, exact POI/alias spans in the original text are protected. This
prevents a token such as `coffee`, `hotel`, or `ATM` inside a proper name from
being destructively replaced. The linker evaluates original and expanded forms
as a candidate lattice.

### 3.3 Span Linking and Entity Extraction

The engine performs longest-match span linking against the phrase lexicon. The
maximum span length is derived from the loaded lexicon rather than fixed at six
tokens. Exact grounded spans win; fuzzy recovery requires informative-token
coverage and a winning margin.

Examples:

```text
known long POI name       -> exact canonical POI
single-edit POI typo      -> POI only with sufficient evidence
generic category + city  -> category/location, never an incidental POI
```

The linker extracts typed spans:

- `poi`
- `alias`
- `brand`
- `street`
- `district`
- `city`
- `ward`
- `category`

The engine prioritizes more specific spans over generic spans. POIs outrank
aliases, brands, streets, districts, cities, and categories.

Semantic ownership is occurrence-specific. A word inside a grounded category,
brand, or POI span cannot simultaneously invent an attribute or location
constraint. The same word remains productive when typed outside that identity:

```text
đại học                 -> category=Đại học
đại học để học          -> category=Đại học, attribute=phù hợp học tập
bãi biển gần biển       -> category=Bãi biển, attribute=gần biển
```

Progressive POI grounding also requires an identity-bearing token beyond a
generic category/type prefix. Thus `trường đại học` stays a category search,
while a unique continuation such as `trường đại học bách...` may resolve a POI.

The first meaningful requested category keeps ownership across later relation
clauses. This applies after abbreviation expansion, so both `khách sạn có cafe`
and `khách sạn có cf` remain hotel searches. A category mentioned after
containment language (`địa điểm có nhiều nhà hàng`) remains a soft topical clue
rather than a non-relaxable result type.

When an incomplete first word is not a registered abbreviation, P6 performs a
bounded progressive lookup over live category surfaces, brands, POI names, and
aliases. It accepts a unique identity only when subsequent words continue that
phrase or provide an independently grounded constraint such as an attribute,
district, or current location. Shared heads are resolved by phrase continuation,
not popularity; an unknown suffix produces no hint. Existing exact spans,
registered multiword abbreviations, dishes, and explicit Vietnamese accents keep
priority over this fallback.

### 3.4 Attribute and Constraint Detection

Category and attribute registries are built from the workbooks, taxonomy, and
POI metadata, with a small language synonym seed. New corpus values therefore
become searchable without adding query cases to the source. The parser detects:

- `wifi`
- `yên tĩnh`
- `phù hợp làm việc`
- `phù hợp học tập`
- `mở khuya`
- `24/7`
- `gần biển`
- `bãi đỗ xe`
- `check-in`
- `trẻ em`
- price constraints
- opening-time constraints
- excluded attributes under local negation scope

Dish extraction uses longest exact menu phrases first. Novel compositions reuse
learned dish heads only when their modifiers have independent menu evidence;
this supports new combinations without treating unrelated phrases that happen
to start with a food word as dishes.

Example:

```text
cafe wifi nhưng không đông -> required=[wifi], excluded=[đông khách]
mở cửa sau 8 giờ sáng -> open_after=08:00
```

### 3.5 Reference and Nearby Parsing

Queries with proximity terms are parsed into a target category or POI plus a
reference location. House-number addresses are parsed before fuzzy landmarks,
and data-derived attribute/opening/price/rating clause boundaries prevent a
reference from swallowing later constraints.

```text
atm gần sân bay       -> category=ATM, reference_area=sân bay
cafe gần hồ gươm      -> category=Quán cà phê, reference_poi=Hồ Gươm
hotel near da nang    -> category=Khách sạn, city=Đà Nẵng
```

Current-location expressions are mapped to:

```json
{"location": "current_location"}
```

### 3.6 Intent Classification

The classifier uses deterministic priority rules over the supported map-search
intents:

- Coordinate Search
- Navigation
- Ambiguous
- Nearby Search
- Address Search
- POI Search
- Brand Category Search
- Discovery Search
- Category Search

Priority matters. Route grammar segments origin and destination before generic
entity parsing, while a bare surface matching several branches returns ambiguity
candidates instead of forcing one POI. Blank and unsupported input returns a
low-confidence no-match state rather than arbitrary candidates.

Route markers are selected token-wise outside linked POI and administrative
spans. Accent-aware checks prevent `tôi` or `tối` from becoming `tới`; an
internal `Từ` in `Nam Từ Liêm` or `Bệnh viện Từ Dũ` remains part of the name.
Destination-first forms (`đến X từ Y`, `to X from Y`) and standard forms share
the same parser. A route with only administrative endpoints is returned as a
`navigation_only` result instead of entering venue retrieval.

Examples:

```text
chi duong san bay noi bai -> Navigation
12 nguyen hue q1          -> Address Search
galaxy                    -> Ambiguous
quan ca phe gan day       -> Nearby Search
quan an cho tre em        -> Discovery Search
```

### 3.7 Normalized Query Reconstruction

The final normalized query is composed from canonical semantic slots instead of
per-query rewrite branches. For POI queries, the canonical POI name is preferred:

```text
bv bach mai -> Bệnh viện Bạch Mai
```

For navigation queries, the system reconstructs an action-style query:

```text
duong den ben thanh -> Chỉ đường đến Chợ Bến Thành
```

### 3.8 Optional LLM Boost

The deterministic engine is the baseline. An optional OpenRouter-compatible LLM
boost can refine hard cases. Model output is untrusted and must pass:

- deterministic output
- KB candidate phrases
- abbreviation hits
- allowed intent taxonomy
- strict keys/types/list sizes and confidence `[0,1]`
- coordinate, time, price, and rating bounds
- corpus canonicalization or direct raw-query evidence for every changed slot
- phrase-boundary grounding for open-vocabulary values
- deterministic re-parsing to ensure normalized text preserves numeric/time constraints
- merge semantics that cannot erase deterministic constraints

Malformed, hallucinated, contradictory, or unsupported output returns the
deterministic result unchanged.

## 4. P7 Method: Semantic Search and Ranking

P7 solves place retrieval when users search by needs, attributes, or natural
language rather than exact names.

The P7 pipeline is:

```text
query
  -> P6 understand()
  -> hybrid candidate retrieval
  -> multi-signal reranking
  -> explanations
```

### 4.1 Query Understanding as Ranking Input

P7 first calls the P6 engine. The understanding result provides structured
features:

- category
- brand
- city
- district
- reference POI or area
- coordinates
- attributes
- opening constraints
- current-location indicator

This means semantic ranking is not only text matching. It can use explicit
constraints extracted from the query.

Example:

```text
quán cà phê yên tĩnh để làm việc
```

becomes approximately:

```json
{
  "intent": "Category Search",
  "entities": {
    "category": "Quán cà phê",
    "attributes": ["yên tĩnh", "phù hợp làm việc"]
  }
}
```

### 4.2 POI Document Construction

Each POI is converted into a searchable document string containing:

- name
- English name and aliases
- category
- subcategory
- brand
- address and ward
- description
- attributes
- tags
- district
- city
- opening hours

This document is used for both vector retrieval and BM25 lexical retrieval.

### 4.3 Hybrid Retrieval

P7 uses two retrieval modalities over multiple query views:

1. Dense semantic retrieval
2. BM25 lexical retrieval

The dense retriever uses `intfloat/multilingual-e5-small` when available. The
system prefixes documents and queries in the E5 style:

```text
passage: <poi document>
query: <user query>
```

If the embedding model is unavailable, the system falls back to a character
TF-IDF embedder. This keeps the search service operational without network or
heavy model dependencies.

BM25 uses folded Vietnamese tokens so accentless and accented forms can still
match. Raw text, the P6 normalized query, and a structured entity/constraint view
are ranked independently. Evidence-bearing ranks are combined with reciprocal
rank fusion (RRF); zero-score ties do not vote. This avoids incompatible score
scales and corpus-order bias.

An adaptive overfetch pool is unioned with a bounded structured candidate set.
RRF is calibrated over a stable corpus window, so changing `candidate_k` does not
renormalize or change an existing item's score.

### 4.4 Multi-Signal Reranking

Each candidate is reranked using the active subset of semantic, constraint, and
business signals. The current general priors are renormalized per query:

| Signal | Weight | Meaning |
|---|---:|---|
| relevance | 0.50 | multi-view RRF relevance |
| exact name | 0.40 | grounded POI identity when requested |
| category | 0.12 | explicit category compatibility |
| attributes | 0.16 | semantic required/excluded constraints |
| location | 0.18 | city, district, reference, or distance |
| hours | 0.12 | after/before/late/24h/open-now compatibility |
| brand / price | 0.08 / 0.06 | explicit brand and coarse price evidence |
| rating / popularity | 0.08 / 0.06 | Bayesian rating and corpus percentile |

Known violations define controlled-relaxation tiers. Missing metadata stays
unknown with a mild discount; it is not treated as evidence that a requirement
is false. Scores and returned signals are finite and clipped to `[0,1]`.

Grounded names and explicitly requested head categories form a non-relaxable
identity scope. If T2 contains that scope, reranking is restricted to compatible
rows. If T2 has no representation, P7 performs an exact-only lookup over the
unified catalog without adding sparse T1/T4 rows to the dense index. It enforces
hard city/district/reference constraints, keeps unmatched sparse attributes
unknown, merges only same-name physical records supported by tight geography or
address identity, and otherwise returns `no_matches`. Each result includes a
source-qualified `identity_key` so colliding workbook-local POI IDs are safe for
downstream actions.

### 4.5 Location and Distance Scoring

The location scorer supports:

- city match
- district match
- reference POI lookup
- reference area lookup
- reference address lookup across address rows and geocoded POI addresses
- direct coordinates

When coordinates are available, distance is computed with haversine distance.
The proximity score decays exponentially over distance:

```text
proximity = exp(-distance_km / 3.0)
```

This gives nearby candidates a strong boost while still allowing high-quality
semantic matches slightly farther away.

For a navigation request to a category, origin distance is a soft ordering
prior rather than a hard radius. Its decay scale is calibrated from the nearest
live destination of that category, allowing both local and long routes without
a query-specific distance rule.

### 4.6 Explainable Results

Each result includes a score, per-signal values, and Vietnamese reasons.

Example reasons:

```text
đúng loại Quán cà phê
phù hợp: wifi, yên tĩnh
thuộc Quận 1
cách ~0.8 km
đánh giá 4.5★
phổ biến
```

This makes the ranked output auditable and useful for a demo or API consumer.

## 5. P9 Method: Autocomplete and Query Suggestions

P9 solves low-latency suggestion generation while users type.

The current default local engine is `TrieAutocomplete`. It is selected by:

```text
TASCO_AC_ENGINE=trie
```

The API can also proxy to a teammate Track 4 service when `TRACK4_URL` is set.
If that service is unavailable, the local trie engine is used.

### 5.1 Trie Corpus Construction

The trie corpus is built from the unified KB:

- curated autocomplete pairs
- popular queries
- POI names
- brand names
- street and address strings
- category templates
- dish templates
- category/dish + city/district combinations
- check-in, rooftop, and other compositional templates

Each phrase is stored with:

- display text
- suggestion type
- score
- source

Suggestion types include:

- Brand Suggestions
- Category Suggestions
- POI Suggestions
- Nearby Suggestions
- Address Suggestions
- Discovery Search
- Ambiguous
- Navigation
- Attribute Search
- Coordinate Search

### 5.2 Character Trie with Precomputed Top-K

The trie is character-level. Each node stores:

- children
- terminal entries
- precomputed top suggestions below that prefix

At build time, the engine recursively computes the top candidates under every
node. This makes runtime lookup very fast:

```text
prefix -> trie walk -> node.top -> suggestions
```

### 5.3 Multi-Key Token-Suffix Insertion

Each phrase is inserted under its full folded key and also under selected token
suffixes.

Example:

```text
Vincom Center Đồng Khởi
```

is reachable from:

```text
vincom center dong khoi
center dong khoi
dong khoi
khoi
```

This allows prefixes like:

```text
vincom dong k
dong k
```

to still retrieve the correct POI.

Generic suffix heads such as category words are skipped to avoid flooding common
queries like `cafe` with every long POI containing coffee-related terms.

### 5.4 Trie Scoring

Scores encode source authority:

```text
curated > popular > brand > POI > address > template > combo
```

Suffix-key matches receive a small penalty so full-prefix matches rank higher.
Fuzzy matches also receive a penalty.

This keeps exact curated suggestions dominant while still allowing broader
fallback behavior.

### 5.5 Typo-Recovery Lookup

When neither exact nor semantic evidence produces a candidate, the engine runs a
bounded fuzzy lookup over trie keys.

The fuzzy search supports:

- substitution
- insertion
- deletion
- one adjacent transposition

This helps with short typos:

```text
nguyen huee -> Nguyễn Huệ
```

### 5.6 Hybrid Corpus-Derived Semantic Fusion

Trie lookup is excellent when user token order resembles stored phrase order,
but autocomplete often receives partial natural-language intent in a different
order. The engine therefore treats exact trie retrieval and structured semantic
completion as complementary candidate producers instead of mutually exclusive
early-return branches.

For multiword input whose first word is a valid trie prefix but whose full key is
not, a bounded first-token producer can contribute identity-bearing POI, brand,
address, acronym, or observed-prefix candidates. It is enabled only when the tail
continues the candidate or independently parses as grounded query evidence. Its
confidence cap is below exact and semantic evidence, and it is disabled for an
unknown tail. This handles corpus-derived inputs such as a progressive brand plus
an amenity without adding another abbreviation entry.

The semantic producer is compositional rather than a table of evaluation
prefixes. P6 provides already-complete slots, while partial final tokens are
matched against live category, attribute, city, district, brand, and dish
registries. Category and location indexes bound the POI candidate set before
completion rows are constructed. It handles reusable families:

- category/attribute/location composition from loaded POI metadata
- category-conditioned attributes when a phrase can also be another category
- corpus dish completion, including multiword dishes not known at code-writing time
- brand families and branches derived from loaded brand/POI relationships
- accent-safe partial matching (`phố` cannot silently become `phở`)
- navigation intent + destination type or destination entity
- coordinate prefixes using only KB/address coordinates
- popular-query fallback when no structured interpretation is available

Only observed category/location combinations are materialized in the trie.
Category/dish × every-location Cartesian products are avoided; unseen valid
combinations are composed on demand from semantic slots.

Natural-language candidate pools are fused once with confidence-weighted
reciprocal-rank votes. Exact evidence defines the primary tier when present;
semantic candidates can corroborate or complete the list without displacing a
strong exact pool. Fuzzy candidates are used only when exact and semantic
evidence are absent, and popular queries are the final short-prefix fallback.
Coordinates, navigation, and resolved house-number addresses retain direct
high-confidence paths because their intent is already explicit.

### 5.7 Popular Fallback

If no exact, semantic, or fuzzy result exists, the engine falls back to popular
queries.

When coordinates are provided, the nearest city is inferred from live POI
centroids and its popular queries are preferred. No latitude thresholds or fixed
regional boxes are embedded in code. Unsupported prefixes of three or more
meaningful characters abstain; a popular fallback is retained only for unknown
one- and two-character prefixes.

This keeps autocomplete responsive even for unseen prefixes.

## 6. Evaluation Method

The primary end-to-end acceptance gate is:

```bash
python -m scripts.experience_quality
```

It never loads public evaluation rows. A deterministic SHA-256 fifth of each
corpus family forms a stable regression sample. An independent accent-safe metadata/lexicon
judge—without P6 and without embeddings—grades canonical IDs and every expected
slot value. It measures graded suggestion relevance, semantic success, progressive
25/50/75% completion, intent macro-F1/calibration, Vietnamese accentless/NFD/
format/typo/colloquial robustness, OOD abstention, deterministic bounded unique
results, explanations, concurrency, startup, and latency distributions. Exact
target text is reported only as a diagnostic. E5 and TF-IDF baselines also freeze
case counts, evaluator parameters, corpus fingerprint, and backend identity.
The live engine still indexes the catalog and popular-query rows from which the
sample is derived; independence applies to the judge, not to data visibility.
Accordingly, this gate measures repeatable regression quality rather than unseen-
data generalization.

The P6/P7-specific secondary gate also does not read public labels:

```bash
python -m scripts.generalization_gate
```

It covers grounded POI/direct-address/reference-address/open-vocabulary retrieval,
long names, formatting and single-edit stability, clean/perturbed structured
constraints, contrastive negation, blank abstention, pure and corpus-prefixed
nonword OOD probes, bounded scores, and frozen-baseline regression.

The project also includes a public compatibility evaluator:

```bash
python -m eval.evaluate
```

It reports:

- P6 intent accuracy, normalized exact match, normalized token F1, entity F1
- P7 recall@3, recall@5, MRR, nDCG@3, hit@1
- P9 suggestion type accuracy, strict exact recall/MRR, and secondary fuzzy recall

These public sheets were visible during development. Their results are a final
compatibility diagnostic, not an estimate of private or production
generalization.

P9 can also be analyzed independently:

```bash
python -m scripts.analyze_autocomplete --source trie
python -m scripts.build_report
```

## 7. Current Results

The frozen corpus-derived sample with an independent semantic judge reports:

```text
Suggestions  success@6=0.959184  success@1=0.857143  graded utility=0.719651
             grounded=0.996992   unrelated=0.063158  slot retention=0.856426
Intent       strict=0.964      macro-F1=0.916       slot fidelity=0.997
Completion   semantic AUC=0.959184  coverage=1.000  median savings=0.750
Vietnamese   accentless/NFD/format=0.997  single-edit semantics=0.687
Production   deterministic/bounded/unique/OOD=1.000  concurrent errors=0
```

The frozen corpus-derived E5 gate (which does not read public evaluation rows)
reports:

```text
P6  exact POI=1.000  long POI=1.000  single-edit=0.981  OOD abstention=1.000
P7  direct name@5=1.000  address@5=0.991  reference address@1=1.000
    open vocabulary@5=1.000  clean constraints@1=0.978
    perturbed constraints@1=0.802  negation ranking@1=0.941  OOD=1.000
```

The final deterministic public compatibility run with the embedding path enabled
reports (these visible sheets are not a holdout):

```text
P6  AI Search Understanding (Track 1)
    n=60  intent_acc=0.950  normalized_exact=0.500
    normalized_tokenF1=0.926  entity_F1=0.774

P7  Semantic Search & Ranking (Track 2)
    n=60  recall@3=0.908  recall@5=0.950
    MRR=0.943  nDCG@3=0.910  hit@1=0.933

P9  local autocomplete fallback
    semantic success@6=0.959184  coverage=1.000  AUC=0.959184
    public type_acc=0.583333  exact_recall=0.444444
    exact_MRR=0.447222  fuzzy_recall=0.761111
    public exact matching remains a compatibility diagnostic only
```

## 8. Scope and Limitations

The current corpus is challenge-sized. Autocomplete pre-indexes semantic slot
filters and avoids Cartesian phrase expansion, but the TF-IDF fallback still
materializes a dense character-ngram matrix and P7 structured recall/reranking
still scans bounded corpus windows. A production-scale deployment should use
sparse fallback storage, ANN, and database-level filtered retrieval.

Opening-hour evidence does not include a complete weekday/holiday calendar,
price evidence is usually a coarse level rather than a live amount, and
near-me/time-sensitive decisions remain unknown unless the caller supplies
coordinates and `as_of`. These states are deliberately not converted into false
matches or false violations.

## 9. Why This Solves the Three Tasks Together

The three tasks are related parts of one map-search experience:

- P9 predicts the likely completed query while the user is typing.
- P6 understands the submitted query and converts it into structured intent.
- P7 uses that structured intent to retrieve, rank, and explain map results.

The solution avoids building three disconnected systems. Instead, it shares:

- the same POI/address/category knowledge base
- the same Vietnamese normalization logic
- the same abbreviation dictionary
- the same category canonicalization
- the same entity vocabulary
- the same intent and attribute concepts

This makes the pipeline consistent. A prefix like `ks d` can autocomplete to a
hotel query, the submitted query can be understood as a hotel/location intent,
and semantic ranking can use the same category and location signals to return
the right places.
