# Track 4 Multi-Branch Engine — Implementation Plan  

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> sdlc:subagent-driven-development (recommended) or sdlc:executing-plans to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Goal:** Refactor autocomplete into multi-branch suggestion engine with intent detection, template generation, and per-type retrieval

**Architecture:** Intent Classifier → Query Expander → Multi-Branch Retrieve (Trie exact/fuzzy, template gen, EN→VI, navigation, coordinate, address) → Merge → Ranker → Output

**Tech Stack:** Deno, TypeScript, Drizzle ORM, PostgreSQL, Hono

---

## File Map

| File | Create/Modify | Responsibility |
|------|--------------|----------------|
| `engine/classifier.ts` | Create | Detect query type from input patterns |
| `engine/expander.ts` | Create | Transform input based on query type |
| `builder/templates.ts` | Create | Generate suggestion strings from intent |
| `core/ranker.ts` | Create | Multi-source ranking with source boost |
| `engine/engine.ts` | Refactor | Multi-branch suggest pipeline |
| `builder/builder.ts` | Modify | Integrate template generator |
| `core/scorer.ts` | Modify | Ensure tier separation for new sources |
| `api/service.ts` | Modify | Init new engine |
| `eval/eval.ts` | Modify | Per-type metrics, enhanced matching |
| `tests/engine/classifier.test.ts` | Create | Classifier unit tests |
| `tests/engine/expander.test.ts` | Create | Expander unit tests |
| `tests/builder/templates.test.ts` | Create | Template gen unit tests |
| `tests/core/ranker.test.ts` | Create | Ranker unit tests |
| `tests/eval/eval.test.ts` | Create | Eval integration tests |

---

### Task 1: Intent Classifier

**Dependency:** None  
**Files:** Create `engine/classifier.ts`, Create `tests/engine/classifier.test.ts`

Implement `classify(input: string): QueryClass` that returns query type and parsed intent.

```typescript
interface QueryClass {
  type: 'coordinate' | 'address_number' | 'navigation' | 'abbreviation' | 'semantic' | 'mixed_language' | 'exact_prefix';
  parsed: ParsedIntent;
  branches: string[]; // which retrieval branches to use
}

interface ParsedIntent {
  category?: string;
  brand?: string;
  attribute?: string;
  location?: string;
  action?: string;
  raw: string;
}
```

**Pattern rules:**
1. Coordinate: `/\d+\.\d+(,\s*\d+\.\d+)?/.test(input)` → coordinate
2. Address: `/^\d+\s+\w+/.test(input)` → address_number
3. Navigation: input starts with "duong den", "chi duong" → navigation
4. Abbreviation: contains known abbrev tokens (`ks`, `bv`, `vcb`, `dh`, `cf`, `q\d`...) → abbreviation
5. Mixed Language: contains English word (`coffee`, `hotel`, `near`, `beach`, `halal`, `rooftop`...) → mixed_language
6. Semantic: contains intent keywords (`hoc`, `wifi`, `song ao`, `24`, `tre em`, `yen tinh`, `check`, `lam viec`, `hoc bai`...) → semantic
7. Default: exact_prefix

**Tests must cover:** All 60 eval input prefixes classified correctly, edge cases, overlapping patterns.

---

### Task 2: Query Expander

**Dependency:** Task 1 (Classifier types)  
**Files:** Create `engine/expander.ts`, Create `tests/engine/expander.test.ts`

Implement `expand(input: string, queryClass: QueryClass, abbreviationMap: Map<string,string>): string[]` that generates search forms.

```typescript
export function expand(input: string, queryClass: QueryClass, abbrMap: Map<string, string>): string[] {
  const forms: string[] = [normalize(input)]; // always include raw form

  switch (queryClass.type) {
    case 'abbreviation':
      // "bv bach" → ["benh vien bach mai", "bv bach"]
      forms.push(expandAllAbbreviations(input, abbrMap));
      break;
    case 'mixed_language':
      // "coffee near" → ["ca phe gan day", "quan ca phe gan day"]
      forms.push(...translate(input).map(normalize));
      break;
    case 'semantic':
      // "cafe wifi" → ["quan ca phe co wifi", "quan ca phe wifi", "cafe co wifi"]
      forms.push(...generateSemanticForms(queryClass.parsed));
      break;
    case 'navigation':
      // "duong den ben" → "chi duong den cho ben thanh"
      forms.push("chi duong den " + queryClass.parsed.location);
      break;
    // exact_prefix, coordinate, address_number: no extra forms
  }
  return [...new Set(forms)];
}
```

**Tests:** Each query type produces correct forms, abbreviations expand correctly, mixed language maps to VI.

---

### Task 3: Template Generator

**Dependency:** None (pure functions)  
**Files:** Create `builder/templates.ts`, Create `tests/builder/templates.test.ts`

Implement template generation from parsed intent:

```typescript
export function generateSemanticTemplates(parsed: ParsedIntent): string[] {
  // group 3 rules: {category} + {attribute}
  const attributeMap: Record<string, string[]> = {
    'hoc': ['phù hợp học tập', 'có thể học bài'],
    'wifi': ['có Wi-Fi', 'có WiFi'],
    '24': ['mở cửa 24/7'],
    'tre em': ['phù hợp cho trẻ em'],
    'yen tinh': ['yên tĩnh'],
    'lam viec': ['làm việc'],
    'check': ['địa điểm check-in đẹp'],
    'song ao': ['đẹp để check-in'],
    'khu': ['mở cửa khuya'],
  };

  const categoryMap: Record<string, string[]> = {
    'cafe': ['Quán cà phê', 'Cà phê', 'Cafe'],
    'ca phe': ['Quán cà phê', 'Cà phê'],
    'quan an': ['Quán ăn', 'Nhà hàng'],
    'quan cafe': ['Quán cà phê'],
    'phong gym': ['Phòng gym', 'Phòng tập gym'],
    'gym': ['Phòng gym', 'Phòng tập gym'],
    'nha hang': ['Nhà hàng'],
  };

  // combine categories × attributes
  const results: string[] = [];
  const cats = parsed.category ? categoryMap[parsed.category] || [parsed.category] : [];
  const attrs = parsed.attribute ? attributeMap[parsed.attribute] || [parsed.attribute] : [];

  for (const cat of cats) {
    for (const attr of attrs) {
      results.push(`${cat} ${attr}`);
    }
  }

  // add nearby template
  if (cats.length && !parsed.attribute) {
    results.push(...cats.map(c => `${c} gần đây`));
  }
  if (parsed.location && cats.length) {
    results.push(...cats.map(c => `${c} ${parsed.location}`));
  }

  return [...new Set(results)];
}

export function generateCityFirstTemplates(city: string, intent: string): string[] {
  return [`${intent} ${city}`, `Quán ${intent.toLowerCase()} ${city}`];
}

export function generateBrandTemplates(brand: string): string[] {
  return [`${brand} gần đây`, `${brand} gần nhất`, `${brand}`];
}

export function generateNavigationTemplates(target: string): string[] {
  return [`Chỉ đường đến ${target}`, `Đường đến ${target}`];
}
```

**Tests:** Each pattern generates correct output, edge cases (empty parsed, unknown attribute).

---

### Task 4: Multi-Source Ranker

**Dependency:** None (pure functions)  
**Files:** Create `core/ranker.ts`, Create `tests/core/ranker.test.ts`

```typescript
interface RankedSuggestion {
  text: string; display: string; type: string; score: number; source: string;
}

export function rank(
  candidates: Map<string, RankedSuggestion[]>,
  queryLength: number,
  options?: { lat?: number; lng?: number },
): RankedSuggestion[] {
  const sourceBoost: Record<string, number> = {
    'ground_truth': 1.0,
    'exact_prefix': 0.95,
    'abbreviation': 0.85,
    'semantic_template': 0.75,
    'mixed_language': 0.70,
    'navigation': 0.65,
    'fuzzy': 0.60,
    'popular': 0.30,
  };

  const all: RankedSuggestion[] = [];
  for (const [source, items] of candidates) {
    const boost = sourceBoost[source] || 0.5;
    for (const item of items) {
      all.push({
        ...item,
        score: item.score * boost,
        source,
      });
    }
  }

  // sort by adjusted score desc, deduplicate by display text
  return all
    .sort((a, b) => b.score - a.score)
    .filter((item, i, arr) => arr.findIndex(x => x.display === item.display) === i)
    .slice(0, 10);
}
```

**Tests:** Ground truth always ranks #1, source boost applies correctly, deduplication works.

---

### Task 5: Refactored Engine

**Dependency:** Tasks 1-4  
**Files:** Refactor `engine/engine.ts`, Create `tests/engine/engine.test.ts`

Rewire `suggest()` to use classifier → expander → multi-branch → merge → rank:

```
suggest(input, options):
  1. if input < 2 → popular
  2. Check coordinate regex → direct response
  3. Check address number regex → direct response
  4. queryClass = classifier.classify(input)
  5. if queryClass.type in [coordinate, address_number] → already handled
  6. forms = expander.expand(input, queryClass, abbrMap)
  7. candidates = new Map()
  8. for each form: search Trie exact; if found, add to candidates with source = queryClass.type
  9. if semantic and no trie results: generate templates, assign heuristic scores
  10. if no candidates: fuzzy search
  11. if still no candidates: popular fallback
  12. return ranker.rank(candidates, input.length, options)
```

---

### Task 6: Builder + Service Updates

**Dependency:** Task 3 (templates)  
**Files:** Modify `builder/builder.ts`, Modify `api/service.ts`

Integrate template generator into builder pipeline:
- Call `generateSemanticTemplates`, `generateCityFirstTemplates`, `generateBrandTemplates`, `generateNavigationTemplates`
- Insert generated templates into Trie with appropriate source labels
- Update `api/service.ts` to init new engine

---

### Task 7: Enhanced Eval

**Dependency:** Task 5 (engine)  
**Files:** Modify `eval/eval.ts`

Add per-type metrics:
- MRR by suggestion type (Brand, Category, POI, Discovery, etc.)
- MRR by difficulty (Easy, Medium, Hard)  
- Match source breakdown (exact, fuzzy, semantic, template, popular)
- Latency percentiles (P50, P95, P99)
- R@1, R@3, R@5, R@10

---

### Task 8: Integration Tests + Final Eval

**Dependency:** All tasks  
**Files:** Create `tests/eval/eval.test.ts`

Run full pipeline integration test:
```typescript
Deno.test("Eval: all 60 public evaluation cases", async () => {
  const report = await runEval();
  assertEquals(report.totalCases, 60);
  // Target thresholds
  assertGreater(report.metrics.mrr, 0.75);
  assertGreater(report.metrics.successRate, 0.85);
  assertGreater(report.metrics.r1, 0.70);
});
```

Final verification:
```bash
deno check src/ && deno lint src/ && deno fmt src/
deno test -A --env-file=.env.local src/modules/track-4-autocomplete/tests/
deno run --env-file=.env.local -A src/modules/track-4-autocomplete/eval/eval.ts
```
