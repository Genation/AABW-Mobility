import { assertEquals, assertGreater } from "@std/assert";
import { buildSnapshot } from "../builder/builder.ts";
import { closePool } from "@/db/pool.ts";

Deno.test("Builder: buildSnapshot integration", async () => {
  const snapshot = await buildSnapshot();

  assertGreater(snapshot.totalPairs, 0);
  assertGreater(snapshot.totalNodes, 0);
  assertEquals(typeof snapshot.trieJson, "string");
  assertEquals(typeof snapshot.buildTime, "string");

  const parsed = JSON.parse(snapshot.trieJson);
  assertEquals(typeof parsed, "object");

  const keys = Object.keys(snapshot.sourceCounts);
  assertEquals(keys.length > 0, true);

  let sum = 0;
  for (const count of Object.values(snapshot.sourceCounts)) {
    sum += count;
  }
  assertEquals(snapshot.totalPairs, sum);

  await closePool();
});
