// Quick test: does Transformers.js work in Deno?
try {
  const pkg = await import("npm:@xenova/transformers@2.17.2");
  console.log("Transformers.js loaded successfully");
  console.log("Available:", Object.keys(pkg).filter(k => k.includes("pipeline") || k.includes("env")).join(", "));
} catch (e) {
  console.error("Transformers.js load failed:", e.message);
}
