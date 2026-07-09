import { track4Repo } from "@/modules/track-4-autocomplete/repo/repo.ts";
import { logger } from "@/configs/logger.ts";
import type { Trie } from "@/modules/track-4-autocomplete/core/trie.ts";
import { pipeline, env } from "npm:@huggingface/transformers@3.5.0";

export interface IndexerConfig {
  batchSize: number;
}

const DEFAULT_CONFIG: IndexerConfig = {
  batchSize: 64,
};

/**
 * Index suggestion texts into pgvector embeddings table.
 * Uses batched ONNX inference for performance.
 */
export async function indexEmbeddings(
  trie: Trie,
  config: IndexerConfig = DEFAULT_CONFIG,
): Promise<number> {
  env.backends.onnx.wasm!.numThreads = 1;
  env.useBrowserCache = false;
  env.useFSCache = false;

  logger.info("Loading embedding model for indexing...");
  const extractor = await pipeline(
    "feature-extraction",
    "intfloat/multilingual-e5-small",
  );

  const suggestions = trie.getAllSuggestions();
  logger.info(
    `Collected ${suggestions.length} unique suggestions for embedding`,
  );

  if (suggestions.length === 0) return 0;

  logger.info("Clearing existing embeddings...");
  await track4Repo.clearAllEmbeddings();

  const B = config.batchSize;
  const total = suggestions.length;

  for (let i = 0; i < total; i += B) {
    const batch = suggestions.slice(i, i + B);
    const texts = batch.map((s: { display: string }) => s.display);

    // Batch inference via pipeline (much faster than per-text)
    const output = await extractor(texts, {
      pooling: "mean",
      normalize: true,
    });

    // output is [batch_size, dim] tensor → split into per-row vectors
    const rows: { displayText: string; queryType: string; embedding: number[] }[] = [];
    for (let j = 0; j < batch.length; j++) {
      const start = j * 384;
      const vec = Array.from(
        (output.data as Float32Array).slice(start, start + 384),
      );
      rows.push({
        displayText: batch[j].display,
        queryType: batch[j].type,
        embedding: vec,
      });
    }

    await track4Repo.insertEmbeddingBatch(rows);

    if ((i + B) % (B * 10) === 0 || i + B >= total) {
      logger.info(
        `Embedded ${Math.min(i + B, total)}/${total} texts`,
      );
    }
  }

  logger.info(`Embedding indexing complete: ${total} vectors stored`);
  return total;
}
