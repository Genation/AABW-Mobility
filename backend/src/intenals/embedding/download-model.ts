/**
 * Download embedding model to local filesystem.
 * Workaround for Deno Cache API bug with Transformers.js.
 *
 * Usage: deno run -A --env-file=.env.local src/intenals/embedding/download-model.ts
 */

import { pipeline, env } from "npm:@huggingface/transformers@3.5.0";

const MODEL = "intfloat/multilingual-e5-small";
const TARGET_DIR = "./data/models/multilingual-e5-small";

// Ensure target directory
try {
  await Deno.mkdir(TARGET_DIR, { recursive: true });
} catch { /* exists */ }

env.allowLocalModels = false; // Force download from HF
env.backends.onnx.wasm!.numThreads = 1;

console.log(`Downloading ${MODEL} ...`);
console.log("This may take 2-5 minutes on first run (~118MB)");

// Download model (Transformers.js caches to HF cache dir)
const extractor = await pipeline("feature-extraction", MODEL);

// Test embed to verify
const result = await extractor("test", { pooling: "mean", normalize: true });
console.log("Model loaded successfully. Dim:", result.data.length);

// Copy to local directory
console.log(`To use local model, set env.localModelPath = "./data/models/"`);
console.log(`And place files in: ${TARGET_DIR}`);
console.log("Done.");

Deno.exit(0);
