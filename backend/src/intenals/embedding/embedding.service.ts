/**
 * Embedding Service — Factory pattern, stateless.
 *
 * Wraps Transformers.js for text embedding inference.
 * Supports both tiny (23MB English) and multilingual (multilingual-e5-small, 118MB) models.
 *
 * Usage:
 *   const embedSvc = await createEmbeddingService();
 *   const vec = await embedSvc.embed("quán cà phê gần đây");
 *   const sim = embedSvc.cosineSimilarity(vecA, vecB);
 */

import { pipeline, env, type FeatureExtractionPipeline } from "npm:@huggingface/transformers@3.5.0";

env.backends.onnx.wasm!.numThreads = 1;

// Bypass Deno Cache API (known bug with Transformers.js URL construction)
env.useBrowserCache = false;
env.useFSCache = false;

// Try local models first, fallback to HF remote
const MODEL_DIR = "./data/models/multilingual-e5-small";
let useLocal = false;
try {
  await Deno.stat(MODEL_DIR);
  env.allowLocalModels = true;
  env.localModelPath = "./data/models/";
  useLocal = true;
} catch {
  env.allowLocalModels = false;
}

export interface EmbeddingResult {
  vector: number[];
  dim: number;
}

export interface EmbeddingDeps {
  model?: string;
}

const DEFAULT_MODEL = "intfloat/multilingual-e5-small";

export const createEmbeddingService = (deps?: EmbeddingDeps) => {
  const modelName = deps?.model ?? DEFAULT_MODEL;
  let extractor: FeatureExtractionPipeline | null = null;

  async function load(): Promise<void> {
    if (extractor) return;
    extractor = await pipeline("feature-extraction", modelName, {
      revision: "main",
    });
  }

  async function embed(text: string): Promise<EmbeddingResult> {
    if (!extractor) await load();
    const output = await extractor!(text, {
      pooling: "mean",
      normalize: true,
    });
    const arr = Array.from(output.data as Float32Array);
    return { vector: arr, dim: arr.length };
  }

  async function embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    if (!extractor) await load();
    const results: EmbeddingResult[] = [];
    for (const text of texts) {
      results.push(await embed(text));
    }
    return results;
  }

  function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  function isLoaded(): boolean {
    return extractor !== null;
  }

  async function unload(): Promise<void> {
    if (extractor && typeof (extractor as unknown as { dispose?: () => Promise<void> }).dispose === "function") {
      await (extractor as unknown as { dispose: () => Promise<void> }).dispose();
    }
    extractor = null;
  }

  return { load, embed, embedBatch, cosineSimilarity, isLoaded, unload };
};

export type EmbeddingService = ReturnType<typeof createEmbeddingService>;

export const embeddingService = createEmbeddingService();
