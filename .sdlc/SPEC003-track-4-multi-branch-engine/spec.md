# SPEC003: Multi-Branch Suggestion Engine

## Overview

Refactor autocomplete from "1 pipeline fit all" into a multi-branch suggestion
system where each query type has its own retrieval strategy. The core insight:
33% of test cases are intent-to-template generation, not prefix lookup.

## Architecture

```
Input → Intent Classifier (detect type) → Branch Router → Retrieve → Merge → Rank → Return
           │
           ├─ exact_prefix      → normalized text → Trie exact → Fuzzy
           ├─ abbreviation      → expand abbrev  → Trie
           ├─ semantic          → parse intent   → Template gen → dedup
           ├─ mixed_language    → EN→VI translate → Template gen → dedup
           ├─ navigation        → action detect  → "Chỉ đường" template → Trie
           ├─ coordinate        → regex          → direct response
           ├─ address_number    → regex          → direct response  
           └─ unknown           → raw text       → Trie → Fuzzy → Semantic → Popular
```

## Components

### 1. Intent Classifier (`engine/classifier.ts`)

Detects query type from input patterns. Returns `QueryClass` with
`{type, parsed}`:

```
Priority rules (checked in order):
1. coordinate     — /\d+\.\d+/ matches
2. address_number — /^\d+\s+.+/ matches
3. navigation     — starts with "duong den", "chi duong"
4. abbreviation   — contains known abbrev tokens
5. mixed_language — contains English words (detected from word list)
6. semantic       — contains intent keywords (hoc, wifi, song ao, 24, tre em...)
7. exact_prefix   — default: normalized text for Trie lookup
```

### 2. Query Expander (`engine/expander.ts`)

Transforms input based on detected type:

```
abbreviation  → "bv bach" → ["benh vien bach mai", "bv bach"]
mixed_lang    → "coffee near" → ["quan ca phe gan day", "coffee gan day"]
semantic      → "cafe wifi" → ["quan ca phe co wifi", "cafe wifi", "quan ca phe wifi"]
exact_prefix  → "cafe" → ["ca phe", "cafe"]
```

### 3. Template Generator (`builder/templates.ts`)

Generates suggestion strings from parsed intent:

```
Input: {category: "cà phê", attribute: "wifi"}
Output: ["Quán cà phê có Wi-Fi", "Cà phê có Wi-Fi", "Cà phê WiFi gần đây"]

Input: {location: "Hà Nội", category: "quán ăn"}  
Output: ["Quán ăn Hà Nội", "Ăn đêm Hà Nội"]

Input: {brand: "Phúc Long"}
Output: ["Phúc Long gần đây", "Phúc Long Coffee & Tea"]
```

### 4. Refactored Engine (`engine/engine.ts`)

Multi-branch suggest:

```
function suggest(input):
  queryClass = classifier.classify(input)
  
  candidates = []
  
  for each relevant branch in queryClass.branches:
    transformed = expander.expand(input, branch)
    for each form in transformed:
      results = trie.search(form)
      if results isolated: add to candidates
    if no trie results and branch == semantic:
      results = templateGenerator.generate(queryClass.parsed)
      add to candidates
  
  if candidates empty:
    fuzzy = trie.searchFuzzy(input)
    if fuzzy: return fuzzy
    return popularByRegion()
  
  return ranker.rank(merge(candidates))
```

### 5. Multi-Source Ranker (`core/ranker.ts`)

```
score = sourceBoost × baseScore + matchQuality × 0.3 + popularity × 0.2 + specificity × 0.1

sourceBoost: exact > template_abbrev > template_semantic > template_mixed > fallback
matchQuality: how well the input matches the suggestion text
popularity: from autocomplete dataset / POI popularity
specificity: longer prefix match > shorter prefix match
```

## File Structure

```
src/modules/track-4-autocomplete/
├── core/
│   ├── trie.ts          # (exists) Trie data structure
│   ├── scorer.ts        # (modify) Multi-factor scoring  
│   ├── nlp.ts           # (exists) NLP utilities
│   └── ranker.ts        # (NEW) Multi-source ranking
├── builder/
│   ├── builder.ts       # (modify) Build pipeline
│   └── templates.ts     # (NEW) Template generator
├── engine/
│   ├── engine.ts        # (refactor) Multi-branch suggest
│   ├── classifier.ts    # (NEW) Intent classifier
│   └── expander.ts      # (NEW) Query expander
├── api/
│   ├── router.ts        # (exists)
│   ├── controller.ts    # (exists)
│   └── service.ts       # (modify) Init with new engine
├── data/                # (exists)
├── repo/repo.ts         # (exists)
├── schema/              # (exists)
├── eval/eval.ts         # (modify) Expanded metrics
└── tests/
    ├── engine/
    │   ├── classifier.test.ts   (NEW)
    │   ├── expander.test.ts     (NEW)
    │   └── engine.test.ts       (MODIFY)
    ├── builder/
    │   └── templates.test.ts    (NEW)
    ├── core/
    │   ├── trie.test.ts         (exists)
    │   ├── scorer.test.ts       (exists)
    │   └── nlp.test.ts          (exists)
    └── eval.test.ts             (NEW)
```

## Success Criteria

- MRR > 0.85 on 60 public evaluation cases
- Success Rate > 90%
- All 10 challenge groups have passing cases
- Latency < 10ms P99 (excluding cold-start)
- 100% test coverage on new components (classifier, expander, templates, ranker)
