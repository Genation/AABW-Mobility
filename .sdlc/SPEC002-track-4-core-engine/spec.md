# SPEC002: Track 4 Autocomplete — Core Engine

## Overview

Production-grade autocomplete engine: character-level Trie with fuzzy search
(edit distance), multi-factor scoring, build pipeline, and runtime API.

## Architecture

```
BUILD TIME (startup / on-demand)
  DB (5 tables) → Builder → Scorer → Trie → snapshot.json

RUNTIME (every request)
  query → normalize → expand abbrev → Trie exact → Trie fuzzy(edit=1) → popular fallback → response
```

## Components

### 1. Trie (`track-4-autocomplete.trie.ts`)

Character-level Trie. Each node holds:
- `children: Map<string, TrieNode>` — next char → child node
- `topK: Suggestion[]` — pre-sorted Top-10 suggestions, maintained at insert time

**Exact search:** `O(p)` traversal, p = prefix length. Return `node.topK`.

**Fuzzy search:** DFS over Trie with edit distance budget. At each step, try:
- Match (no edit): follow child with matching char, advance query position
- Substitute (1 edit): follow child with different char, advance query position
- Insert (1 edit): follow any child, same query position
- Delete (1 edit): stay at node, advance query position

Only explores branches that exist in the Trie (unlike generate-then-test).
Complexity: O(nodes_visited × branching_factor) ≈ 100-500 node visits for edit=1.

**insertTopK helper:** Binary insert, cap at 10, maintain sorted order.

**Serialization:** `toJSON()` / `fromJSON()` for snapshot persistence.

### 2. Scorer (`track-4-autocomplete.scorer.ts`)

Multi-factor scoring with priority tiers. Each tier has a concrete formula:

| Tier | Source | Formula | Score Range |
|------|--------|---------|-------------|
| 1 | Autocomplete ground truth, full prefix | `score_gốc` (unchanged) | 0.86-0.98 |
| 2 | Prefix variant of ground truth | `score_gốc × (0.85 + 0.15 × prefixLen/fullLen)` | 0.73-0.93 |
| 3 | Accent/abbrev variant of ground truth | `score_gốc × 0.85` | 0.73-0.83 |
| 4 | Popular query (gốc, DB `is_generated=false`) | `min(frequency / 15000, 1.0) × 0.75` | 0.50-0.75 |
| 5 | POI name exact match | `popularityScore / 100` | 0.50-0.99 |
| 6 | Popular query (generated, DB `is_generated=true`) | `min(frequency / 15000, 1.0) × 0.55` | 0.35-0.55 |
| 7 | Template — brand nearby | `0.55` | 0.55 |
| 7 | Template — category nearby | `0.50` | 0.50 |
| 7 | Template — category city | `0.48` | 0.48 |
| 7 | Template — category attribute | `0.46` | 0.46 |
| 7 | Template — discovery | `0.42` | 0.42 |
| 7 | Template — navigation | `0.40` | 0.40 |
| 8 | Category-only entry (no POI) | `0.35` | 0.35 |

**Data origin** (`is_generated`): Every table has a boolean column `is_generated`.
- `false` = data from BTC (POI CSV, Autocomplete CSV, Abbrev CSV, Popular CSV)
- `true` = data from our LLM enrichment phase
Generated data always scores lower than equivalent original data to preserve ground truth priority.

### 3. Repo (`track-4-autocomplete.repo.ts`)

DB read queries for all 5 tables + builder needs:
- `getAllAutocompleteEntries()` — gốc + generated
- `getAllPois()` — gốc + generated
- `getAllPopularQueries()` — gốc + generated
- `getAllAbbreviations()` — gốc + generated
- `getPopularByRegion(region: string, limit: number)` — for fallback

### 4. Builder (`track-4-autocomplete.builder.ts`)

Orchestrates the build pipeline:

```
1. Load abbreviations → buildAbbreviationMap()
2. Load autocomplete entries → for each: generatePrefixes → insert into Trie
3. Load POIs → for each:
   a. poiName → generatePrefixes → insert (tier 5: name match)
   b. category → template "[category] gần đây" → generatePrefixes → insert (tier 7: 0.50)
   c. brand → template "[brand] gần nhất" → generatePrefixes → insert (tier 7: 0.55)
4. Load popular queries → for each: generatePrefixes → insert
5. Compute node count from serialized trie JSON
6. Serialize Trie → save snapshot.json to disk
```

Snapshot format includes version, build timestamp, trie JSON, node count, pair count, and source breakdown stats.

### 5. Engine (`track-4-autocomplete.engine.ts`)

Runtime singleton:
- `load(snapshotPath?)`: deserialize Trie + build popular query cache by region
- `suggest(input, options?)`: normalize → expand → exact search → fuzzy search → popular fallback

Fallback flow:
1. input.length < 2 → return popular queries by region
2. Trie exact → if results, return
3. Trie fuzzy (edit=1) → if results, return
4. Popular queries by region → fallback

### 6. API Layer

**Endpoint:** `GET /api/v1/track-4/suggest?q=caf&lat=10.77&lng=106.70&limit=10`

**Response:**
```json
{
  "suggestions": [
    { "text": "quan ca phe gan day", "display": "Quán cà phê gần đây", "type": "Category Search", "score": 0.97 }
  ],
  "latencyMs": 0.8,
  "source": "exact"
}
```

## Performance

- Exact search: <1µs (O(p) map traversal)
- Fuzzy search (edit=1): ~200µs (DFS over Trie, ~200 node visits)
- 95% exact / 5% fuzzy: ~11µs avg
- Single thread: ~30K QPS blended
- 4 workers: ~120K QPS
- Network overhead (TCP round-trip): 1-5ms (dominant factor)

## File Structure

```
src/modules/track-4-autocomplete/
├── track-4-autocomplete.schema.ts    # (exists) 5 tables
├── track-4-autocomplete.dto.ts       # (modify) add SuggestRequest/Response
├── track-4-autocomplete.nlp.ts       # (exists) normalize, accents, abbrev
├── track-4-autocomplete.trie.ts      # (NEW) Trie + fuzzy search
├── track-4-autocomplete.scorer.ts    # (NEW) scoring logic
├── track-4-autocomplete.repo.ts      # (NEW) DB read queries
├── track-4-autocomplete.builder.ts   # (NEW) build pipeline
├── track-4-autocomplete.engine.ts    # (NEW) runtime engine
├── track-4-autocomplete.service.ts   # (NEW) service layer
├── track-4-autocomplete.controller.ts # (NEW) HTTP handlers
├── track-4-autocomplete.router.ts    # (NEW) routes
├── data/
│   ├── enrich.ts                     # (exists) LLM enrichment
│   ├── 001-005_*.sql                 # (exists) enriched data
│   └── snapshot.json                 # generated at build time
└── tests/
    ├── track-4-autocomplete.trie.test.ts     (NEW)
    ├── track-4-autocomplete.scorer.test.ts   (NEW)
    ├── track-4-autocomplete.nlp.test.ts      (NEW)
    ├── track-4-autocomplete.builder.test.ts  (NEW)
    └── track-4-autocomplete.api.test.ts      (NEW)
```

## Dependencies on Shared Infrastructure

- `@/db/pool.ts` — DB connection
- `@/configs/logger.ts` — logging
- `@/shared/errors/error-factory.ts` — AppError
- `@/shared/responses.ts` — response format
- `@/shared/utils/dto-builder.ts` — DTO builder
