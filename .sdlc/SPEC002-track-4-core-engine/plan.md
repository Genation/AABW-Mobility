# Track 4 Core Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> sdlc:subagent-driven-development (recommended) or sdlc:executing-plans to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Goal:** Build production-grade autocomplete engine: Trie + fuzzy search + scorer + builder + runtime API

**Architecture:** Character-level Trie (in-memory) with DFS fuzzy search (edit distance), multi-factor scoring from DB sources, pre-computed top-K at each node, JSON snapshot for persistence, 3-tier fallback (exact → fuzzy → popular)

**Tech Stack:** Deno, TypeScript, Drizzle ORM, PostgreSQL, Hono

---

## File Map

| File | Create/Modify | Responsibility |
|------|--------------|----------------|
| `trie.ts` | Create | Trie data structure, insert, exact search, fuzzy search, topK management, serialize |
| `scorer.ts` | Create | Multi-factor scoring from DB row data |
| `repo.ts` | Create | DB read queries for builder + engine fallback |
| `builder.ts` | Create | Build pipeline: load DB → score → insert Trie → save snapshot |
| `engine.ts` | Create | Runtime: load snapshot, suggest with fallback |
| `service.ts` | Create | Orchestration between controller and engine |
| `controller.ts` | Create | HTTP handlers |
| `router.ts` | Create | Routes |
| `dto.ts` | Modify | Add SuggestRequest/SuggestResponse schemas |
| `src/router.ts` | Modify | Register track-4 router |
| `tests/trie.test.ts` | Create | Trie unit tests |
| `tests/scorer.test.ts` | Create | Scorer unit tests |
| `tests/nlp.test.ts` | Create | NLP unit tests |
| `tests/api.test.ts` | Create | API integration tests |

---

### Task 1: Trie — Core Structure + Insert + Search Exact

**Files:**
- Create: `src/modules/track-4-autocomplete/track-4-autocomplete.trie.ts`
- Create: `src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts`

- [ ] **Step 1: Write failing unit tests for Trie insert and search**

In `src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts`:
```typescript
import { assertEquals } from "@std/assert";
import { Trie } from "../track-4-autocomplete.trie.ts";

Deno.test("Trie: insert and exact search returns sorted topK", () => {
  const trie = new Trie();
  trie.insert("cafe", { text: "cafe", display: "Cà phê gần đây", type: "Category", score: 0.97 });
  trie.insert("cafe", { text: "cafe", display: "Highlands Coffee", type: "Brand", score: 0.94 });
  trie.insert("caf", { text: "caf", display: "Cà phê gần đây", type: "Category", score: 0.92 });
  
  const results = trie.search("cafe");
  assertEquals(results.length, 2);
  assertEquals(results[0].display, "Cà phê gần đây");  // highest score first
  assertEquals(results[1].display, "Highlands Coffee");
});

Deno.test("Trie: search prefix with no results returns empty", () => {
  const trie = new Trie();
  trie.insert("cafe", { text: "cafe", display: "Cà phê", type: "Category", score: 0.97 });
  
  const results = trie.search("xyz");
  assertEquals(results.length, 0);
});

Deno.test("Trie: insertTopK caps at 10 and keeps highest scores", () => {
  const trie = new Trie();
  for (let i = 0; i < 15; i++) {
    trie.insert("cafe", { text: `cafe-${i}`, display: `Suggestion ${i}`, type: "Category", score: 0.5 + i * 0.03 });
  }
  const results = trie.search("cafe");
  assertEquals(results.length, 10);
  assertEquals(results[0].score, 0.5 + 14 * 0.03); // highest score
  assertEquals(results[9].score, 0.5 + 5 * 0.03);  // 10th highest
});

Deno.test("Trie: empty prefix returns empty", () => {
  const trie = new Trie();
  trie.insert("cafe", { text: "cafe", display: "Cà phê", type: "Category", score: 0.97 });
  assertEquals(trie.search("").length, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
deno test -A src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts
```
Expected: FAIL — Trie not defined

- [ ] **Step 3: Implement Trie**

In `src/modules/track-4-autocomplete/track-4-autocomplete.trie.ts`:
```typescript
export interface Suggestion {
  text: string;
  display: string;
  type: string;
  score: number;
}

interface TrieNode {
  children: Map<string, TrieNode>;
  topK: Suggestion[];
}

const TOPK_CAP = 10;

function createNode(): TrieNode {
  return { children: new Map(), topK: [] };
}

function insertTopK(list: Suggestion[], item: Suggestion): void {
  const existing = list.findIndex((s) => s.text === item.text);
  if (existing !== -1) {
    if (item.score > list[existing].score) {
      list.splice(existing, 1);
    } else {
      return; // existing has higher or equal score, skip
    }
  }

  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid].score > item.score) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  list.splice(lo, 0, item);
  if (list.length > TOPK_CAP) list.pop();
}

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = createNode();
  }

  insert(prefix: string, suggestion: Suggestion): void {
    if (prefix.length === 0) return;
    let node = this.root;
    for (const ch of prefix) {
      let child = node.children.get(ch);
      if (!child) {
        child = createNode();
        node.children.set(ch, child);
      }
      node = child;
    }
    insertTopK(node.topK, suggestion);
  }

  search(prefix: string): Suggestion[] {
    if (prefix.length === 0) return [];
    let node = this.root;
    for (const ch of prefix) {
      const child = node.children.get(ch);
      if (!child) return [];
      node = child;
    }
    return [...node.topK];
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
deno test -A src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts
```
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/track-4-autocomplete/track-4-autocomplete.trie.ts src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts
git commit -m "feat(track-4): add Trie data structure with insert, exact search, topK"
```

---

### Task 2: Trie — Fuzzy Search (DFS over Trie)

**Files:**
- Modify: `src/modules/track-4-autocomplete/track-4-autocomplete.trie.ts`
- Modify: `src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts`

- [ ] **Step 1: Add failing fuzzy search tests**

Append to `track-4-autocomplete.trie.test.ts`:
```typescript
Deno.test("Trie fuzzy: typo correction (substitute)", () => {
  const trie = new Trie();
  trie.insert("nguyen hue", { text: "nguyen hue", display: "Nguyễn Huệ, Q1", type: "Address", score: 0.95 });
  trie.insert("nguyen trai", { text: "nguyen trai", display: "Nguyễn Trãi", type: "Street", score: 0.85 });

  const results1 = trie.searchFuzzy("nguyen huee", 1); // extra 'e' → delete
  assertEquals(results1.length > 0, true);
  assertEquals(results1[0].display, "Nguyễn Huệ, Q1");

  const results2 = trie.searchFuzzy("nguien hue", 1); // typo "ie" instead of "ye"
  assertEquals(results2.length > 0, true);
  assertEquals(results2[0].display, "Nguyễn Huệ, Q1");
});

Deno.test("Trie fuzzy: no match within edit distance returns empty", () => {
  const trie = new Trie();
  trie.insert("cafe", { text: "cafe", display: "Cà phê", type: "Category", score: 0.97 });

  const results = trie.searchFuzzy("xyz", 1);
  assertEquals(results.length, 0);
});

Deno.test("Trie fuzzy: exact match works (no edits needed)", () => {
  const trie = new Trie();
  trie.insert("cafe", { text: "cafe", display: "Cà phê", type: "Category", score: 0.97 });

  const results = trie.searchFuzzy("cafe", 1);
  assertEquals(results.length, 1);
  assertEquals(results[0].display, "Cà phê");
});

Deno.test("Trie fuzzy: insert edit (missing char)", () => {
  const trie = new Trie();
  trie.insert("nguyen", { text: "nguyen", display: "Nguyễn Huệ", type: "Address", score: 0.95 });

  const results = trie.searchFuzzy("nguen", 1); // missing 'y'
  assertEquals(results.length > 0, true);
  assertEquals(results[0].display, "Nguyễn Huệ");
});

Deno.test("Trie fuzzy: fuzzy results sorted by score", () => {
  const trie = new Trie();
  trie.insert("cafe", { text: "cafe", display: "Cà phê gần đây", type: "Category", score: 0.97 });
  trie.insert("cafe wifi", { text: "cafe wifi", display: "Cà phê có Wi-Fi", type: "Discovery", score: 0.85 });

  const results = trie.searchFuzzy("cafe wif", 1); // delete 'i'
  assertEquals(results.length, 2);
  assertEquals(results[0].score >= results[1].score, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
deno test -A src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts --filter "fuzzy"
```
Expected: FAIL — searchFuzzy not defined

- [ ] **Step 3: Implement fuzzy search in Trie**

Add to `track-4-autocomplete.trie.ts` (inside Trie class):
```typescript
searchFuzzy(prefix: string, maxEdits: number): Suggestion[] {
  if (prefix.length === 0) return [];
  const results = new Map<string, Suggestion>();
  this._fuzzyDfs(this.root, prefix, 0, 0, maxEdits, results);
  return [...results.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, TOPK_CAP);
}

private _fuzzyDfs(
  node: TrieNode,
  query: string,
  pos: number,
  edits: number,
  maxEdits: number,
  results: Map<string, Suggestion>,
): void {
  if (edits > maxEdits) return;

  if (pos >= query.length) {
    for (const s of node.topK) {
      const existing = results.get(s.text);
      if (!existing || s.score > existing.score) {
        results.set(s.text, s);
      }
    }
    return;
  }

  const ch = query[pos];

  // Match: follow matching child, advance query
  const matchChild = node.children.get(ch);
  if (matchChild) {
    this._fuzzyDfs(matchChild, query, pos + 1, edits, maxEdits, results);
  }

  if (edits < maxEdits) {
    // Delete: skip current query char, stay at same node
    this._fuzzyDfs(node, query, pos + 1, edits + 1, maxEdits, results);

    for (const [childCh, child] of node.children) {
      // Substitute: follow different child, advance query
      if (childCh !== ch) {
        this._fuzzyDfs(child, query, pos + 1, edits + 1, maxEdits, results);
      }
      // Insert: follow any child, don't advance query
      this._fuzzyDfs(child, query, pos, edits + 1, maxEdits, results);
    }
  }
}
```

- [ ] **Step 4: Run fuzzy tests to verify they pass**

```bash
deno test -A src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts --filter "fuzzy"
```
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/track-4-autocomplete/track-4-autocomplete.trie.ts src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts
git commit -m "feat(track-4): add Trie fuzzy search (DFS with edit distance)"
```

---

### Task 3: Trie — Serialize / Deserialize

**Files:**
- Modify: `src/modules/track-4-autocomplete/track-4-autocomplete.trie.ts`
- Modify: `src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts`

- [ ] **Step 1: Add failing serialize/deserialize tests**

Append to test file:
```typescript
Deno.test("Trie: serialize and deserialize preserves data", () => {
  const trie = new Trie();
  trie.insert("cafe", { text: "cafe", display: "Cà phê", type: "Category", score: 0.97 });
  trie.insert("cafe", { text: "cafe", display: "Highlands Coffee", type: "Brand", score: 0.94 });
  trie.insert("vin", { text: "vin", display: "Vincom Center", type: "Brand", score: 0.98 });

  const json = trie.toJSON();
  const restored = Trie.fromJSON(json);

  assertEquals(restored.search("cafe").length, 2);
  assertEquals(restored.search("cafe")[0].display, "Cà phê");
  assertEquals(restored.search("vin")[0].display, "Vincom Center");
  assertEquals(restored.search("xyz").length, 0);
});

Deno.test("Trie: serialized JSON is parseable string", () => {
  const trie = new Trie();
  trie.insert("a", { text: "a", display: "A", type: "Test", score: 0.5 });
  const json = trie.toJSON();
  const parsed = JSON.parse(json);
  assertEquals(typeof parsed.root, "object");
  assertEquals(typeof parsed.root.children, "object");
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
deno test -A src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts --filter "serialize"
```
Expected: FAIL — toJSON/fromJSON not defined

- [ ] **Step 3: Implement serialize/deserialize**

Add to Trie class:
```typescript
toJSON(): string {
  const serialize = (node: TrieNode): object => ({
    c: Object.fromEntries(
      [...node.children].map(([k, v]) => [k, serialize(v)]),
    ),
    k: node.topK,
  });
  return JSON.stringify({ root: serialize(this.root) });
}

static fromJSON(json: string): Trie {
  const data = JSON.parse(json);
  const trie = new Trie();

  const deserialize = (obj: Record<string, unknown>): TrieNode => {
    const node = createNode();
    if (Array.isArray(obj.k)) {
      node.topK = obj.k as Suggestion[];
    }
    if (obj.c && typeof obj.c === "object") {
      for (const [k, v] of Object.entries(obj.c as Record<string, Record<string, unknown>>)) {
        node.children.set(k, deserialize(v));
      }
    }
    return node;
  };

  trie.root = deserialize(data.root as Record<string, unknown>);
  return trie;
}
```

Update imports to make `createNode` accessible from static context (move outside class or make it accept node param):
```typescript
// Already top-level, no change needed
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
deno test -A src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts --filter "serialize"
```
Expected: 2 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/track-4-autocomplete/track-4-autocomplete.trie.ts src/modules/track-4-autocomplete/tests/track-4-autocomplete.trie.test.ts
git commit -m "feat(track-4): add Trie serialize/deserialize"
```

---

### Task 4: NLP Utils — Unit Tests

**Files:**
- Create: `src/modules/track-4-autocomplete/tests/track-4-autocomplete.nlp.test.ts`

- [ ] **Step 1: Write NLP unit tests**

```typescript
import { assertEquals } from "@std/assert";
import { stripAccents, normalize, generatePrefixes, expandAbbreviations, buildAbbreviationMap } from "../track-4-autocomplete.nlp.ts";

Deno.test("NLP: stripAccents removes Vietnamese diacritics", () => {
  assertEquals(stripAccents("Nguyễn Huệ"), "Nguyen Hue");
  assertEquals(stripAccents("Đà Nẵng"), "Da Nang");
  assertEquals(stripAccents("Cà Phê"), "Ca Phe");
  assertEquals(stripAccents("Hello"), "Hello");
});

Deno.test("NLP: normalize strips accents, lowercases, removes punctuation", () => {
  assertEquals(normalize("Nguyễn Huệ, Quận 1"), "nguyen hue quan 1");
  assertEquals(normalize("ATM Vietcombank"), "atm vietcombank");
  assertEquals(normalize("Cà Phê  24/7"), "ca phe 24 7");
});

Deno.test("NLP: normalize handles empty string", () => {
  assertEquals(normalize(""), "");
  assertEquals(normalize("  "), "");
});

Deno.test("NLP: generatePrefixes returns all prefixes >= 2 chars", () => {
  assertEquals(generatePrefixes("cafe"), ["ca", "caf", "cafe"]);
  assertEquals(generatePrefixes("abc", 3), ["abc"]);
  assertEquals(generatePrefixes("a"), []);
  assertEquals(generatePrefixes("nguyen hue"), ["ng", "ngu", "nguy", "nguye", "nguyen", "nguyen ", "nguyen h", "nguyen hu", "nguyen hue"]);
});

Deno.test("NLP: expandAbbreviations replaces abbreviations in text", () => {
  const map = new Map([["ks", "Khách sạn"], ["dn", "Đà Nẵng"]]);
  assertEquals(expandAbbreviations("ks dn", map), "Khách sạn Đà Nẵng");
  assertEquals(expandAbbreviations("cafe", map), "cafe"); // unknown word unchanged
  assertEquals(expandAbbreviations("", map), "");
});

Deno.test("NLP: buildAbbreviationMap constructs map from rows", () => {
  const rows = [
    { abbreviation: "q1", expandedForm: "Quận 1" },
    { abbreviation: "vcb", expandedForm: "Vietcombank" },
  ];
  const map = buildAbbreviationMap(rows);
  assertEquals(map.get("q1"), "Quận 1");
  assertEquals(map.get("vcb"), "Vietcombank");
  assertEquals(map.size, 2);
});
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
deno test -A src/modules/track-4-autocomplete/tests/track-4-autocomplete.nlp.test.ts
```
Expected: 6 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/modules/track-4-autocomplete/tests/track-4-autocomplete.nlp.test.ts
git commit -m "test(track-4): add NLP utils unit tests"
```

---

### Task 5: Scorer — Implementation + Tests

**Files:**
- Create: `src/modules/track-4-autocomplete/track-4-autocomplete.scorer.ts`
- Create: `src/modules/track-4-autocomplete/tests/track-4-autocomplete.scorer.test.ts`

- [ ] **Step 1: Write failing scorer tests**

```typescript
import { assertEquals, assertGreater } from "@std/assert";
import { scoreAutocomplete, scorePopularQuery, scorePOI, scoreTemplate } from "../track-4-autocomplete.scorer.ts";

Deno.test("Scorer: ground truth keeps original score", () => {
  const s = scoreAutocomplete(0.95, 6265, "cafe", 4, 4, false);
  assertEquals(s, 0.95);
});

Deno.test("Scorer: prefix variant decays score by prefix length ratio", () => {
  const full = scoreAutocomplete(0.95, 6265, "cafe", 4, 4, false);
  const prefix = scoreAutocomplete(0.95, 6265, "ca", 2, 4, false);
  assertGreater(full, prefix); // shorter prefix gets lower score
});

Deno.test("Scorer: generated data scores lower than ground truth", () => {
  const gt = scoreAutocomplete(0.95, 6265, "cafe", 4, 4, false);
  const gen = scoreAutocomplete(0.60, null, "cafe", 4, 4, true);
  assertGreater(gt, gen);
});

Deno.test("Scorer: popular query scores from frequency", () => {
  const s1 = scorePopularQuery(15000, false);
  const s2 = scorePopularQuery(5000, false);
  assertGreater(s1, s2);
});

Deno.test("Scorer: popular query generated scores lower", () => {
  const orig = scorePopularQuery(10000, false);
  const gen = scorePopularQuery(10000, true);
  assertGreater(orig, gen);
});

Deno.test("Scorer: POI name match uses popularity score", () => {
  const high = scorePOI(98, false);
  const low = scorePOI(50, false);
  assertGreater(high, low);
});

Deno.test("Scorer: template suggestion returns fixed range", () => {
  const s = scoreTemplate("category");
  assertEquals(s >= 0.40 && s <= 0.55, true);
});

Deno.test("Scorer: category-only entry returns 0.35", () => {
  const s = scoreTemplate("category_entry");
  assertEquals(s, 0.35);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
deno test -A src/modules/track-4-autocomplete/tests/track-4-autocomplete.scorer.test.ts
```
Expected: FAIL — functions not defined

- [ ] **Step 3: Implement scorer**

In `track-4-autocomplete.scorer.ts`:
```typescript
const MAX_FREQUENCY = 15000;

export function scoreAutocomplete(
  originalScore: number,
  queryFrequency: number | null,
  prefix: string,
  prefixLen: number,
  fullLen: number,
  isGenerated: boolean,
): number {
  if (!isGenerated && prefixLen >= fullLen) {
    return originalScore; // ground truth, full prefix match
  }
  if (!isGenerated) {
    // prefix variant of ground truth
    const ratio = prefixLen / fullLen;
    return originalScore * (0.85 + 0.15 * ratio);
  }
  // LLM-generated autocomplete entry
  const freqNorm = queryFrequency ? queryFrequency / MAX_FREQUENCY : 0.3;
  return freqNorm * 0.55;
}

export function scorePopularQuery(
  frequency: number,
  isGenerated: boolean,
): number {
  const freqNorm = Math.min(frequency / MAX_FREQUENCY, 1.0);
  return isGenerated ? freqNorm * 0.55 : freqNorm * 0.75;
}

export function scorePOI(
  popularityScore: number,
  isGenerated: boolean,
): number {
  const popNorm = popularityScore / 100;
  return isGenerated ? popNorm * 0.40 : popNorm;
}

export function scoreTemplate(
  templateType: string,
): number {
  switch (templateType) {
    case "brand_nearby": return 0.55;
    case "category_nearby": return 0.50;
    case "category_city": return 0.48;
    case "category_attribute": return 0.46;
    case "discovery": return 0.42;
    case "navigation": return 0.40;
    case "category_entry": return 0.35;
    default: return 0.40;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
deno test -A src/modules/track-4-autocomplete/tests/track-4-autocomplete.scorer.test.ts
```
Expected: 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/track-4-autocomplete/track-4-autocomplete.scorer.ts src/modules/track-4-autocomplete/tests/track-4-autocomplete.scorer.test.ts
git commit -m "feat(track-4): add multi-factor scorer for autocomplete pairs"
```

---

### Task 6: Repo — DB Read Queries

**Files:**
- Create: `src/modules/track-4-autocomplete/track-4-autocomplete.repo.ts`

- [ ] **Step 1: Implement repo**

```typescript
import { db } from "@/db/pool.ts";
import {
  track4AbbreviationTable,
  track4AutocompleteTable,
  track4PoiTable,
  track4PopularQueryTable,
} from "./track-4-autocomplete.schema.ts";
import { eq, sql } from "drizzle-orm";

export const track4Repo = {
  getAllAbbreviations() {
    return db
      .select({
        abbreviation: track4AbbreviationTable.abbreviation,
        expandedForm: track4AbbreviationTable.expandedForm,
        type: track4AbbreviationTable.type,
        isGenerated: track4AbbreviationTable.isGenerated,
      })
      .from(track4AbbreviationTable);
  },

  getAllAutocompleteEntries() {
    return db
      .select({
        id: track4AutocompleteTable.id,
        originalId: track4AutocompleteTable.originalId,
        inputPrefix: track4AutocompleteTable.inputPrefix,
        suggestionText: track4AutocompleteTable.suggestionText,
        suggestionType: track4AutocompleteTable.suggestionType,
        score: track4AutocompleteTable.score,
        queryFrequency: track4AutocompleteTable.queryFrequency,
        isGenerated: track4AutocompleteTable.isGenerated,
      })
      .from(track4AutocompleteTable);
  },

  getAllPois() {
    return db
      .select({
        id: track4PoiTable.id,
        originalId: track4PoiTable.originalId,
        poiName: track4PoiTable.poiName,
        category: track4PoiTable.category,
        brand: track4PoiTable.brand,
        city: track4PoiTable.city,
        latitude: track4PoiTable.latitude,
        longitude: track4PoiTable.longitude,
        popularityScore: track4PoiTable.popularityScore,
        tags: track4PoiTable.tags,
        isGenerated: track4PoiTable.isGenerated,
      })
      .from(track4PoiTable);
  },

  getAllPopularQueries() {
    return db
      .select({
        id: track4PopularQueryTable.id,
        originalId: track4PopularQueryTable.originalId,
        queryText: track4PopularQueryTable.queryText,
        intentType: track4PopularQueryTable.intentType,
        monthlyFrequency: track4PopularQueryTable.monthlyFrequency,
        region: track4PopularQueryTable.region,
        isGenerated: track4PopularQueryTable.isGenerated,
      })
      .from(track4PopularQueryTable);
  },

  async getPopularByRegion(region: string, limit = 10) {
    return db
      .select({
        queryText: track4PopularQueryTable.queryText,
        intentType: track4PopularQueryTable.intentType,
        monthlyFrequency: track4PopularQueryTable.monthlyFrequency,
        region: track4PopularQueryTable.region,
      })
      .from(track4PopularQueryTable)
      .where(
        sql`${track4PopularQueryTable.region} = ${region} OR ${track4PopularQueryTable.region} = 'Toàn quốc'`,
      )
      .orderBy(sql`${track4PopularQueryTable.monthlyFrequency} DESC`)
      .limit(limit);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/track-4-autocomplete/track-4-autocomplete.repo.ts
git commit -m "feat(track-4): add repo with DB read queries for 5 tables"
```

---

### Task 7: Builder — Build Pipeline

**Files:**
- Create: `src/modules/track-4-autocomplete/track-4-autocomplete.builder.ts`
- Create: `src/modules/track-4-autocomplete/tests/track-4-autocomplete.builder.test.ts`

- [ ] **Step 1: Write builder test (integration — needs DB)**

```typescript
import { assertEquals, assertGreater } from "@std/assert";
import { closePool } from "@/db/pool.ts";

Deno.test("Builder: build snapshot from DB data", async () => {
  const { buildSnapshot } = await import("../track-4-autocomplete.builder.ts");

  const snapshot = await buildSnapshot();
  assertGreater(snapshot.totalNodes, 0);
  assertGreater(snapshot.totalPairs, 0);
  assertEquals(typeof snapshot.trieJson, "string");
  assertEquals(snapshot.version, 1);
  assertEquals(typeof snapshot.buildTime, "string");

  closePool();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
deno test -A --env-file=.env.local src/modules/track-4-autocomplete/tests/track-4-autocomplete.builder.test.ts
```
Expected: FAIL — buildSnapshot not defined

- [ ] **Step 3: Implement builder**

In `track-4-autocomplete.builder.ts`:
```typescript
import { Trie } from "./track-4-autocomplete.trie.ts";
import { track4Repo } from "./track-4-autocomplete.repo.ts";
import { generatePrefixes, normalize, buildAbbreviationMap } from "./track-4-autocomplete.nlp.ts";
import { scoreAutocomplete, scorePopularQuery, scorePOI, scoreTemplate } from "./track-4-autocomplete.scorer.ts";
import { logger } from "@/configs/logger.ts";
import type { Suggestion } from "./track-4-autocomplete.trie.ts";

export interface BuildStats {
  version: number;
  buildTime: string;
  trieJson: string;
  totalNodes: number;
  totalPairs: number;
  sourceCounts: Record<string, number>;
}

export async function buildSnapshot(): Promise<BuildStats> {
  const trie = new Trie();
  const sourceCounts: Record<string, number> = {};
  let totalPairs = 0;

  // 1. Load abbreviations (for normalization, not Trie insertion)
  const abbreviations = await track4Repo.getAllAbbreviations();
  const abbrMap = buildAbbreviationMap(abbreviations);

  // 2. Insert autocomplete entries
  const acEntries = await track4Repo.getAllAutocompleteEntries();
  for (const entry of acEntries) {
    const normalized = normalize(entry.suggestionText);
    const prefixes = generatePrefixes(normalized, 2);
    for (const prefix of prefixes) {
      const score = scoreAutocomplete(
        Number(entry.score),
        entry.queryFrequency,
        prefix,
        prefix.length,
        normalized.length,
        entry.isGenerated,
      );
      trie.insert(prefix, {
        text: normalized,
        display: entry.suggestionText,
        type: entry.suggestionType,
        score,
      });
      totalPairs++;
      const src = `${entry.isGenerated ? "gen" : "orig"}_ac`;
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }
  }

  // 3. Insert POI-based suggestions
  const pois = await track4Repo.getAllPois();
  const categories = new Set<string>();
  const brands = new Set<string>();

  for (const poi of pois) {
    if (poi.category) categories.add(poi.category);
    if (poi.brand) brands.add(poi.brand);

    // POI name prefix match
    const poiName = poi.poiName;
    const normalizedName = normalize(poiName);
    const namePrefixes = generatePrefixes(normalizedName, 2);
    for (const prefix of namePrefixes) {
      const score = scorePOI(poi.popularityScore ?? 50, poi.isGenerated);
      trie.insert(prefix, {
        text: normalizedName,
        display: poiName,
        type: "POI Suggestion",
        score,
      });
      totalPairs++;
      sourceCounts.poi_name = (sourceCounts.poi_name || 0) + 1;
    }
  }

  // 4. Insert template-based suggestions (category × gần đây, brand × gần nhất)
  for (const cat of categories) {
    const catNorm = normalize(cat);
    const templates = [
      { suffix: " gan day", displaySuffix: " gần đây", scoreType: "category_nearby" },
      { suffix: "", displaySuffix: "", scoreType: "category_entry" },
    ];
    for (const tpl of templates) {
      const fullText = catNorm + tpl.suffix;
      const displayText = cat + tpl.displaySuffix;
      const prefixes = generatePrefixes(fullText, 2);
      const score = scoreTemplate(tpl.scoreType);
      for (const prefix of prefixes) {
        trie.insert(prefix, {
          text: fullText,
          display: displayText,
          type: "Category Search",
          score,
        });
        totalPairs++;
        sourceCounts.template_category = (sourceCounts.template_category || 0) + 1;
      }
    }
  }

  for (const brand of brands) {
    const brandNorm = normalize(brand);
    const fullText = brandNorm + " gan nhat";
    const displayText = brand + " gần nhất";
    const prefixes = generatePrefixes(fullText, 2);
    const score = scoreTemplate("brand_nearby");
    for (const prefix of prefixes) {
      trie.insert(prefix, {
        text: fullText,
        display: displayText,
        type: "Brand Search",
        score,
      });
      totalPairs++;
      sourceCounts.template_brand = (sourceCounts.template_brand || 0) + 1;
    }
  }

  // 5. Insert popular queries
  const popularQueries = await track4Repo.getAllPopularQueries();
  for (const pq of popularQueries) {
    const normalized = normalize(pq.queryText);
    const prefixes = generatePrefixes(normalized, 2);
    const score = scorePopularQuery(pq.monthlyFrequency, pq.isGenerated);
    for (const prefix of prefixes) {
      trie.insert(prefix, {
        text: normalized,
        display: pq.queryText,
        type: pq.intentType,
        score,
      });
      totalPairs++;
      const src = `${pq.isGenerated ? "gen" : "orig"}_pq`;
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }
  }

  const trieJson = trie.toJSON();

  // Compute node count from serialized JSON
  function countNodes(obj: Record<string, unknown>): number {
    let count = 1;
    const children = obj.c as Record<string, Record<string, unknown>> | undefined;
    if (children) {
      for (const child of Object.values(children)) {
        count += countNodes(child);
      }
    }
    return count;
  }
  const parsedRoot = JSON.parse(trieJson);
  const totalNodes = parsedRoot.root ? countNodes(parsedRoot.root as Record<string, unknown>) : 0;

  // Persist snapshot to disk
  const snapshotPath = "./src/modules/track-4-autocomplete/data/snapshot.json";
  const snapshot = {
    version: 1,
    buildTime: new Date().toISOString(),
    trieJson,
    totalNodes,
    totalPairs,
    sourceCounts,
  };
  await Deno.writeTextFile(snapshotPath, JSON.stringify(snapshot));

  logger.info({
    buildTime: snapshot.buildTime,
    totalNodes,
    totalPairs,
    sourceCounts,
  }, "Build complete, snapshot saved");

  return snapshot;
};
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
deno test -A --env-file=.env.local src/modules/track-4-autocomplete/tests/track-4-autocomplete.builder.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/track-4-autocomplete/track-4-autocomplete.builder.ts src/modules/track-4-autocomplete/tests/track-4-autocomplete.builder.test.ts
git commit -m "feat(track-4): add build pipeline (DB → score → Trie → snapshot)"
```

---

### Task 8: Engine — Runtime

**Files:**
- Create: `src/modules/track-4-autocomplete/track-4-autocomplete.engine.ts`

- [ ] **Step 1: Implement engine**

```typescript
import { Trie } from "./track-4-autocomplete.trie.ts";
import { normalize, expandAbbreviations, buildAbbreviationMap } from "./track-4-autocomplete.nlp.ts";
import { track4Repo } from "./track-4-autocomplete.repo.ts";
import { logger } from "@/configs/logger.ts";
import type { Suggestion } from "./track-4-autocomplete.trie.ts";
import type { BuildStats } from "./track-4-autocomplete.builder.ts";

export interface SuggestOptions {
  lat?: number;
  lng?: number;
  region?: string;
  limit?: number;
}

export interface SuggestResult {
  text: string;
  display: string;
  type: string;
  score: number;
}

export interface SuggestResponse {
  suggestions: SuggestResult[];
  latencyMs: number;
  source: "exact" | "fuzzy" | "popular" | "empty";
}

export const createAutocompleteEngine = () => {
  let trie: Trie | null = null;
  let popularQueries: Map<string, SuggestResult[]> = new Map();
  let abbreviationMap: Map<string, string> = new Map();

  async function load(snapshotOrStats?: BuildStats): Promise<void> {
    // Build abbreviation map
    const abbreviations = await track4Repo.getAllAbbreviations();
    abbreviationMap = buildAbbreviationMap(abbreviations);

    if (snapshotOrStats) {
      trie = Trie.fromJSON(snapshotOrStats.trieJson);
      logger.info("Engine loaded from build result");
    } else {
      // Try loading from file
      try {
        const fileContent = await Deno.readTextFile(
          "./src/modules/track-4-autocomplete/data/snapshot.json",
        );
        const data = JSON.parse(fileContent) as BuildStats;
        trie = Trie.fromJSON(data.trieJson);
        logger.info("Engine loaded from snapshot file");
      } catch {
        logger.warn("No snapshot file found, engine not loaded");
      }
    }

    // Build popular query cache by region
    const regions = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Toàn quốc"];
    for (const region of regions) {
      const queries = await track4Repo.getPopularByRegion(region, 10);
      popularQueries.set(region, queries.map((q) => ({
        text: normalize(q.queryText),
        display: q.queryText,
        type: q.intentType,
        score: q.monthlyFrequency / 15000,
      })));
    }
  }

  function getRegionForLatLng(lat: number, lng: number): string {
    // Simple bounding-box heuristic for Vietnamese cities
    if (lat > 10.65 && lat < 10.85 && lng > 106.55 && lng < 106.80) return "TP.HCM";
    if (lat > 20.95 && lat < 21.10 && lng > 105.75 && lng < 105.95) return "Hà Nội";
    if (lat > 16.00 && lat < 16.15 && lng > 108.15 && lng < 108.30) return "Đà Nẵng";
    return "Toàn quốc";
  }

  function suggest(input: string, options: SuggestOptions = {}): SuggestResponse {
    const t0 = performance.now();

    if (!trie) {
      return { suggestions: [], latencyMs: 0, source: "empty" };
    }

    const limit = options.limit ?? 10;

    // Minimum 2 chars for prefix search
    if (input.length < 2) {
      const region = options.region ?? "Toàn quốc";
      const popular = popularQueries.get(region) ?? popularQueries.get("Toàn quốc") ?? [];
      return {
        suggestions: popular.slice(0, limit),
        latencyMs: performance.now() - t0,
        source: "popular",
      };
    }

    // Normalize input
    let query = expandAbbreviations(input, abbreviationMap);
    query = normalize(query);

    // 1. Exact search
    const exact = trie.search(query);
    if (exact.length > 0) {
      return {
        suggestions: exact.slice(0, limit).map((s) => ({
          text: s.text,
          display: s.display,
          type: s.type,
          score: s.score,
        })),
        latencyMs: performance.now() - t0,
        source: "exact",
      };
    }

    // 2. Fuzzy search (edit distance 1)
    const fuzzy = trie.searchFuzzy(query, 1);
    if (fuzzy.length > 0) {
      return {
        suggestions: fuzzy.slice(0, limit).map((s) => ({
          text: s.text,
          display: s.display,
          type: s.type,
          score: s.score,
        })),
        latencyMs: performance.now() - t0,
        source: "fuzzy",
      };
    }

    // 3. Fallback to popular queries
    const region = options.region
      ?? (options.lat ? getRegionForLatLng(options.lat!, options.lng ?? 0) : "Toàn quốc");
    const popular = popularQueries.get(region) ?? popularQueries.get("Toàn quốc") ?? [];

    return {
      suggestions: popular.slice(0, limit),
      latencyMs: performance.now() - t0,
      source: "popular",
    };
  }

  return { load, suggest };
};

export const autocompleteEngine = createAutocompleteEngine();
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/track-4-autocomplete/track-4-autocomplete.engine.ts
git commit -m "feat(track-4): add runtime engine (load, suggest with 3-tier fallback)"
```

---

### Task 9: API Layer — DTO + Router + Controller + Service

**Files:**
- Modify: `src/modules/track-4-autocomplete/track-4-autocomplete.dto.ts`
- Create: `src/modules/track-4-autocomplete/track-4-autocomplete.controller.ts`
- Create: `src/modules/track-4-autocomplete/track-4-autocomplete.service.ts`
- Create: `src/modules/track-4-autocomplete/track-4-autocomplete.router.ts`
- Modify: `src/router.ts`

- [ ] **Step 1: Add suggest DTOs**

Append to `track-4-autocomplete.dto.ts`:
```typescript
export const SuggestRequestSchema = z.object({
  q: z.string().min(1).max(200),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type SuggestRequest = z.infer<typeof SuggestRequestSchema>;
```

- [ ] **Step 2: Create service**

In `track-4-autocomplete.service.ts`:
```typescript
import { autocompleteEngine } from "./track-4-autocomplete.engine.ts";
import { buildSnapshot } from "./track-4-autocomplete.builder.ts";
import { logger } from "@/configs/logger.ts";

export const track4Service = {
  async init() {
    try {
      const snapshot = await buildSnapshot();
      await autocompleteEngine.load(snapshot);
      logger.info("Track 4 engine initialized from fresh build");
    } catch (err) {
      logger.error(err, "Track 4 engine init failed");
    }
  },

  suggest(input: string, options?: { lat?: number; lng?: number; limit?: number }) {
    return autocompleteEngine.suggest(input, options);
  },
};
```

- [ ] **Step 3: Create controller**

In `track-4-autocomplete.controller.ts`:
```typescript
import type { Context } from "@hono/hono";
import { track4Service } from "./track-4-autocomplete.service.ts";
import type { SuggestRequest } from "./track-4-autocomplete.dto.ts";

export const track4Controller = {
  async suggest(c: Context) {
    const query = c.req.query() as SuggestRequest;
    const result = track4Service.suggest(query.q, {
      lat: query.lat,
      lng: query.lng,
      limit: query.limit,
    });
    return c.json(result);
  },
};
```

- [ ] **Step 4: Create router**

In `track-4-autocomplete.router.ts`:
```typescript
import { Hono } from "@hono/hono";
import { track4Controller } from "./track-4-autocomplete.controller.ts";
import { zValidator } from "@hono/zod-validator";
import { SuggestRequestSchema } from "./track-4-autocomplete.dto.ts";

const router = new Hono();

router.get("/suggest", zValidator("query", SuggestRequestSchema), (c) =>
  track4Controller.suggest(c)
);

export default router;
```

- [ ] **Step 5: Register router**

In `src/router.ts`, add import and register:
```typescript
import track4AutocompleteRouter from "@/modules/track-4-autocomplete/track-4-autocomplete.router.ts";

export const router = new Hono<AppEnv>()
  .route(`${prefix}/health`, healthRouter)
  .route(`${prefix}/api-keys`, apiKeyRouter)
  .route(`${prefix}/track-4`, track4AutocompleteRouter);
```

- [ ] **Step 6: Write API integration test**

In `src/modules/track-4-autocomplete/tests/track-4-autocomplete.api.test.ts`:
```typescript
import { setupTestApp } from "@/shared/utils/test/setup.ts";
import { assertEquals } from "@std/assert";

Deno.test("API: GET /api/v1/track-4/suggest returns suggestions", async () => {
  const app = setupTestApp();
  const res = await app.request("/api/v1/track-4/suggest?q=cafe");
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(typeof body.suggestions, "object");
  assertEquals(typeof body.latencyMs, "number");
  assertEquals(typeof body.source, "string");
});

Deno.test("API: GET /api/v1/track-4/suggest with short query returns popular", async () => {
  const app = setupTestApp();
  const res = await app.request("/api/v1/track-4/suggest?q=c");
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.source, "popular");
});

Deno.test("API: GET /api/v1/track-4/suggest validates limit", async () => {
  const app = setupTestApp();
  const res = await app.request("/api/v1/track-4/suggest?q=cafe&limit=30");
  assertEquals(res.status, 400);
});
```

- [ ] **Step 7: Run API tests**

```bash
deno test -A --env-file=.env.local src/modules/track-4-autocomplete/tests/track-4-autocomplete.api.test.ts
```

- [ ] **Step 8: Commit**

```bash
git add src/modules/track-4-autocomplete/track-4-autocomplete.dto.ts src/modules/track-4-autocomplete/track-4-autocomplete.controller.ts src/modules/track-4-autocomplete/track-4-autocomplete.service.ts src/modules/track-4-autocomplete/track-4-autocomplete.router.ts src/router.ts src/modules/track-4-autocomplete/tests/track-4-autocomplete.api.test.ts
git commit -m "feat(track-4): add API layer (router, controller, service, DTOs)"
```

---

### Task 10: Type Check + Lint + Format

- [ ] **Step 1: Type check**

```bash
deno check src/
```
Expected: zero errors

- [ ] **Step 2: Lint**

```bash
deno lint src/
```
Expected: zero errors

- [ ] **Step 3: Format**

```bash
deno fmt src/
```

- [ ] **Step 4: Run all tests**

```bash
deno test -A --env-file=.env.local src/modules/track-4-autocomplete/tests/
```
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(track-4): type check, lint, format — all green"
```
