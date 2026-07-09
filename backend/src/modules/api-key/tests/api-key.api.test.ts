// @ts-nocheck
/**
 * API Key REST API Tests
 *
 * Single Deno.test with t.step() — one key created once, reused across all steps.
 */
import { assertEquals } from "@std/assert";
import { setupTestApp } from "@/shared/utils/test/setup.ts";
import { closePool } from "@/db/pool.ts";

let testApp: Awaited<ReturnType<typeof setupTestApp>>;
let createdKey: { id: string; key: string; keyPrefix: string };

Deno.test({
  name: "API Key CRUD — single setup, shared key across all steps",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn(t) {
    // ── Setup: create one key ─────────────────────────────────────────────────
    {
      const res = await testApp.fetchClient("/api-keys", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testApp.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "CRUD Key" }),
      });
      assertEquals(res.status, 201);
      const json = res.data as any;
      assertEquals(json.ok, true);
      assertEquals(json.data.name, "CRUD Key");
      assertEquals(json.data.key.startsWith("gtool_sk_"), true);
      assertEquals(json.data.key.length, 52);
      createdKey = {
        id: json.data.id,
        key: json.data.key,
        keyPrefix: json.data.key.slice(0, 12),
      };
    }

    // ── Step 1: List keys — key present, full key and hash are hidden ───────
    await t.step(
      "GET /api-keys returns key without exposing full key or hash",
      async () => {
        const res = await testApp.fetchClient("/api-keys", {
          headers: { Authorization: `Bearer ${testApp.token}` },
        });
        assertEquals(res.status, 200);
        const json = res.data as any;
        const found = json.data.find((k: any) => k.id === createdKey.id);
        assertEquals(found !== undefined, true);
        assertEquals("key" in found, false);
        assertEquals("keyHash" in found, false);
        assertEquals(found.keyPrefix, createdKey.keyPrefix);
        assertEquals(found.revokedAt, null);
      },
    );

    // ── Step 2: Delete key ───────────────────────────────────────────────────
    await t.step("DELETE /api-keys/:id soft-revokes the key", async () => {
      const res = await testApp.fetchClient(`/api-keys/${createdKey.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${testApp.token}` },
      });
      assertEquals(res.status, 204);
    });

    // ── Step 3: Revoked key is included in list with revokedAt ───────────────
    await t.step("Revoked key is included in list with revokedAt", async () => {
      const res = await testApp.fetchClient("/api-keys", {
        headers: { Authorization: `Bearer ${testApp.token}` },
      });
      assertEquals(res.status, 200);
      const json = res.data as any;
      const found = json.data.find((k: any) => k.id === createdKey.id);
      assertEquals(
        found !== undefined,
        true,
        "Key should still be in list (including revokedAt)",
      );
      assertEquals(found.revokedAt !== null, true);
    });

    // ── Step 4: Revoke already-revoked key returns 404 ──────────────────────
    await t.step("Revoking already-revoked key returns 404", async () => {
      const res = await testApp.fetchClient(`/api-keys/${createdKey.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${testApp.token}` },
      });
      assertEquals(res.status, 404);
    });

    // ── Step 5: Unauthenticated request returns 401 ─────────────────────────
    await t.step("Unauthenticated request returns 401", async () => {
      const res = await testApp.fetchClient("/api-keys", { headers: {} });
      assertEquals(res.status, 401);
    });
  },
});

Deno.test.beforeAll(async () => {
  testApp = await setupTestApp();
});

Deno.test.afterAll(async () => {
  await testApp.close();
  await closePool();
});
