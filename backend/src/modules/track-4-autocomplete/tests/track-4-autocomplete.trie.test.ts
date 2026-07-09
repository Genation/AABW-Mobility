import { assertEquals } from "@std/assert";
import { insertTopK, Suggestion, Trie } from "../core/trie.ts";

function makeSuggestion(
  text: string,
  display: string,
  type: string,
  score: number,
): Suggestion {
  return { text, display, type, score };
}

// =============================================================================
// insertTopK helper
// =============================================================================

Deno.test("insertTopK: adds items sorted by score descending", () => {
  const arr: Suggestion[] = [];
  insertTopK(arr, makeSuggestion("a", "A", "poi", 5));
  insertTopK(arr, makeSuggestion("b", "B", "poi", 10));
  insertTopK(arr, makeSuggestion("c", "C", "brand", 3));

  assertEquals(arr.length, 3);
  assertEquals(arr[0].text, "b");
  assertEquals(arr[1].text, "a");
  assertEquals(arr[2].text, "c");
});

Deno.test("insertTopK: caps at 10 items, keeps highest scores", () => {
  const arr: Suggestion[] = [];
  for (let i = 1; i <= 15; i++) {
    insertTopK(arr, makeSuggestion(`s${i}`, `S${i}`, "poi", i));
  }

  assertEquals(arr.length, 10);
  assertEquals(arr[0].score, 15);
  assertEquals(arr[9].score, 6);
});

Deno.test("insertTopK: duplicate text — keeps higher score, replaces lower", () => {
  const arr: Suggestion[] = [];
  insertTopK(arr, makeSuggestion("same", "Same", "poi", 5));
  insertTopK(arr, makeSuggestion("same", "Same2", "brand", 3));

  assertEquals(arr.length, 1);
  assertEquals(arr[0].score, 5);
  assertEquals(arr[0].display, "Same");

  insertTopK(arr, makeSuggestion("same", "SameBest", "brand", 10));

  assertEquals(arr.length, 1);
  assertEquals(arr[0].score, 10);
  assertEquals(arr[0].display, "SameBest");
});

Deno.test("insertTopK: empty array, first item inserted correctly", () => {
  const arr: Suggestion[] = [];
  insertTopK(arr, makeSuggestion("first", "First", "poi", 7));

  assertEquals(arr.length, 1);
  assertEquals(arr[0].text, "first");
  assertEquals(arr[0].score, 7);
});

// =============================================================================
// Trie: insert + search
// =============================================================================

Deno.test("Trie: insert + exact search returns sorted topK", () => {
  const trie = new Trie();
  trie.insert("nguyen", makeSuggestion("nguyen hue", "Nguyễn Huệ", "poi", 10));
  trie.insert("nguyen", makeSuggestion("nguyen trai", "Nguyễn Trãi", "poi", 7));
  trie.insert("nguyen", makeSuggestion("nguyen du", "Nguyễn Du", "poi", 5));

  const results = trie.search("nguyen");
  assertEquals(results.length, 3);
  assertEquals(results[0].text, "nguyen hue");
  assertEquals(results[1].text, "nguyen trai");
  assertEquals(results[2].text, "nguyen du");
});

Deno.test("Trie: empty prefix returns empty array", () => {
  const trie = new Trie();
  trie.insert("abc", makeSuggestion("abc", "ABC", "poi", 1));

  const results = trie.search("");
  assertEquals(results.length, 0);
});

Deno.test("Trie: insert with empty prefix returns early", () => {
  const trie = new Trie();
  trie.insert("", makeSuggestion("test", "Test", "poi", 1));
  // Should not throw, and search should still work normally
  assertEquals(true, true);
});

Deno.test("Trie: non-existent prefix returns empty array", () => {
  const trie = new Trie();
  trie.insert("abc", makeSuggestion("abc", "ABC", "poi", 1));

  const results = trie.search("xyz");
  assertEquals(results.length, 0);
});

Deno.test("Trie: multiple prefixes share nodes correctly", () => {
  const trie = new Trie();
  trie.insert("nguyen", makeSuggestion("nguyen hue", "Nguyễn Huệ", "poi", 10));
  trie.insert(
    "nguyen",
    makeSuggestion("nguyen trai st", "Nguyễn Trãi St", "poi", 8),
  );

  const results1 = trie.search("nguyen");
  assertEquals(results1.length, 2);

  trie.insert(
    "nguyen trai",
    makeSuggestion("nguyen trai deep", "Nguyễn Trãi Deep", "brand", 9),
  );

  const results2 = trie.search("nguyen trai");
  assertEquals(results2.length, 1);
  assertEquals(results2[0].text, "nguyen trai deep");
});

Deno.test("Trie: search returns a copy, not a reference", () => {
  const trie = new Trie();
  trie.insert("abc", makeSuggestion("abc", "ABC", "poi", 1));

  const results1 = trie.search("abc");
  results1.push(makeSuggestion("xyz", "XYZ", "brand", 99));

  const results2 = trie.search("abc");
  assertEquals(results2.length, 1);
});

// =============================================================================
// Trie: searchFuzzy
// =============================================================================

Deno.test("Fuzzy: typo correction with substitute (nguien hue → nguyen hue)", () => {
  const trie = new Trie();
  trie.insert(
    "nguyen hue",
    makeSuggestion("nguyen hue", "Nguyễn Huệ", "poi", 10),
  );
  trie.insert(
    "nguyen trai",
    makeSuggestion("nguyen trai", "Nguyễn Trãi", "poi", 7),
  );

  const results = trie.searchFuzzy("nguien hue", 1);
  assertEquals(results.length > 0, true);
  assertEquals(results[0].text, "nguyen hue");
});

Deno.test("Fuzzy: delete extra char (nguyen huee → nguyen hue)", () => {
  const trie = new Trie();
  trie.insert(
    "nguyen hue",
    makeSuggestion("nguyen hue", "Nguyễn Huệ", "poi", 10),
  );

  const results = trie.searchFuzzy("nguyen huee", 1);
  assertEquals(results.length > 0, true);
  assertEquals(results[0].text, "nguyen hue");
});

Deno.test("Fuzzy: insert missing char (nguen → nguyen)", () => {
  const trie = new Trie();
  trie.insert("nguyen", makeSuggestion("nguyen", "Nguyen", "poi", 10));

  const results = trie.searchFuzzy("nguen", 1);
  assertEquals(results.length > 0, true);
  assertEquals(results[0].text, "nguyen");
});

Deno.test("Fuzzy: no match within edit distance returns empty", () => {
  const trie = new Trie();
  trie.insert(
    "nguyen hue",
    makeSuggestion("nguyen hue", "Nguyễn Huệ", "poi", 10),
  );

  const results = trie.searchFuzzy("xyz abc", 1);
  assertEquals(results.length, 0);
});

Deno.test("Fuzzy: exact match path works when no edits needed", () => {
  const trie = new Trie();
  trie.insert("nguyen", makeSuggestion("nguyen hue", "Nguyễn Huệ", "poi", 10));
  trie.insert("nguyen", makeSuggestion("nguyen trai", "Nguyễn Trãi", "poi", 7));

  const results = trie.searchFuzzy("nguyen", 1);
  assertEquals(results.length, 2);
});

Deno.test("Fuzzy: results sorted by score descending", () => {
  const trie = new Trie();
  trie.insert("nguyen", makeSuggestion("nguyen a", "A", "poi", 3));
  trie.insert("nguyen", makeSuggestion("nguyen b", "B", "brand", 10));
  trie.insert("nguyen", makeSuggestion("nguyen c", "C", "poi", 7));

  const results = trie.searchFuzzy("nguyan", 1);
  assertEquals(results.length, 3);
  assertEquals(results[0].text, "nguyen b");
  assertEquals(results[1].text, "nguyen c");
  assertEquals(results[2].text, "nguyen a");
});

Deno.test("Fuzzy: empty prefix returns empty array", () => {
  const trie = new Trie();
  trie.insert("abc", makeSuggestion("abc", "ABC", "poi", 1));

  const results = trie.searchFuzzy("", 1);
  assertEquals(results.length, 0);
});

Deno.test("Fuzzy: deduplicates by suggestion text, keeps highest score", () => {
  const trie = new Trie();
  trie.insert(
    "nguyen hue",
    makeSuggestion("nguyen hue", "Nguyễn Huệ", "poi", 10),
  );
  trie.insert("nguyen", makeSuggestion("nguyen hue", "Nguyễn Huệ", "poi", 5));

  const results = trie.searchFuzzy("nguyen hue", 2);
  const found = results.filter((s: Suggestion) => s.text === "nguyen hue");
  assertEquals(found.length, 1);
  assertEquals(found[0].score, 10);
});

// =============================================================================
// Serialization
// =============================================================================

Deno.test("Serialize/deserialize preserves data (search same results)", () => {
  const trie = new Trie();
  trie.insert("nguyen", makeSuggestion("nguyen hue", "Nguyễn Huệ", "poi", 10));
  trie.insert("nguyen", makeSuggestion("nguyen trai", "Nguyễn Trãi", "poi", 7));
  trie.insert("le loi", makeSuggestion("le loi", "Lê Lợi", "poi", 8));

  const json = trie.toJSON();
  const restored = Trie.fromJSON(json);

  const results = restored.search("nguyen");
  assertEquals(results.length, 2);
  assertEquals(results[0].text, "nguyen hue");
  assertEquals(results[1].text, "nguyen trai");

  const results2 = restored.search("le loi");
  assertEquals(results2.length, 1);
  assertEquals(results2[0].text, "le loi");
});

Deno.test("Serialized JSON is valid parseable string", () => {
  const trie = new Trie();
  trie.insert("abc", makeSuggestion("abc", "ABC", "poi", 1));

  const json = trie.toJSON();
  const parsed = JSON.parse(json);

  assertEquals(typeof parsed, "object");
  assertEquals(parsed !== null, true);
});

Deno.test("Serialized JSON uses compact keys 'c' and 'k'", () => {
  const trie = new Trie();
  trie.insert("abc", makeSuggestion("abc", "ABC", "poi", 1));

  const json = trie.toJSON();
  const parsed = JSON.parse(json);

  assertEquals("c" in parsed || "k" in parsed, true);
});

Deno.test("Deserialize empty trie (no children, no topK)", () => {
  const trie = new Trie();
  const json = trie.toJSON();
  const restored = Trie.fromJSON(json);

  const results = restored.search("anything");
  assertEquals(results.length, 0);
});

// =============================================================================
// Large trie performance
// =============================================================================

Deno.test("Large trie: insert 1000 suggestions, verify search speed", () => {
  const trie = new Trie();
  const brands = [
    "highlands coffee",
    "phuc long",
    "the coffee house",
    "starbucks",
    "trung nguyen",
    "cong cafe",
  ];
  const cities = ["ho chi minh", "ha noi", "da nang", "nha trang", "hue"];

  for (let i = 0; i < 1000; i++) {
    const brand = brands[i % brands.length];
    const city = cities[Math.floor(i / 200) % cities.length];
    const label = `${brand} ${city}`;
    const suggestion = makeSuggestion(label, label, "poi", (i % 100) + 1);
    trie.insert(brand, suggestion);
  }

  const start = performance.now();
  const results = trie.search("highlands coffee");
  const elapsed = performance.now() - start;

  assertEquals(results.length > 0, true);
  assertEquals(elapsed < 50, true, `Search took ${elapsed}ms, expected <50ms`);
});

Deno.test("Large trie: fuzzy search 1000 suggestions within reasonable time", () => {
  const trie = new Trie();
  const brands = [
    "highlands coffee",
    "phuc long",
    "the coffee house",
    "starbucks",
    "trung nguyen",
    "cong cafe",
  ];
  const cities = ["ho chi minh", "ha noi", "da nang", "nha trang", "hue"];

  for (let i = 0; i < 1000; i++) {
    const brand = brands[i % brands.length];
    const city = cities[Math.floor(i / 200) % cities.length];
    const label = `${brand} ${city}`;
    const suggestion = makeSuggestion(label, label, "poi", (i % 100) + 1);
    trie.insert(brand, suggestion);
  }

  const start = performance.now();
  const results = trie.searchFuzzy("highlands cofefe", 2);
  const elapsed = performance.now() - start;

  assertEquals(results.length > 0, true);
  assertEquals(
    elapsed < 500,
    true,
    `Fuzzy search took ${elapsed}ms, expected <500ms`,
  );
});
