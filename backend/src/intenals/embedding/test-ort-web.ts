// Test: ONNX Runtime Web (WASM) in Deno
import * as ort from "npm:onnxruntime-web@1.20.0";

console.log("ORT version:", ort.env?.wasm?.wasmPaths ?? "checking...");
console.log("ORT backends:", Object.keys(ort));
