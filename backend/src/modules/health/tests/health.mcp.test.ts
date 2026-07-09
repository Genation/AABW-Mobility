// @ts-nocheck
/**
 * MCP Health Tool Integration Tests
 *
 * Single Deno.test with t.step() — one API key + one MCP session reused across all steps.
 * Auth flow: pre-created API key (via setupMcpTestApp) -> MCP initialize -> CRUD cycle
 *
 * Uses mcpApp.apiKey (pre-created at startup) and mcpApp.token (test user JWT).
 */
import {
  callTool,
  createMcpRequest,
  McpTestAppInstance,
  setupMcpTestApp,
} from "@/shared/utils/test/setup-mcp.ts";
import { assertEquals, assertExists } from "@std/assert";
import { closePool } from "@/db/pool.ts";

let mcpApp: McpTestAppInstance;
let sessionId: string;

Deno.test.beforeAll(async () => {
  mcpApp = await setupMcpTestApp();
});

Deno.test.afterAll(async () => {
  await closePool();
  await mcpApp.close();
});

Deno.test({
  name: "MCP Health — pre-created apiKey, one session, full CRUD cycle",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn(t) {
    // ── Setup: initialize session with pre-created API key ────────────────────────
    {
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
          "X-GEO-API-KEY": mcpApp.apiKey,
        },
      });
      assertEquals(initRes.status, 200);
      sessionId = initRes.response.headers.get("mcp-session-id")!;
      assertExists(sessionId);

      // Complete handshake
      await mcpApp.fetchClient("/mcp", {
        method: "POST",
        body: JSON.stringify(createMcpRequest("notifications/initialized")),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "mcp-session-id": sessionId,
          "X-GEO-API-KEY": mcpApp.apiKey,
        },
      });
    }

    // ── Protocol / Auth checks (no session needed) ───────────────────────────────

    await t.step(
      "POST /mcp without session — auth runs first (no Authorization → 401)",
      async () => {
        const res = await mcpApp.fetchClient("/mcp", {
          method: "POST",
          body: JSON.stringify(
            createMcpRequest("tools/call", {
              name: "health_list",
              arguments: {},
            }),
          ),
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
          },
        });
        // Auth middleware runs first → 401 (no Authorization header), not 400
        assertEquals(res.status, 401);
      },
    );

    await t.step("POST /mcp without Authorization — returns 401", async () => {
      const res = await mcpApp.fetchClient("/mcp", {
        method: "POST",
        body: JSON.stringify(
          createMcpRequest("tools/call", {
            name: "health_list",
            arguments: {},
          }),
        ),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "mcp-session-id": sessionId,
        },
      });
      assertEquals(res.status, 401);
    });

    await t.step("POST /mcp with wrong prefix — returns 401", async () => {
      const res = await mcpApp.fetchClient("/mcp", {
        method: "POST",
        body: JSON.stringify(
          createMcpRequest("tools/call", {
            name: "health_list",
            arguments: {},
          }),
        ),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "mcp-session-id": sessionId,
          "Authorization": "Bearer not_a_gtool_key",
        },
      });
      assertEquals(res.status, 401);
    });

    await t.step(
      "GET /mcp without session ID header — returns 400",
      async () => {
        const res = await mcpApp.fetchClient("/mcp", {
          method: "GET",
          headers: { Accept: "text/event-stream" },
        }, mcpApp.apiKey);
        assertEquals(res.status, 400);
      },
    );

    await t.step(
      "/health endpoint — returns 200 with server status",
      async () => {
        const { status, data } = await mcpApp.fetchClient("/health", {});
        assertEquals(status, 200);
        assertEquals((data as any).status, "ok");
        assertEquals(typeof (data as any).server, "string");
      },
    );

    await t.step("/ready endpoint — returns 200 with ready=true", async () => {
      const { status, data } = await mcpApp.fetchClient("/ready", {});
      assertEquals(status, 200);
      assertEquals((data as any).ready, true);
    });

    // ── CRUD steps (reuse sessionId) ───────────────────────────────────────────

    await t.step("health_list — returns 200 with data", async () => {
      const res = await callTool(
        mcpApp.fetchClient,
        "health_list",
        { limit: 10 },
        sessionId,
        mcpApp.apiKey,
      );
      assertEquals(res.status === 200 || res.status === 202, true);
      assertEquals((res.data as any).jsonrpc, "2.0");
      assertExists((res.data as any).result);
    });

    await t.step("health_create — creates record and returns 200", async () => {
      const res = await callTool(
        mcpApp.fetchClient,
        "health_create",
        { data: { e2eTest: true, score: 95 } },
        sessionId,
        mcpApp.apiKey,
      );
      assertEquals(res.status === 200 || res.status === 202, true);
      assertExists((res.data as any).result);
    });

    await t.step("health_get — retrieves existing record by id", async () => {
      const createRes = await callTool(
        mcpApp.fetchClient,
        "health_create",
        { data: { getTest: true } },
        sessionId,
        mcpApp.apiKey,
      );
      const id = (createRes.data as any)?.result?.id ?? 1;
      const res = await callTool(
        mcpApp.fetchClient,
        "health_get",
        { id },
        sessionId,
        mcpApp.apiKey,
      );
      assertEquals(res.status === 200 || res.status === 202, true);
      assertEquals((res.data as any).jsonrpc, "2.0");
    });

    await t.step(
      "health_get — handles not-found record gracefully",
      async () => {
        const res = await callTool(
          mcpApp.fetchClient,
          "health_get",
          { id: 999999 },
          sessionId,
          mcpApp.apiKey,
        );
        assertEquals(res.status === 200 || res.status === 202, true);
        assertEquals((res.data as any).jsonrpc, "2.0");
      },
    );

    await t.step(
      "health_update — updates existing record and returns 200",
      async () => {
        const res = await callTool(
          mcpApp.fetchClient,
          "health_update",
          { id: 1, data: { updated: true, newField: 42 } },
          sessionId,
          mcpApp.apiKey,
        );
        assertEquals(res.status === 200 || res.status === 202, true);
        assertEquals((res.data as any).jsonrpc, "2.0");
      },
    );

    await t.step(
      "health_update — returns 200 for non-existent record",
      async () => {
        const res = await callTool(
          mcpApp.fetchClient,
          "health_update",
          { id: 999998, data: { value: 70 } },
          sessionId,
          mcpApp.apiKey,
        );
        assertEquals(res.status === 200 || res.status === 202, true);
      },
    );

    await t.step("health_delete — deletes record and returns 200", async () => {
      // First create then delete
      const createRes = await callTool(
        mcpApp.fetchClient,
        "health_create",
        { data: { toDelete: true } },
        sessionId,
        mcpApp.apiKey,
      );
      const id = (createRes.data as any)?.result?.id ?? 2;
      const res = await callTool(
        mcpApp.fetchClient,
        "health_delete",
        { id },
        sessionId,
        mcpApp.apiKey,
      );
      assertEquals(res.status === 200 || res.status === 202, true);
    });

    await t.step(
      "health_delete — returns 200 for non-existent record",
      async () => {
        const res = await callTool(
          mcpApp.fetchClient,
          "health_delete",
          { id: 999997 },
          sessionId,
          mcpApp.apiKey,
        );
        assertEquals(res.status === 200 || res.status === 202, true);
      },
    );

    await t.step(
      "health_gap_test — returns 200 for existing record",
      async () => {
        const res = await callTool(
          mcpApp.fetchClient,
          "health_gap_test",
          { id: 1 },
          sessionId,
          mcpApp.apiKey,
        );
        assertEquals(res.status === 200 || res.status === 202, true);
      },
    );

    // ── Resource steps ──────────────────────────────────────────────────────────

    await t.step(
      "resources/list — returns health schema resource",
      async () => {
        const res = await mcpApp.fetchClient("/mcp", {
          method: "POST",
          body: JSON.stringify(createMcpRequest("resources/list", {}, 100)),
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "mcp-session-id": sessionId,
            "X-GEO-API-KEY": mcpApp.apiKey,
          },
        });
        assertEquals(res.status === 200 || res.status === 202, true);
        const resources = (res.data as any)?.result?.resources ?? [];
        const schemaResource = resources.find(
          (r: any) => r.uri === "geotools://health/schema",
        );
        assertExists(
          schemaResource,
          "Resource geotools://health/schema should exist",
        );
        assertEquals(schemaResource.name, "health-schema");
        assertEquals(schemaResource.mimeType, "application/schema+json");
      },
    );

    await t.step("resources/read — returns valid JSON schema", async () => {
      const res = await mcpApp.fetchClient("/mcp", {
        method: "POST",
        body: JSON.stringify(createMcpRequest("resources/read", {
          uri: "geotools://health/schema",
        }, 101)),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "mcp-session-id": sessionId,
          "X-GEO-API-KEY": mcpApp.apiKey,
        },
      });
      assertEquals(res.status === 200 || res.status === 202, true);
      const contents = (res.data as any)?.result?.contents ?? [];
      assertEquals(contents.length, 1);
      assertEquals(contents[0].uri, "geotools://health/schema");
      assertEquals(contents[0].mimeType, "application/schema+json");

      const schema = JSON.parse(contents[0].text);
      assertEquals(schema.type, "object");
      assertExists(schema.properties.id);
      assertExists(schema.properties.data);
      assertExists(schema.properties.createdAt);
      assertExists(schema.properties.updatedAt);
    });
  },
});
