// @ts-nocheck
/**
 * API Key Repository Tests
 *
 * Single Deno.test with t.step() — one key reused across all steps.
 */
import { assertEquals } from "@std/assert";
import { apiKeyRepo } from "../api-key.repo.ts";
import { closePool } from "@/db/pool.ts";

let recordId: string;
const userId = "00000000-0000-0000-0000-000000000001";

Deno.test({
  name: "apiKeyRepo — single setup, shared key across all steps",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn(t) {
    // ── Setup: create one record ───────────────────────────────────────────────
    {
      const result = await apiKeyRepo.create({
        name: "Repo Key",
        keyHash: "test_hash_placeholder",
        keyPrefix: "gtool_sk_rep",
        userId,
      });
      recordId = result.id;
      assertEquals(result.name, "Repo Key");
      assertEquals(result.keyPrefix, "gtool_sk_rep");
      assertEquals(typeof result.id, "string");
    }

    // ── Step 1: findByUser returns all keys including revoked ─────────────────
    await t.step(
      "findByUser returns all keys (including revoked) for audit",
      async () => {
        const result = await apiKeyRepo.findByUser(userId);
        assertEquals(result.length >= 1, true);
        const found = result.find((k) => k.id === recordId);
        assertEquals(found !== undefined, true);
      },
    );

    // ── Step 2: findByPrefixAndHash returns record when active ────────────────
    await t.step("findByPrefixAndHash returns record when active", async () => {
      const result = await apiKeyRepo.findByPrefixAndHash("gtool_sk_rep");
      assertEquals(result?.name, "Repo Key");
    });

    // ── Step 3: revoke ───────────────────────────────────────────────────────
    await t.step("revoke sets revokedAt", async () => {
      await apiKeyRepo.revoke(recordId);
      const all = await apiKeyRepo.findByUser(userId);
      const found = all.find((k) => k.id === recordId);
      assertEquals(found?.revokedAt !== undefined, true);
    });

    // ── Step 4: revoked key is excluded from findByPrefixAndHash ─────────────
    await t.step("findByPrefixAndHash skips revoked keys", async () => {
      const result = await apiKeyRepo.findByPrefixAndHash("gtool_sk_rep");
      assertEquals(result, null);
    });
  },
});

Deno.test.afterAll(async () => {
  await closePool();
});
