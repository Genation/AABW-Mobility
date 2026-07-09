/**
 * MCP Server — Streamable HTTP Transport (MCP Spec 2025-11-25)
 *
 * Endpoints:
 *   POST /mcp  — JSON-RPC tool calls (request-response)
 *   GET  /mcp  — SSE stream (server-to-client notifications)
 *   DELETE /mcp — Session close
 *   GET  /health — Server health check
 *   GET  /ready  — Readiness check
 *
 * Reference: https://modelcontextprotocol.io/specification/2025-11-25
 */
import { serve } from "@hono/node-server";
import { cors } from "@hono/hono/cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { registerHealthTools } from "./modules/health/health.mcp.tool.ts";
import { registerHealthResources } from "./modules/health/health.mcp.resource.ts";
import { logger } from "@/configs/logger.ts";
import { createMcpApp, ALLOWED_ORIGINS } from "@/shared/utils/mcp-hono.ts";
import {
  requestIdMiddleware,
  mcpRequestLogMiddleware,
  originValidationMiddleware,
  mcpAuthMiddleware,
} from "@/middlewares/mcp.middleware.ts";

// =============================================================================
// Server Configuration
// =============================================================================

const MCP_SERVER_NAME = "geo-tools-mcp-server";
const MCP_SERVER_VERSION = "1.0.0";
const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-03-26"];

const HOST = Deno.env.get("HOST") || "0.0.0.0";
const MCP_PORT = Number(Deno.env.get("MCP_PORT")) || 8909;

// =============================================================================
// Session Registry — 1 transport + 1 server per session
// =============================================================================

interface SessionEntry {
  transport: WebStandardStreamableHTTPServerTransport;
  server: McpServer;
  createdAt: number;      // Date.now() when session was created
  lastActivity: number;   // Date.now() of last handled request
  initialized: boolean;   // true once server reaches initialized state
}

// ---------------------------------------------------------------------------
// Session cleanup config
// ---------------------------------------------------------------------------
const SESSION_INIT_TIMEOUT_MS = 30_000;   // uninitialized sessions die after 30s
const SESSION_IDLE_TIMEOUT_MS = 5 * 60_000; // idle sessions die after 5 minutes
const SESSION_MAX_COUNT = 100;             // hard cap on concurrent sessions

let sessionSweeperStarted = false;

const sessionRegistry = new Map<string, SessionEntry>();

/**
 * Creates a fresh McpServer instance.
 * Factory is called once per session to ensure clean state.
 */
function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        logging: {},
      },
      instructions:
        "This MCP server provides health data management tools: " +
        "List, create, get, update, and delete health records. " +
        "All timestamps are ISO 8601 format.",
    },
  );
  registerHealthTools(server);
  registerHealthResources(server);
  return server;
}

/**
 * Creates a fresh WebStandardStreamableHTTPServerTransport instance.
 * Called once per session — DO NOT reuse a closed transport.
 */
function createMcpTransport(
  sessionId: string,
  onSessionInitialized: (sessionId: string) => void,
): WebStandardStreamableHTTPServerTransport {
  return new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => sessionId,
    enableJsonResponse: true,
    onsessioninitialized: onSessionInitialized,
  });
}

/**
 * Looks up or creates a session entry.
 * - Request WITH sessionId + existing entry → reuse (existing session, already initialized)
 * - Request WITH sessionId + no entry → REJECT (client has stale session)
 * - Request WITHOUT sessionId (new session) → create new
 *
 * FIX: Always generate session ID upfront, BEFORE creating transport.
 * This ensures the registry key matches the transport's sessionId consistently,
 * so subsequent requests with the session ID always find the right entry.
 */
async function getOrCreateSession(
  sessionId: string | null,
): Promise<SessionEntry> {
  if (sessionId && sessionRegistry.has(sessionId)) {
    const entry = sessionRegistry.get(sessionId)!;
    entry.lastActivity = Date.now();
    return entry;
  }

  // If client provides a sessionId but we don't have it → stale session → reject
  if (sessionId) {
    throw new Error("Session not found. Client must re-initialize.");
  }

  // Generate session ID ONCE before transport creation.
  // This makes the registry key = transport's sessionId from day 1.
  const registryKey = crypto.randomUUID();

  // Hard cap — evict oldest idle session if we're at the limit
  if (sessionRegistry.size >= SESSION_MAX_COUNT) {
    let oldest: [string, SessionEntry] | null = null;
    for (const pair of sessionRegistry) {
      if (!oldest || pair[1].lastActivity < oldest[1].lastActivity) {
        oldest = pair;
      }
    }
    if (oldest) {
      try {
        await oldest[1].transport.close();
      } catch (e) {
        logger.error({ evictedSessionId: oldest[0] }, "Failed to close evicted transport", e);
        sessionRegistry.delete(oldest[0]);
      }
      logger.warn(
        { evictedSessionId: oldest[0], count: sessionRegistry.size },
        "Session evicted due to max session cap",
      );
    }
  }

  const server = createMcpServer();

  const entry: SessionEntry = {
    transport: null!, // assigned after createMcpTransport
    server,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    initialized: false,
  };

  const transport = createMcpTransport(
    registryKey,
    (sId: string) => {
      entry.initialized = true;
      logger.info({ sessionId: sId }, "Session marked as initialized");
    },
  );
  entry.transport = transport;

  await server.connect(transport);

  sessionRegistry.set(registryKey, entry);

  const originalClose = transport.close.bind(transport);
  transport.close = async () => {
    await originalClose();
    sessionRegistry.delete(registryKey);
  };

  startSessionSweeper();

  return entry;
}

// ---------------------------------------------------------------------------
// Background sweeper — removes stale sessions without blocking requests
// ---------------------------------------------------------------------------
function startSessionSweeper() {
  if (sessionSweeperStarted) return;
  sessionSweeperStarted = true;

  const SWEEP_INTERVAL_MS = 60_000;
  setInterval(() => {
    const now = Date.now();
    const toEvict: string[] = [];

    for (const [id, entry] of sessionRegistry) {
      const age = now - entry.createdAt;
      const idle = now - entry.lastActivity;
      if (!entry.initialized && age > SESSION_INIT_TIMEOUT_MS) {
        toEvict.push(id);
        logger.info(
          { sessionId: id, ageMs: age },
          "Session evicted: uninitialized after timeout",
        );
      } else if (idle > SESSION_IDLE_TIMEOUT_MS) {
        toEvict.push(id);
        logger.info(
          { sessionId: id, idleMs: idle },
          "Session evicted: idle timeout",
        );
      }
    }

    for (const id of toEvict) {
      sessionRegistry.get(id)?.transport.close();
    }
  }, SWEEP_INTERVAL_MS);
}

// =============================================================================
async function closeSession(sessionId: string): Promise<void> {
  const entry = sessionRegistry.get(sessionId);
  if (entry) {
    await entry.transport.close();
    sessionRegistry.delete(sessionId);
  }
}

// =============================================================================
// MCP Request Handler
// =============================================================================

async function handleMcpRequest(c: {
  get: (key: "requestId") => string;
  req: { raw: Request };
  json: (body: unknown, init?: number) => Response;
}): Promise<Response> {
  const requestId = c.get("requestId");
  const sessionId = c.req.raw.headers.get("mcp-session-id");
  const protoVersion = c.req.raw.headers.get("mcp-protocol-version");

  // Protocol version validation (required after initialization)
  if (protoVersion && !SUPPORTED_PROTOCOL_VERSIONS.includes(protoVersion)) {
    logger.warn({ requestId, protoVersion }, "Unsupported MCP protocol version");
    return c.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: `Unsupported MCP protocol version: ${protoVersion}`,
        },
      },
      400,
    );
  }

  try {
    let entry: SessionEntry;

    try {
      entry = await getOrCreateSession(sessionId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn({ requestId, sessionId, error: msg }, "Session not found");
      return c.json(
        {
          jsonrpc: "2.0",
          error: { code: -32000, message: msg },
          id: null,
        },
        400,
      );
    }

    logger.info(
      { requestId, sessionId: entry.transport.sessionId },
      "Dispatching MCP request",
    );

    const response = await entry.transport.handleRequest(c.req.raw);

    // Copy MCP-specific headers to the response so browsers can read them
    // (Hono's CORS middleware sets exposeHeaders but they may not apply to
    // the raw Response returned by the transport).
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
  } catch (error) {
    logger.error({ requestId, error }, "MCP request handler error");

    let errorId: string | number | null = null;
    try {
      const body = await c.req.raw.clone().json();
      errorId = body.id ?? null;
    } catch {
      errorId = null;
    }

    return c.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : String(error),
        },
        id: errorId,
      },
      500,
    );
  }
}

// =============================================================================
// Hono App
// =============================================================================

function buildApp() {
  const app = createMcpApp();

  // ---------------------------------------------------------------------------
  // CORS
  // ---------------------------------------------------------------------------
  const corsOrigin = ALLOWED_ORIGINS.length > 1 ? ALLOWED_ORIGINS : ALLOWED_ORIGINS[0];

  app.use("*", cors({
    origin: corsOrigin,
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "mcp-session-id",
      "Last-Event-ID",
      "mcp-protocol-version",
      "Authorization",
    ],
    exposeHeaders: [
      "mcp-session-id",
      "mcp-protocol-version",
      "x-request-id",
    ],
    credentials: true,
  }));

  // ---------------------------------------------------------------------------
  // Typed middlewares
  // ---------------------------------------------------------------------------
  app.use("*", requestIdMiddleware);
  app.use("*", mcpRequestLogMiddleware);
  app.use("*", originValidationMiddleware);
  app.use("*", mcpAuthMiddleware);

  // ---------------------------------------------------------------------------
  // MCP Endpoint
  // POST: JSON-RPC (new session or resume)
  // GET: SSE stream for server-to-client notifications
  // DELETE: Explicit session close
  // ---------------------------------------------------------------------------
  app.post("/mcp", async (c) => {
    return await handleMcpRequest(c);
  });

  app.get("/mcp", async (c) => {
    const requestId = c.get("requestId");
    const sessionId = c.req.raw.headers.get("mcp-session-id");

    if (!sessionId) {
      return c.json(
        { jsonrpc: "2.0", error: { code: -32000, message: "Session ID required for GET" } },
        400,
      );
    }

    const entry = sessionRegistry.get(sessionId);
    if (!entry) {
      return c.json(
        { jsonrpc: "2.0", error: { code: -32000, message: "Session not found" } },
        404,
      );
    }

    logger.info({ requestId, sessionId }, "MCP SSE stream request");
    return await entry.transport.handleRequest(c.req.raw);
  });

  app.delete("/mcp", async (c) => {
    const requestId = c.get("requestId");
    const sessionId = c.req.raw.headers.get("mcp-session-id");

    if (!sessionId) {
      return c.json(
        { jsonrpc: "2.0", error: { code: -32000, message: "Session ID required" } },
        400,
      );
    }

    await closeSession(sessionId);
    logger.info({ requestId, sessionId }, "MCP session closed");
    return new Response(null, { status: 204 });
  });

  // ---------------------------------------------------------------------------
  // Health & Readiness
  // ---------------------------------------------------------------------------
  app.get("/health", (c) =>
    c.json({
      status: "ok",
      server: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
      transport: "web-standard-streamable-http",
      mode: "stateful",
      activeSessions: sessionRegistry.size,
      endpoints: {
        mcp: "/mcp",
        health: "/health",
        ready: "/ready",
      },
      protocolVersion: "2025-11-25",
    })
  );

  app.get("/ready", (c) =>
    c.json({
      ready: true,
      server: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
    })
  );

  return app;
}

// =============================================================================
// Server Startup
// =============================================================================

if (import.meta.main) {
  const app = buildApp();

  logger.info({
    name: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
    transport: "web-standard-streamable-http",
    mode: "stateful",
    port: MCP_PORT,
    host: HOST,
    protocolVersion: "2025-11-25",
  }, "MCP Server starting");

  serve({ fetch: app.fetch, hostname: HOST, port: MCP_PORT });

  logger.info({ name: MCP_SERVER_NAME, port: MCP_PORT }, "MCP Server started");

  Deno.addSignalListener("SIGINT", () => {
    logger.info("Received SIGINT, shutting down...");
    Deno.exit(0);
  });
}

export { buildApp };
