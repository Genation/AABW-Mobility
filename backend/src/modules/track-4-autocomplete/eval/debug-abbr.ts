import { track4Repo } from "../repo/repo.ts";

const abbrs = await track4Repo.getAllAbbreviations();
const bkEntries = abbrs.filter(r => r.abbreviation.toLowerCase() === 'bk');
console.log('All bk entries:');
for (const e of bkEntries) {
  console.log(`  bk → "${e.expandedForm}" (type=${e.type}, isGenerated=${e.isGenerated})`);
}

// Also check the buildAbbreviationMap priority
import { buildAbbreviationMap } from "../core/nlp.ts";
const map = buildAbbreviationMap(abbrs);
console.log('\nbuildAbbreviationMap result for bk:', map.get('bk'));

Deno.exit(0);
