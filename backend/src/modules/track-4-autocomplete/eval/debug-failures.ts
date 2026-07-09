import { autocompleteEngine } from "../engine/engine.ts";
import { track4Repo } from "../repo/repo.ts";
import { normalize } from "../core/nlp.ts";

const FAILING_CASES = [
  "PUB036", "PUB037",
];

async function debug() {
  // Wait for engine to load
  let attempts = 0;
  while (!autocompleteEngine.getStats().loaded && attempts < 100) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }
  console.log(`Engine loaded: ${autocompleteEngine.getStats().loaded}`);

  const cases = await track4Repo.getAllEvaluations();
  const failing = cases.filter(c => FAILING_CASES.includes(c.originalId));

  for (const tc of failing) {
    const input = tc.inputPrefix;
    const expected = tc.expectedTopSuggestions ?? [];
    const result = autocompleteEngine.suggest(input, { limit: 10 });

    console.log(`\n=== ${tc.originalId} | "${input}" | ${tc.difficulty} | type: ${tc.expectedSuggestionType} ===`);
    console.log(`Expected: [${expected.join("; ")}]`);
    console.log(`Engine source: ${result.source}`);
    console.log(`Found (${result.suggestions.length}):`);
    for (const s of result.suggestions) {
      const d = normalize(s.display);
      const eList = expected.map(x => normalize(x));
      const matches = eList.filter(e => d.includes(e) || e.includes(d) || e.split(" ").filter(w => d.split(" ").includes(w)).length >= Math.ceil(e.split(" ").length * 0.6));
      const status = matches.length > 0 ? "✓" : "✗";
      console.log(`  ${status} "${s.display}" (type=${s.type}, score=${s.score})`);
    }

    if (result.suggestions.length === 0) {
      console.log("  NO RESULTS FOUND");
    } else {
      // Check if any match
      let anyMatch = false;
      for (const s of result.suggestions) {
        const d = normalize(s.display);
        for (const e of expected) {
          const en = normalize(e);
          const dWords = new Set(d.split(" "));
          const eWords = en.split(" ");
          const overlap = eWords.filter(w => dWords.has(w)).length;
          if (d === en || d.includes(en) || en.includes(d) || overlap >= Math.max(1, Math.ceil(eWords.length * 0.6))) {
            anyMatch = true;
          }
        }
      }
      if (!anyMatch) {
        console.log("  >> No suggestion matched any expected. GAP ANALYSIS:");
        // Check if expected texts exist in Trie at all
        for (const e of expected) {
          const en = normalize(e);
          // Check various prefix forms
          for (let i = 2; i <= Math.min(en.length, 10); i++) {
            const p = en.slice(0, i);
            const r = autocompleteEngine.suggest(p, { limit: 1 });
            if (r.suggestions.length > 0) {
              const foundDisplay = normalize(r.suggestions[0].display);
              if (foundDisplay.includes(en.slice(0, Math.min(en.length, foundDisplay.length)))) {
                console.log(`    Expected "${e}" reachable via prefix "${p}" → "${r.suggestions[0].display}"`);
                break;
              }
            }
          }
        }
      }
    }
  }
}

debug().then(() => Deno.exit(0));
