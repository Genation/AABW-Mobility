/**
 * Standalone snapshot build script.
 *
 * Rebuilds the Trie from the current DB (POIs, autocomplete pairs,
 * abbreviations, popular queries) and writes it to data/snapshot.json.
 * The running engine loads that file directly on startup (engine.ts),
 * so this must be re-run whenever builder.ts's suggestion shape changes
 * (e.g. new fields threaded through) or the underlying POI/autocomplete
 * data changes.
 *
 * Usage: deno run --env-file=.env.local -A src/modules/track-4-autocomplete/eval/build-snapshot.ts
 */

import { buildSnapshot } from "../builder/builder.ts";
import { logger } from "@/configs/logger.ts";

const SNAPSHOT_PATH = "./src/modules/track-4-autocomplete/data/snapshot.json";

const stats = await buildSnapshot();

await Deno.writeTextFile(
  SNAPSHOT_PATH,
  JSON.stringify({
    version: stats.version,
    buildTime: stats.buildTime,
    trieJson: stats.trieJson,
    totalNodes: stats.totalNodes,
    totalPairs: stats.totalPairs,
    sourceCounts: stats.sourceCounts,
  }),
);

logger.info(
  `Snapshot written to ${SNAPSHOT_PATH} — ${stats.totalNodes} nodes, ${stats.totalPairs} pairs`,
);
