// @ts-nocheck
/**
 * MCP API Key Auth Integration Tests
 *
 * Single Deno.test with t.step() — one key reused across auth scenarios.
 * Auth flow: JWT access token -> create API key (REST) -> API key access MCP
 *
 * MCP middleware only accepts gtool_sk_ API keys. No JWT on MCP endpoint.
 */
import { assertEquals } from "@std/assert";
import { setupTestApp } from "@/shared/utils/test/setup.ts";
import { setupMcpTestApp } from "@/shared/utils/test/setup-mcp.ts";
import { createMcpRequest } from "@/shared/utils/test/setup-mcp.ts";
import { closePool } from "@/db/pool.ts";

let restApp: Awaited<ReturnType<typeof setupTestApp>>;
let mcpApp: Awaited<ReturnType<typeof setupMcpTestApp>>;
let apiKey: string;
let keyId: string;

Deno.test({
  name: "MCP API Key Auth — single setup, shared key across all steps",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn(t) {
    // ── Setup: create one API key via REST ───────────────────────────────────
    {
      const createRes = await restApp.fetchClient("/api-keys", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${restApp.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "MCP Auth Key" }),
      });
      assertEquals(createRes.status, 201);
      const json = createRes.data as any;
      apiKey = json.data.key;
      keyId = json.data.id;
    }

    // ── Step 1: MCP initialize with valid API key → returns 200 + session ID
    await t.step("API key authenticates MCP endpoint — initialize returns 200", async () => {
      const initRequest = createMcpRequest("initialize", {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0.0" },
      }, 1);

      const initRes = await mcpApp.fetchClient("/mcp", {
        method: "POST",
        body: JSON.stringify(initRequest),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "X-GEO-API-KEY": `${apiKey}`,
        },
      });

      assertEquals(initRes.status, 200);
      const sessionId = initRes.response.headers.get("mcp-session-id");
      assertEquals(sessionId !== null, true);

      // Complete handshake
      const notifReq = createMcpRequest("notifications/initialized", {});
      await mcpApp.fetchClient("/mcp", {
        method: "POST",
        body: JSON.stringify(notifReq),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "mcp-session-id": sessionId!,
          "X-GEO-API-KEY": `${apiKey}`,
        },
      });

      // ── Step 2: tools/call with valid key → returns 200 ──────────────────
      const toolRequest = createMcpRequest("tools/call", {
        name: "health_list",
        arguments: { limit: 5 },
      }, 2);

      const toolRes = await mcpApp.fetchClient("/mcp", {
        method: "POST",
        body: JSON.stringify(toolRequest),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "mcp-session-id": sessionId!,
          "X-GEO-API-KEY": `${apiKey}`,
        },
      });

      assertEquals(toolRes.status, 200);
      const toolJson = toolRes.data as any;
      assertEquals(toolJson.jsonrpc, "2.0");
      assertEquals(toolJson.result !== undefined, true);
    });

    // ── Step 3: Revoke the key via REST, then MCP should return 401 ───────────
    await t.step("Revoked API key does not authenticate MCP — returns 401", async () => {
      await restApp.fetchClient(`/api-keys/${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${restApp.token}` },
      });

      const initRequest = createMcpRequest("initialize", {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0.0" },
      }, 1);

      const initRes = await mcpApp.fetchClient("/mcp", {
        method: "POST",
        body: JSON.stringify(initRequest),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "X-GEO-API-KEY": `${apiKey}`,
        },
      });

      assertEquals(initRes.status, 401);
    });

    // ── Step 4: Missing Authorization header returns 401 ─────────────────────
    await t.step("Missing Authorization header returns 401 on MCP", async () => {
      const initRequest = createMcpRequest("initialize", {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0.0" },
      }, 1);

      const initRes = await mcpApp.fetchClient("/mcp", {
        method: "POST",
        body: JSON.stringify(initRequest),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
        },
      });

      assertEquals(initRes.status, 401);
    });

    // ── Step 5: Wrong prefix returns 401 ─────────────────────────────────────
    await t.step("Wrong prefix (not gtool_sk_) returns 401 on MCP", async () => {
      const initRequest = createMcpRequest("initialize", {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0.0" },
      }, 1);

      const initRes = await mcpApp.fetchClient("/mcp", {
        method: "POST",
        body: JSON.stringify(initRequest),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "X-GEO-API-KEY": "not_a_gtool_key_xxx",
        },
      });

      assertEquals(initRes.status, 401);
    });
  },
});

Deno.test.beforeAll(async () => {
  restApp = await setupTestApp();
  mcpApp = await setupMcpTestApp();
});

Deno.test.afterAll(async () => {
  await closePool();
  await restApp.close();
  await mcpApp.close();
});
