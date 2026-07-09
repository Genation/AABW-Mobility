import { db } from "@/db/pool.ts";
import { sql } from "drizzle-orm";

await db.execute(sql`
  INSERT INTO track_4_abbreviations (abbreviation, expanded_form, type, is_generated)
  VALUES ('bk', 'Bách Khoa', 'category', true)
  ON CONFLICT DO NOTHING
`);

// Verify
import { buildAbbreviationMap } from "../core/nlp.ts";
import { track4Repo } from "../repo/repo.ts";
const abbrs = await track4Repo.getAllAbbreviations();
const map = buildAbbreviationMap(abbrs);
console.log('bk →', map.get('bk'));

import { closePool } from "@/db/pool.ts";
await closePool();
Deno.exit(0);
