# MCP Server - Technical Documentation

> **Spec:** MCP Protocol 2025-11-25 | **Transport:** Streamable HTTP | **Runtime:** Deno

---

## Overview

The MCP server (`app.mcp.ts`) exposes health CRUD operations as [Model Context Protocol](https://modelcontextprotocol.io/specification/2025-11-25) tools, enabling AI clients (Cursor, Claude Desktop, custom) to manage health records via a standardized JSON-RPC interface.

The server is a **stateful** Streamable HTTP server -- each client gets an isolated session with a dedicated transport and server instance, managed by a `sessionRegistry`.

**Endpoints:**

| Method | Path   | Description                       |
|--------|--------|-----------------------------------|
| POST   | /mcp   | JSON-RPC request (tool calls)     |
| GET    | /mcp   | SSE stream (server-to-client)     |
| DELETE | /mcp   | Explicit session close            |
| GET    | /health| Server health check (public)      |
| GET    | /ready | Readiness check (public)          |

---

## Table of Contents

1. [Conventions & Principles](#1-conventions--principles)
2. [Architecture](./ARCHITECTURE.md)
3. [Tool Development](./TOOLS.md)
4. [Resource Development](./RESOURCES.md)
5. [Testing](./TESTING.md)
6. [Error Handling](./ERROR_HANDLING.md)

---

## 1. Conventions & Principles

### 1.1 Single Source of Truth (SSOT)

Every piece of knowledge exists in exactly one place. Violations cost 2x effort to fix.

| Concern                   | SSOT Location                              | Do NOT duplicate in              |
|---------------------------|--------------------------------------------|----------------------------------|
| DB schemas, table defs    | `modules/<name>/<name>.schema.ts`          | Anywhere else                    |
| DTO schemas (Zod)         | `modules/<name>/<name>.dto.ts`            | `.mcp.ts`, handlers, tests       |
| Tool input schemas (MCP)   | Derived from dto, defined in `.mcp.tool.ts` | Handler callbacks                |
| Business logic            | `modules/<name>/<name>.service.ts`         | `.mcp.ts`, handlers              |
| MCP shared utilities      | `shared/utils/mcp-hono.ts`                 | `app.mcp.ts`, `setup-mcp.ts`     |

**DTO is the SSOT for all validation schemas.** MCP tool files must reuse (not redefine) DTO schemas. If a tool needs a variant (e.g., `latestAt` as ISO string instead of `Date`), derive it from the DTO schema using Zod operations.

### 1.2 Module Pattern -- One Registry Per File

Tools and Resources are two separate registries. Each lives in its own file.

```typescript
// health.mcp.tool.ts  - registerTool() calls only
export function registerHealthTools(server: McpServer): void {
  server.registerTool("health_list", { ... }, async (args, ctx) => { ... });
}

// health.mcp.resource.ts  - registerResource() calls only
export function registerHealthResources(server: McpServer): void {
  server.registerResource("health-stats", "health://stats", { ... }, async (uri) => { ... });
}

// health.mcp.ts  - DEPRECATED: re-exports for backward compat only
export { registerHealthTools } from "./health.mcp.tool.ts";
export { registerHealthResources } from "./health.mcp.resource.ts";
```

**Why two files?** `registerTool` and `registerResource` are fundamentally different registries in the MCP SDK. Separating them makes each file focused, testable, and avoids mixing concerns.

### 1.3 Input Schemas -- Zod v4

All tool input schemas use **Zod v4** via `z.object(...)`. Do not use `z.coerce.date()` -- the MCP JSON Schema serialization cannot handle `Date` objects. Use `z.string().datetime()` and parse manually in the handler.

```typescript
// Correct
const HealthListInputSchema = z.object({
  latestAt: z.string().datetime({ offset: true }).optional(),
});

// In handler:
const latestAtDate = args.latestAt ? new Date(args.latestAt) : undefined;
```

### 1.4 Response Format -- Always JSON Text Content

All tool responses return `content: [{ type: "text", text: JSON.stringify(...) }]`. Even for empty results, return valid JSON text -- never return plain strings or undefined.

```typescript
// Standard success response
return {
  content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
};

// For errors, include JSON-RPC code in response body
return {
  content: [{ type: "text", text: JSON.stringify({ error: error.message, code }) }],
  isError: true,
};
```

### 1.5 Logging -- `logTool()` in Every Handler

Every tool handler calls `logTool()` at entry, success exit, and error catch. Never `console.log` -- use the structured logger via `ctx.mcpReq.log`.

```typescript
async (args, ctx): Promise<CallToolResult> => {
  logTool(ctx, "info", { tool: "health_list", args }, "Starting health_list");
  try {
    // ...
    logTool(ctx, "info", { tool: "health_list", count: result.data.length }, "health_list complete");
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  } catch (error) {
    logTool(ctx, "error", { tool: "health_list", error: String(error) }, "health_list failed");
    // ...
  }
}
```

### 1.6 Error Handling -- AppError + getJsonRpcCode

All tool handlers catch `AppError` and convert the internal `ErrorCode` to a JSON-RPC code via `getJsonRpcCode()`. Never return hardcoded error codes -- always use the factory.

```typescript
import { AppError, getJsonRpcCode } from "@/shared/errors/error-factory.ts";

if (error instanceof AppError) {
  const code = getJsonRpcCode(error.code);
  return { content: [{ type: "text", text: JSON.stringify({ error: error.message, code }) }], isError: true };
}
// Fallback for non-AppError:
return { content: [{ type: "text", text: JSON.stringify({ error: "Unknown error", code: -32603 }) }], isError: true };
```

### 1.7 Protocol Version

Use `"2025-11-25"` in all initialize requests. This is the latest stable version. Also supported: `"2025-03-26"`.

```typescript
protocolVersion: "2025-11-25",
```

### 1.8 Authentication

All `/mcp` requests require a valid Supabase JWT Bearer token. The middleware (`mcpAuthMiddleware`) checks the `Authorization: Bearer <token>` header and calls `verifySupabaseJwt()` to validate. Anonymous/failed tokens return HTTP 401.

Public endpoints (`/health`, `/ready`) require no auth.

### 1.9 CORS

Origins are configured via the `ALLOWED_ORIGINS` environment variable (comma-separated). Defaults to `"*"` (allow all). When set to specific origins, the `originValidationMiddleware` enforces DNS rebinding protection per MCP spec.

### 1.10 Session Lifecycle

- **New request (no session ID)** -> create new session with fresh transport + server
- **Request with valid session ID** -> reuse existing session, update `lastActivity`
- **Request with unknown session ID** -> reject with HTTP 400
- **Uninitialized session > 30s** -> evicted by sweeper
- **Idle session > 5 minutes** -> evicted by sweeper
- **Max concurrent sessions** -> 100 (evicts oldest idle on overflow)

---

## Adding a New Module (Step-by-Step)

Every new module follows the SSOT principle: schemas in DTO, logic in Service, MCP bindings in `.mcp.tool.ts` / `.mcp.resource.ts`.

1. **Create `modules/<name>/<name>.dto.ts`** with DTO schemas (the SSOT for all validation)
   - Define `HealthCreateSchema`, `HealthUpdateSchema`, `HealthQuerySchema`, etc. using `createDto()` from `dto-builder.ts`
2. **Create `modules/<name>/<name>.mcp.tool.ts`** with `register<Name>Tools(server)`
   - Import and reuse DTO schemas (do NOT redefine)
   - Derive tool-specific variants (e.g., string datetime instead of Date) using Zod operations
3. **Create `modules/<name>/<name>.mcp.resource.ts`** with `register<Name>Resources(server)` (optional)
4. **Create `modules/<name>/<name>.mcp.ts`** as backward-compatible re-exports:
   ```typescript
   export { registerHealthTools } from "./health.mcp.tool.ts";
   export { registerHealthResources } from "./health.mcp.resource.ts";
   ```
5. **Register in `createMcpServer()`** in both `app.mcp.ts` and `mcp-hono.ts`:
   ```typescript
   import { registerHealthTools } from "./modules/health/health.mcp.tool.ts";
   import { registerHealthResources } from "./modules/health/health.mcp.resource.ts";
   registerHealthTools(server);
   registerHealthResources(server);
   ```
6. **Add test file** in `modules/<name>/tests/<name>.mcp.test.ts` using helpers from `setup-mcp.ts`
7. **Run `deno check --all-source`** to verify types

---

## File Map

```
backend/src/
+-- app.mcp.ts                         # Production MCP server entry point
+-- shared/utils/
|   +-- mcp-hono.ts                    # SSOT: app factory, transport factory, getOrCreateSession
|   +-- test/
|       +-- setup-mcp.ts               # Test setup + reusable helpers (callTool, initializeSession)
+-- middlewares/
|   +-- mcp.middleware.ts              # requestId, requestLog, originValidation, mcpAuth
+-- types/
|   +-- mcp-context.ts                # McpToolContext, logTool helper
+-- modules/health/
|   +-- health.mcp.ts                 # DEPRECATED: backward-compatible re-exports only
|   +-- health.mcp.tool.ts            # SSOT: registerHealthTools() + tool input types
|   +-- health.mcp.resource.ts        # SSOT: registerHealthResources()
|   +-- health.service.ts             # Business logic
|   +-- health.dto.ts                 # SSOT: DTO schemas (createDto, query, params)
|   +-- tests/health.mcp.test.ts      # Integration tests
+-- shared/errors/
    +-- error-code.ts                 # ERROR_CODE enum
    +-- error-factory.ts              # AppError class, getJsonRpcCode()
```
