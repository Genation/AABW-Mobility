/**
 * Embedding Fallback Layer — Implementation Spec
 *
 * Goal: When Trie (exact + fuzzy) returns 0 results, fall back to
 * embedding cosine similarity search over pre-computed suggestion vectors.
 *
 * Current baseline: MRR 0.882, Success 95.0%, 3 failures (all solved by embedding)
 * Target: MRR > 0.95, Success > 96%, 0 remaining failures
 */

=============================================================================
PHASE 1 — Schema & Infrastructure
=============================================================================

1.1 Enable pgvector

  CREATE EXTENSION IF NOT EXISTS vector;

  → New migration file: drizzle/0008_enable-pgvector.sql

1.2 Table: track_4_suggestion_embeddings

  CREATE TABLE IF NOT EXISTS "track_4_suggestion_embeddings" (
    "id"           SERIAL PRIMARY KEY,
    "display_text" TEXT      NOT NULL,
    "query_type"   TEXT      DEFAULT 'Discovery Search',
    "embedding"    VECTOR(384) NOT NULL,
    "created_at"   TIMESTAMP DEFAULT NOW()
  );

  → Drizzle schema: track-4-autocomplete.schema.ts, add table definition
  → Index: IVFFlat (cosine distance) — build after data is populated

  CREATE INDEX ON "track_4_suggestion_embeddings"
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

  Note: IVFFlat needs approximate amount of rows (lists × 10 ≈ 1000)
  → Run ANALYZE after populating to update statistics

1.3 Configuration

  Add to env.ts:
    EMBEDDING_MODEL: string   // default "intfloat/multilingual-e5-small"
    EMBEDDING_DIM: number     // 384 for e5-small, 1024 for F2LLM-v2

  Note: The model lives on HF. First run downloads ~118MB ONNX + tokenizer
  to Deno's cache. The Deno cache issue can be worked around by setting
  `env.localModelPath` and manually placing the files.

=============================================================================
PHASE 2 — Offline Indexing (Build-time)
=============================================================================

2.1 When does it run?

  Builder runs: deno task build  (or: deno test builder.test.ts)
  After Trie snapshot is built, call: await indexEmbeddings(trie, idx)

2.2 What gets embedded?

  Collect ALL unique display texts from the Trie:
  - POI names (from poi_name source)
  - POI city variants (poi_city)
  - Autocomplete entries (ac, ac_suggestion)
  - Popular queries (pq_original, pq_generated)
  - Template outputs (tpl_* — all template sections)
  - Semantic pairs (tpl_semantic)

  Deduplication: by display_text (case-insensitive, accent-folded)
  → Expected: ~8K–12K unique texts

2.3 Batching

  Embed in batches of 64 texts:
    for each batch:
      1. Call embeddingService.embedBatch(texts)
      2. Collect { display_text, vector, query_type }
      3. UPSERT into track_4_suggestion_embeddings

  Batch size 64 balances:
  - ONNX runtime memory (384-dim × 64 × 4 bytes = 96KB per batch)
  - Latency (~2–3s per batch on CPU)

2.4 Build-time flow

  builder.ts:buildSnapshot(...) {
    // ... existing code builds Trie via InvertedIndex ...

    // NEW: Embedding indexing (after serialization)
    if (ENABLE_EMBEDDING_INDEX) {
      logger.info("Indexing embeddings...");

      // 1. Load embedding model (first time: download ~118MB ONNX)
      await embeddingService.load();

      // 2. Collect unique display texts
      const texts = collectUniqueDisplayTexts(trie, idx);
      // ~8K–12K texts

      // 3. Clear existing embeddings (idempotent rebuild)
      await track4Repo.clearAllEmbeddings();

      // 4. Embed + insert in batches
      const BATCH = 64;
      for (let i = 0; i < texts.length; i += BATCH) {
        const batch = texts.slice(i, i + BATCH);
        const vectors = await embeddingService.embedBatch(batch);
        await track4Repo.insertEmbeddings(
          batch.map((text, j) => ({
            displayText: text.display,
            queryType: text.type,
            embedding: vectors[j].vector,
          }))
        );
        logger.info(`Embedded ${Math.min(i + BATCH, texts.length)}/${texts.length}`);
      }

      // 5. Build IVFFlat index (first time only)
      await track4Repo.ensureEmbeddingIndex();

      logger.info("Embedding indexing complete.");
    }
  }

=============================================================================
PHASE 3 — Runtime Fallback (Engine)
=============================================================================

3.1 Flow

  engine.ts:suggest(input, options) {
    // ... existing: coordinate, address, strategies, Trie ...

    if (candidates.length > 0 || fuzzy.length > 0) {
      // EXISTING: return ranked results
      return { ... };
    }

    // --- NEW: Embedding Fallback ---
    // Only reached when Trie exact + fuzzy = 0 results AND not popular
    if (input.length >= 2) {
      try {
        // 1. Embed user query (cache: LRU, TTL 30min)
        const queryVec = await getEmbeddingFor(input);

        // 2. pgvector cosine search: top-15
        const rows = await track4Repo.searchSimilar(queryVec, 15);

        // 3. Convert to candidates
        if (rows.length > 0) {
          const embedded = rows.map(r => ({
            text: normalize(r.displayText),
            display: r.displayText,
            type: r.queryType ?? "Discovery Search",
            score: r.similarity * 0.50, // Cosine → score (cap at 0.50)
          }));

          const ranked = rank([{ suggestions: embedded, source: "embedding" }], limit);
          return { suggestions: ranked, latencyMs: performance.now() - t0, source: "embedding" };
        }
      } catch (e) {
        logger.warn(e, "Embedding fallback failed, falling through to popular");
      }
    }

    // --- Popular fallback (existing, unchanged) ---
    return { suggestions: popular.slice(0, limit), ... };
  }

3.2 Query embedding cache

  Query embeddings are idempotent (same text → same vector).
  Cache in a simple Map<string, number[]> with LRU eviction.

  function getEmbeddingFor(text: string): Promise<number[]> {
    const cached = embeddingCache.get(normalize(text));
    if (cached) return cached;
    const vec = embeddingService.embed(text);
    embeddingCache.set(normalize(text), vec);
    return vec;
  }

  Cache limit: 1000 entries (at 384-dim × 4 bytes = ~1.5KB each → ~1.5MB total)

3.3 Source label changes in ranker

  Add to SOURCE_BOOST:
    "embedding": 0.70

  Add to suggest response typing:
    source: "exact" | "fuzzy" | "embedding" | "popular" | "empty"

3.4 Latency budget

  Typical case (95% success — Trie never fails):
    Avg: 0.07ms (unchanged)

  Embedding fallback (3/60 cases):
    ONNX inference: ~10–20ms
    pgvector search: ~2–5ms
    Total: ~15–25ms

  This is acceptable for a fallback path.

=============================================================================
PHASE 4 — Repo Layer
=============================================================================

4.1 track4Repo additions

  clearAllEmbeddings(): Promise<void>
    → DELETE FROM track_4_suggestion_embeddings

  insertEmbeddings(rows: { displayText, queryType, embedding }[]): Promise<void>
    → INSERT INTO track_4_suggestion_embeddings (display_text, query_type, embedding)
      VALUES ($1, $2, $3)
    → Use batch INSERT with UNNEST for performance

  ensureEmbeddingIndex(): Promise<void>
    → CREATE INDEX IF NOT EXISTS ... ON track_4_suggestion_embeddings
      USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)

  searchSimilar(queryVec: number[], limit: number): Promise<{
    displayText: string;
    queryType: string;
    similarity: number;
  }[]>
    → SELECT display_text, query_type,
        1 - (embedding <=> $1::vector) AS similarity
      FROM track_4_suggestion_embeddings
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    → Note: <=> is cosine distance operator. similarity = 1 - distance.

=============================================================================
PHASE 5 — Deno Cache Workaround
=============================================================================

5.1 Problem
  Transformers.js + Deno Cache API has a known bug where `Cache.match()`
  fails with `Invalid URL: 'undefined'` on subsequent runs. Model loads
  correctly the first time, fails thereafter.

5.2 Solution: Local model files

  a) Download model files once manually (or via script):
     $ mkdir -p data/models/multilingual-e5-small
     $ huggingface-cli download intfloat/multilingual-e5-small --local-dir data/models/multilingual-e5-small

  b) Configure env:
     import { env } from "npm:@huggingface/transformers@3.5.0";
     env.allowLocalModels = true;
     env.localModelPath = "./data/models/";

  c) Fallback: if local model not found, use env.allowRemoteModels = true
     with --allow-net to download (works first time, may fail later)

=============================================================================
PHASE 6 — Verification
=============================================================================

6.1 Unit test (existing, works once cache is fixed)
  deno test src/intenals/embedding/embedding.unit.test.ts
  → 7 tests pass: model load, embed, cosine, semantic, cross-lingual, retrieval

6.2 Integration test
  deno test src/modules/track-4-autocomplete/tests/track-4-autocomplete.embedding.test.ts
  → Build snapshot with embedding index
  → Verify Trie + embedding fallback for 3 failing cases

6.3 Eval
  deno run src/modules/track-4-autocomplete/eval/eval.ts
  → Target: MRR > 0.95, Success > 96%, 0 failures
  → Embedding source: 3 cases, all with rank 1–3

=============================================================================
// Files to create/modify
=============================================================================

NEW:
  src/intenals/embedding/
    embedding.service.ts   ← Already exists ✓
    embedding.unit.test.ts ← Already exists ✓
    embedding.indexer.ts   ← Build-time indexing (extracted from builder)

MODIFY:
  src/modules/track-4-autocomplete/
    engine/engine.ts       ← Add embedding fallback block
    engine/classifier.ts   ← No changes needed
    builder/builder.ts     ← Add embedding indexing step after Trie build
    repo/repo.ts           ← Add embedding CRUD methods
    schema/schema.ts       ← Add track_4_suggestion_embeddings table
    core/ranker.ts         ← Add "embedding" to SOURCE_BOOST
    eval/eval.ts           ← Display "embedding" in match source stats

DB:
  drizzle/0008_add-embedding.sql  ← pgvector extension + table + index
  drizzle/0009_enable-pgvector.sql ← Maybe separate migration for extension

=============================================================================
