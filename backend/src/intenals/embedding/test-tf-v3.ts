// Test: Official @huggingface/transformers v3 in Deno (text-only, no sharp)
// This version splits image/audio models into optional deps

import { pipeline, env } from "npm:@huggingface/transformers@3.5.0";

// Use WASM backend
env.backends.onnx.wasm.numThreads = 1;
env.allowLocalModels = false;

console.log("Testing pipeline creation...");

try {
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
    revision: "main",
  });

  const output = await extractor("test sentence", {
    pooling: "mean",
    normalize: true,
  });

  console.log("Embedding dim:", output.data.length);
  console.log("First 5 values:", Array.from(output.data).slice(0, 5));
  console.log("SUCCESS: Transformers.js works in Deno");
} catch (e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error("FAILED:", msg);
}
