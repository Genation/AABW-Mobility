/**
 * Standalone embedding index build script.
 *
 * Runs after the Trie snapshot has been built.
 * Loads the Trie from snapshot, embeds all unique texts, stores in pgvector.
 *
 * Usage: deno run --env-file=.env.local -A src/modules/track-4-autocomplete/eval/build-embeddings.ts
 */

import { Trie } from "../core/trie.ts";
import { track4Repo } from "../repo/repo.ts";
import { logger } from "@/configs/logger.ts";
import { pipeline, env } from "npm:@huggingface/transformers@3.5.0";
import postgres from "postgres";
import { env as appEnv } from "@/configs/env.ts";

env.backends.onnx.wasm!.numThreads = 1;
env.useBrowserCache = false;
env.useFSCache = false;

const BATCH = 32;
const MODEL = "intfloat/multilingual-e5-small";
const SNAPSHOT_PATH = "./src/modules/track-4-autocomplete/data/snapshot.json";

// Load Trie from snapshot
const raw = await Deno.readTextFile(SNAPSHOT_PATH);
const data = JSON.parse(raw);
const trie = Trie.fromJSON(data.trieJson);
logger.info(`Loaded Trie with ${trie.getAllSuggestions().length} unique suggestions`);

// Load embedding model
logger.info(`Loading ${MODEL}...`);
const extractor = await pipeline("feature-extraction", MODEL);

// Collect unique suggestions
const suggestions = trie.getAllSuggestions();
logger.info(`Collected ${suggestions.length} texts to embed`);

// Connect to PG directly for fast bulk insert
const pool = postgres(appEnv.DATABASE_URL as string, { max: 1 });
try {
  // Check if we already have data (resume support)
  const countResult = await pool`SELECT count(*) as c FROM track_4_suggestion_embeddings`;
  const existing = Number(countResult[0].c);
  if (existing > 0 && existing < suggestions.length) {
    logger.info(`Resuming: ${existing}/${suggestions.length} already embedded`);
  } else if (existing >= suggestions.length) {
    logger.info("Embedding index already complete, skipping");
    await pool.end();
    Deno.exit(0);
  } else {
    // Clear only on fresh start
    await pool`DELETE FROM track_4_suggestion_embeddings`;
    logger.info("Cleared existing embeddings");
  }

  // Embed + insert in batches
  const startIdx = existing;
  let inserted = existing;
  for (let i = startIdx; i < suggestions.length; i += BATCH) {
    const batch = suggestions.slice(i, i + BATCH);
    const texts = batch.map((s) => s.display);

    // Batch inference
    const output = await extractor(texts, {
      pooling: "mean",
      normalize: true,
    });
    const arr = output.data as Float32Array;

    // Build multi-row insert
    let sql = "INSERT INTO track_4_suggestion_embeddings (display_text, query_type, embedding) VALUES ";
    const vals: string[] = [];
    const params: unknown[] = [];
    for (let j = 0; j < batch.length; j++) {
      const start = j * 384;
      const vec = Array.from(arr.slice(start, start + 384));
      const pi = params.length + 1;
      vals.push(`($${pi}, $${pi + 1}, $${pi + 2}::vector)`);
      params.push(batch[j].display, batch[j].type, JSON.stringify(vec));
    }

    sql += vals.join(", ");
    await pool.unsafe(sql, params);

    inserted += batch.length;
    if (inserted % (BATCH * 20) === 0 || inserted >= suggestions.length) {
      logger.info(`Embedded ${inserted}/${suggestions.length}`);
    }
  }

  // Build IVFFlat index
  logger.info("Building IVFFlat index...");
  await pool`
    CREATE INDEX IF NOT EXISTS idx_track_4_embedding_cosine
    ON "track_4_suggestion_embeddings"
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100)
  `;

  logger.info(`Done: ${inserted} embeddings indexed`);
} finally {
  await pool.end();
}

Deno.exit(0);
