/**
 * MCP Middlewares — Request logging + Origin validation + Auth
 *
 * Exported so app.mcp.ts stays clean. Each middleware is self-contained.
 */
import { createMiddleware } from "@hono/hono/factory";
import { ALLOWED_ORIGINS, type McpAppEnv } from "@/shared/utils/mcp-hono.ts";
import { logger } from "@/configs/logger.ts";
import { apiKeyService } from "@/modules/api-key/api-key.service.ts";

// =============================================================================
// Middleware: Request ID — injects requestId into context for structured logging
// =============================================================================

export const requestIdMiddleware = createMiddleware<McpAppEnv>(
  async (c, next) => {
    const requestId = crypto.randomUUID();
    c.set("requestId", requestId);
    await next();
  },
);

// =============================================================================
// Middleware: Request Logging — logs all incoming HTTP requests
// =============================================================================

export const mcpRequestLogMiddleware = createMiddleware<McpAppEnv>(
  async (c, next) => {
    const requestId = c.get("requestId");
    const method = c.req.method;
    const path = new URL(c.req.url).pathname;
    const userAgent = c.req.header("user-agent") || "unknown";

    logger.info({
      requestId,
      method,
      path,
      userAgent,
    }, "MCP HTTP request received");

    await next();

    logger.info({
      requestId,
      method,
      path,
      status: c.res.status,
    }, "MCP HTTP request completed");
  },
);

// =============================================================================
// Middleware: Origin Validation — DNS rebinding protection per MCP spec
//
// MCP spec mandates: servers MUST validate the Origin header on all incoming
// connections. If present and invalid, respond with HTTP 403 Forbidden.
// =============================================================================

export const originValidationMiddleware = createMiddleware<McpAppEnv>(
  async (c, next) => {
    const origin = c.req.header("origin");
    if (
      origin &&
      ALLOWED_ORIGINS[0] !== "*" &&
      !ALLOWED_ORIGINS.includes(origin)
    ) {
      const requestId = c.get("requestId");
      logger.warn(
        { requestId, origin },
        "Disallowed origin rejected",
      );
      c.header("Access-Control-Allow-Origin", origin);
      return c.json(
        {
          jsonrpc: "2.0",
          error: { code: -32000, message: "Forbidden" },
        },
        403,
      );
    }
    await next();
  },
);

// =============================================================================
// Middleware: Bearer Token Auth — validates API key on every MCP request
//
// Flow: JWT access token -> create API key (REST) -> API key access MCP
// No JWT verification on MCP endpoint — only gtool_sk_ API keys are accepted.
// =============================================================================

export const mcpAuthMiddleware = createMiddleware<McpAppEnv>(
  async (c, next) => {
    if (new URL(c.req.url).pathname !== "/mcp") {
      return await next();
    }

    const apiKeyHeader = c.req.header("X-GEO-API-KEY");

    if (!apiKeyHeader) {
      const requestId = c.get("requestId");
      logger.warn(
        { requestId },
        "MCP request rejected: missing X-GEO-API-KEY header",
      );
      return c.json(
        {
          jsonrpc: "2.0",
          error: { code: -32001, message: "Unauthorized" },
          id: null,
        },
        401,
      );
    }

    if (!apiKeyHeader.startsWith("gtool_sk_")) {
      const requestId = c.get("requestId");
      logger.warn(
        { requestId, apiKeyHeader },
        "MCP request rejected: invalid auth format",
      );
      return c.json(
        {
          jsonrpc: "2.0",
          error: { code: -32001, message: "Unauthorized" },
          id: null,
        },
        401,
      );
    }

    const userId = await apiKeyService.verify(apiKeyHeader);
    if (!userId) {
      const requestId = c.get("requestId");
      logger.warn({ requestId }, "MCP request rejected: invalid API key");
      return c.json(
        {
          jsonrpc: "2.0",
          error: { code: -32001, message: "Invalid or revoked API key" },
          id: null,
        },
        401,
      );
    }

    c.set("userId", userId);
    await next();
  },
);
