/**
 * MCP Server Test Setup Utilities
 *
 * Creates a test MCP server instance for integration testing.
 * Uses session-per-request pattern (same as app.mcp.ts) with proper
 * initialization handshake tracking.
 *
 * Exports:
 *   - setupMcpTestApp()          : creates a full test server + pre-creates 1 API key
 *   - McpTestHelpers             : reusable helpers for MCP test cases
 *   - McpTestAppInstance          : interface for the test server instance
 *   - createMcpRequest()         : builds a JSON-RPC request object
 *   - initializeSession()        : full MCP handshake (init + notification)
 *   - callTool()                 : calls an MCP tool
 *   - callToolOk()               : calls tool + asserts 200/202
 *
 * NOTE: The session registry and getOrCreateSession are imported from
 * the shared mcp-hono.ts module to avoid code duplication with app.mcp.ts.
 */
import {
  createMcpApp,
  getOrCreateSession,
  type McpSessionRegistry,
} from "@/shared/utils/mcp-hono.ts";
import { getCachedTestToken } from "@/shared/utils/test/setup.ts";
import { logger } from "@/configs/logger.ts";
import { env } from "@/configs/env.ts";
import { createClient } from "@supabase/supabase-js";
import { cors } from "@hono/hono/cors";

// =============================================================================
// Test User — shared across all test sessions
// =============================================================================

const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);

const TEST_USER = {
  id: "b82303fb-7bd8-4de9-8f01-037442724252",
  email: "admin-test@example.com",
  password: "123456",
};

// Isolated session registry for this test app instance
const testSessionRegistry: McpSessionRegistry = new Map();

/** Cached test API key — created once per test suite startup, reused across all sessions. */
let _cachedTestApiKey: string | null = null;

// =============================================================================
// Reusable MCP Test Helpers — use these in any MCP test file
// =============================================================================

/**
 * Builds a JSON-RPC 2.0 request object.
 * - Notifications (no id) are used for "notifications/initialized".
 * - Requests include the provided id.
 */
export function createMcpRequest(
  method: string,
  params?: Record<string, unknown>,
  id?: number,
) {
  return {
    jsonrpc: "2.0",
    method,
    params: params ?? {},
    ...(id !== undefined ? { id } : {}),
  };
}

/**
 * Performs the full MCP initialize handshake and returns the session ID.
 * - Sends JSON-RPC "initialize" request
 * - Sends "notifications/initialized" notification
 * - Returns the mcp-session-id header value
 *
 * Uses the apiKey if provided, otherwise falls back to the cached test API key
 * (set during setupMcpTestApp startup).
 */
export async function initializeSession(
  fetchClient: McpTestAppInstance["fetchClient"],
  apiKey: string,
): Promise<string> {
  const initRequest = createMcpRequest("initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" },
  }, 1);

  const initResponse = await fetchClient("/mcp", {
    method: "POST",
    body: JSON.stringify(initRequest),
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "X-GEO-API-KEY": apiKey,
    },
  });

  if (initResponse.status !== 200 && initResponse.status !== 202) {
    throw new Error(
      `Initialize failed: ${initResponse.status} ${
        JSON.stringify(initResponse.data)
      }`,
    );
  }

  const sessionIdHeader = initResponse.response.headers.get("mcp-session-id");
  if (!sessionIdHeader) {
    throw new Error("No session ID returned from initialize");
  }

  // Send notifications/initialized to complete the handshake
  const notifRequest = createMcpRequest("notifications/initialized", {});
  await fetchClient("/mcp", {
    method: "POST",
    body: JSON.stringify(notifRequest),
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "mcp-session-id": sessionIdHeader,
      "X-GEO-API-KEY": apiKey,
    },
  });

  return sessionIdHeader;
}

/**
 * Counter for generating unique tool call IDs within a test session.
 * Shared across all callTool invocations.
 */
let _toolCallId = 0;

function nextToolId() {
  return ++_toolCallId;
}

/**
 * Calls an MCP tool and returns the raw fetch response.
 * Automatically includes mcp-session-id header and increments tool call id.
 */
export function callTool(
  fetchClient: McpTestAppInstance["fetchClient"],
  toolName: string,
  args: Record<string, unknown>,
  sessionId: string,
  token: string,
) {
  const request = createMcpRequest("tools/call", {
    name: toolName,
    arguments: args,
  }, nextToolId());

  return fetchClient("/mcp", {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "mcp-session-id": sessionId,
      "X-GEO-API-KEY": token,
    },
  });
}

/**
 * Calls an MCP tool, asserts HTTP 200/202 and JSON-RPC 2.0, returns response.
 * Use this for happy-path tests. Use callTool directly for error-path tests.
 */
export async function callToolOk(
  fetchClient: McpTestAppInstance["fetchClient"],
  toolName: string,
  args: Record<string, unknown>,
  sessionId: string,
  token: string,
): Promise<
  { status: number; data: Record<string, unknown>; response: Response }
> {
  const response = await callTool(
    fetchClient,
    toolName,
    args,
    sessionId,
    token,
  ) as {
    status: number;
    data: Record<string, unknown>;
    response: Response;
  };
  const ok = response.status === 200 || response.status === 202;
  if (!ok) {
    throw new Error(
      `Expected 200/202, got ${response.status}: ${
        JSON.stringify(response.data)
      }`,
    );
  }
  if (!response.data || response.data.jsonrpc !== "2.0") {
    throw new Error(
      `Expected jsonrpc 2.0, got: ${JSON.stringify(response.data)}`,
    );
  }
  return response;
}

// =============================================================================
// Fetch client types & helpers
// =============================================================================

export interface McpFetchClientResponse<T = unknown> {
  status: number;
  data: T | null;
  response: Response;
}

export interface McpTestAppInstance {
  token: string;
  /** Pre-created test API key — use this with initializeSession(). */
  apiKey: string;
  fetchClient: <T = unknown>(
    path: string,
    options?: RequestInit,
    token?: string,
  ) => Promise<McpFetchClientResponse<T>>;
  port: number;
  baseUrl: string;
  close: () => Promise<void>;
}

async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  token?: string,
): Promise<McpFetchClientResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
  };

  // Remove all Bearer logic. Only pass X-GEO-API-KEY when token is provided.
  if (token) {
    headers["X-GEO-API-KEY"] = token;
  }

  // Merge any user-provided headers, but ensure X-GEO-API-KEY is present if token supplied
  const userHeaders = (options.headers as Record<string, string> | undefined) ||
    {};
  const mergedHeaders = { ...headers, ...userHeaders };

  if (token && !("X-GEO-API-KEY" in mergedHeaders)) {
    mergedHeaders["X-GEO-API-KEY"] = token;
  }

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  let data = null as T | null;
  if (response.headers.get("content-type")?.includes("application/json")) {
    data = await response.json();
  }

  return { status: response.status, data, response };
}

// =============================================================================
// Test user management
// =============================================================================

async function ensureTestUser(): Promise<string> {
  // Reuse cached token from setup.ts — avoids ~25s signInWithPassword call
  const cached = getCachedTestToken();
  if (cached) {
    logger.info("[MCP Test] Reusing cached JWT token");
    return cached;
  }

  const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(
    TEST_USER.id,
  );
  logger.info(`[MCP Test] Supabase User: ${existingUser?.user?.email}`);

  if (!existingUser?.user) {
    logger.info("[MCP Test] Creating test user...");
    const { error } = await supabaseAdmin.auth.admin.createUser({
      id: TEST_USER.id,
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: { name: "Test User" },
    });
    if (error) {
      throw new Error(`[MCP Test] Failed to create user: ${error.message}`);
    }
  }

  const { data: sessionData } = await supabaseAdmin.auth.signInWithPassword({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });

  return sessionData?.session?.access_token ?? "";
}

// =============================================================================
// Test app factory
// =============================================================================

export async function setupMcpTestApp(): Promise<McpTestAppInstance> {
  const app = createMcpApp();

  // CORS middleware
  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "mcp-session-id",
        "Last-Event-ID",
        "mcp-protocol-version",
        // Remove "Authorization", always require "X-GEO-API-KEY"
        "X-GEO-API-KEY",
      ],
      exposeHeaders: [
        "mcp-session-id",
        "mcp-protocol-version",
        "x-request-id",
      ],
      credentials: true,
    }),
  );

  // Auth middleware for /mcp — API key only (X-GEO-API-KEY)
  app.use("/mcp", async (c, next) => {
    const apiKeyHeader = c.req.header("X-GEO-API-KEY");

    if (!apiKeyHeader) {
      return c.json(
        { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" } },
        401,
      );
    }

    if (!apiKeyHeader.startsWith("gtool_sk_")) {
      return c.json(
        { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" } },
        401,
      );
    }

    const { apiKeyService } = await import(
      "@/modules/api-key/api-key.service.ts"
    );
    const userId = await apiKeyService.verify(apiKeyHeader);
    if (!userId) {
      return c.json(
        { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" } },
        401,
      );
    }
    c.set("userId", userId);
    await next();
  });

  // MCP endpoint — delegates to shared getOrCreateSession
  app.all("/mcp", async (c) => {
    const sessionId = c.req.raw.headers.get("mcp-session-id");

    let entry;
    try {
      entry = await getOrCreateSession(
        testSessionRegistry,
        sessionId,
        (sid) => logger.info("[MCP Test] Session initialized: " + sid),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return c.json(
        { jsonrpc: "2.0", error: { code: -32000, message: msg }, id: null },
        400,
      );
    }

    const response = await entry.transport.handleRequest(c.req.raw);

    const cloned = new Response(response.body, response);
    for (const [key, value] of response.headers) {
      if (
        key === "mcp-session-id" ||
        key === "mcp-protocol-version" ||
        key === "x-request-id"
      ) {
        cloned.headers.set(key, value);
      }
    }

    return cloned;
  });

  // Health check
  app.get("/health", (c) =>
    c.json({
      status: "ok",
      server: "mcp-test-server",
      version: "1.0.0",
      transport: "web-standard-streamable-http",
      activeSessions: testSessionRegistry.size,
    }));

  // Readiness check
  app.get("/ready", (c) => c.json({ ready: true }));

  const token = await ensureTestUser();

  // ── Create one test API key at startup — reused across all test steps ──────
  const { apiKeyService } = await import(
    "@/modules/api-key/api-key.service.ts"
  );
  const { key: testApiKey } = await apiKeyService.create(
    "mcp-test-key",
    TEST_USER.id,
  );
  _cachedTestApiKey = testApiKey;
  logger.info(`[MCP Test] Pre-created API key: ${testApiKey.slice(0, 12)}...`);

  const port = env.PORT + Math.floor(Math.random() * 1000) + 1000;
  const baseUrl = `http://localhost:${port}`;

  const serverHandle = Deno.serve({
    port,
    handler: async (req) => {
      return await app.fetch(req);
    },
  });

  // Poll /ready instead of fixed 500ms sleep
  const startMs = Date.now();
  while (Date.now() - startMs < 5000) {
    try {
      const r = await fetch(`http://localhost:${port}/ready`);
      if (r.ok) {
        logger.info(
          `[MCP Test] Server ready on port ${port} (polled ${
            Date.now() - startMs
          }ms)`,
        );
        break;
      }
    } catch {
      // not ready yet
    }
    await new Promise<void>((r) => setTimeout(r, 50));
  }

  return {
    fetchClient: <T = unknown>(
      path: string,
      options: RequestInit = {},
      token?: string,
    ) => {
      const fullUrl = `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
      return fetchJson<T>(fullUrl, options, token);
    },
    token,
    apiKey: testApiKey,
    port,
    baseUrl,
    close: async () => {
      logger.info("[MCP Test] Closing server...");
      for (const [, entry] of testSessionRegistry) {
        await entry.transport.close();
      }
      serverHandle.shutdown();
    },
  };
}
