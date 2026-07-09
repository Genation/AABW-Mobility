/**
 * MCP Hono Factory — SSOT for MCP server Hono app creation
 *
 * Provides a typed Hono factory that extends the base app type
 * with MCP-specific Variables (requestId).
 *
 * Also exports shared MCP server utilities (session registry factory,
 * transport factory) to avoid duplication between app.mcp.ts and
 * test setup files.
 */
import { createFactory as createMcpFactory } from "@hono/hono/factory";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  WebStandardStreamableHTTPServerTransport,
} from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerHealthTools } from "@/modules/health/health.mcp.tool.ts";
import { registerHealthResources } from "@/modules/health/health.mcp.resource.ts";
import type { Bindings } from "@/shared/types/app.type.ts";

// =============================================================================
// Allowed Origins — parsed once, shared across app and middleware
// =============================================================================

export const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "*")
  .split(",")
  .map((s) => s.trim());

// =============================================================================
// MCP App Types & Factory
// =============================================================================

/**
 * Variables available in MCP request context
 */
export type McpVariables = {
  requestId: string;
  userId?: string;
};

/**
 * Full MCP app environment type
 */
export type McpAppEnv = { Bindings: Bindings; Variables: McpVariables };

/**
 * Factory for MCP Hono apps with typed requestId context
 */
const mcpFactory = createMcpFactory<McpAppEnv>();

export const createMcpApp = () => mcpFactory.createApp();

// =============================================================================
// Shared Session & Transport Utilities
//
// NOTE: these functions are designed to be used by both the production
// server (app.mcp.ts) and test setup (shared/utils/test/setup-mcp.ts).
// Each caller provides its own session registry to keep production and
// test sessions isolated.
// =============================================================================

/**
 * Standard MCP session entry — mirrors app.mcp.ts SessionEntry interface.
 * Exported so test setup can use the same type without duplication.
 */
export interface SessionEntry {
  transport: WebStandardStreamableHTTPServerTransport;
  server: McpServer;
  createdAt: number;
  lastActivity: number;
  initialized: boolean;
}

/**
 * Session registry type — a Map from session ID to SessionEntry.
 * Both app.mcp.ts and setup-mcp.ts use this same interface.
 */
export type McpSessionRegistry = Map<string, SessionEntry>;

/**
 * Creates a fresh WebStandardStreamableHTTPServerTransport instance.
 * Called once per session — DO NOT reuse a closed transport.
 *
 * @param sessionId   - The session ID to assign to this transport
 * @param onSessionInitialized - Callback when session completes initialize handshake
 */
export function createMcpTransport(
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
 * - Request WITH sessionId + existing entry → reuse (touch lastActivity)
 * - Request WITH sessionId + no entry → REJECT (stale session)
 * - Request WITHOUT sessionId → create new session
 */
export async function getOrCreateSession(
  registry: McpSessionRegistry,
  sessionId: string | null,
  onSessionInitialized: (sessionId: string) => void,
): Promise<SessionEntry> {
  if (sessionId && registry.has(sessionId)) {
    const entry = registry.get(sessionId)!;
    entry.lastActivity = Date.now();
    return entry;
  }

  if (sessionId) {
    throw new Error("Session not found. Client must re-initialize.");
  }

  const registryKey = crypto.randomUUID();
  const server = createMcpServer();

  const entry: SessionEntry = {
    transport: null!,
    server,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    initialized: false,
  };

  const transport = createMcpTransport(registryKey, (sid) => {
    entry.initialized = true;
    onSessionInitialized(sid);
  });
  entry.transport = transport;

  await server.connect(transport);
  registry.set(registryKey, entry);

  const originalClose = transport.close.bind(transport);
  transport.close = async () => {
    await originalClose();
    registry.delete(registryKey);
  };

  return entry;
}

// =============================================================================
// Server Factory
//
// Used by both production (app.mcp.ts) and test (setup-mcp.ts).
// =============================================================================

function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "geo-tools-mcp-server",
      version: "1.0.0",
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
