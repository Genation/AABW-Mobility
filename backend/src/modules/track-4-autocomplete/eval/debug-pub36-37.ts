import { autocompleteEngine } from "../engine/engine.ts";
import { generateStrategies } from "../engine/classifier.ts";
import { buildAbbreviationMap } from "../core/nlp.ts";
import { track4Repo } from "../repo/repo.ts";

let att=0;
while(!autocompleteEngine.getStats().loaded && att<100){await new Promise(r=>setTimeout(r,100));att++}

const abbrs = await track4Repo.getAllAbbreviations();
const map = buildAbbreviationMap(abbrs);
console.log('bk->', map.get('bk'));
console.log('dh->', map.get('dh'));

console.log('\n--- PUB036: dh bk ---');
const strs1 = generateStrategies('dh bk', map);
for(const s of strs1) {
  console.log('Strategy:', s.type, 'forms:', s.forms);
  for(const f of s.forms){
    const r = autocompleteEngine.suggest(f, {limit:5});
    console.log('  form "'+f+'" ->', r.suggestions.length, 'results, source:', r.source);
    for(const sr of r.suggestions) console.log('    '+sr.display+' ('+sr.score+')');
  }
}

console.log('\n--- PUB037: phuc long ---');
const strs2 = generateStrategies('phuc long', map);
for(const s of strs2) {
  console.log('Strategy:', s.type, 'forms:', s.forms);
  for(const f of s.forms){
    const r = autocompleteEngine.suggest(f, {limit:10});
    console.log('  form "'+f+'" ->', r.suggestions.length, 'results, source:', r.source);
    for(const sr of r.suggestions) console.log('    '+sr.display+' ('+sr.type+', score='+sr.score+')');
  }
}

Deno.exit(0);
