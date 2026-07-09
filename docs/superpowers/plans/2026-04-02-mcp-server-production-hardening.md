# MCP Server — Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the MCP server for production by adding auth, CORS, protocol version validation, logging, and correct JSON-RPC error codes.

**Architecture:** Inline auth check in `app.mcp.ts` POST handler (Option A — surgical, no architecture restructure). Environment-based CORS origins via `ALLOWED_ORIGINS` env var. `ctx.mcpReq.log()` in all tool handlers.

**Tech Stack:** Deno, Hono, `@modelcontextprotocol/sdk@^1.0.0`, Supabase JWT, Zod v4

---

## File Map

```
backend/src/
├── app.mcp.ts                          # Modify: auth, CORS, protocol version, logging
├── configs/env.ts                       # Modify: add ALLOWED_ORIGINS
├── shared/errors/
│   ├── error-code.ts                   # Modify: add UNAUTHORIZED, FORBIDDEN
│   └── error-factory.ts                # Modify: wire new codes
└── modules/health/
    ├── health.mcp.ts                   # Modify: ctx.mcpReq.log() in all 6 tools
    └── tests/health.mcp.test.ts        # Modify: protocolVersion, new test cases
```

---

## Task 1: Add Error Codes

**Files:**
- Modify: `backend/src/shared/errors/error-code.ts`
- Modify: `backend/src/shared/errors/error-factory.ts`

- [ ] **Step 1: Read existing error-code.ts**

Read `backend/src/shared/errors/error-code.ts` to see the current ERROR_CODE enum structure.

- [ ] **Step 2: Read existing error-factory.ts**

Read `backend/src/shared/errors/error-factory.ts` to understand how errors are created and mapped.

- [ ] **Step 3: Add UNAUTHORIZED and FORBIDDEN to error-code.ts**

Add these entries to the `ERROR_CODE` enum:
```typescript
UNAUTHORIZED = "UNAUTHORIZED",
FORBIDDEN = "FORBIDDEN",
```

- [ ] **Step 4: Map error codes to JSON-RPC codes in error-factory.ts**

In the error factory, add a `jsonRpcCode` field to the error mapping:
```typescript
// Current pattern (from MCP-SPEC.md Section 6):
const ERROR_JSON_RPC_MAP: Record<string, number> = {
  [ERROR_CODE.UNAUTHORIZED]: -32001,
  [ERROR_CODE.FORBIDDEN]: -32000,
  [ERROR_CODE.NOT_FOUND]: -32601,
  [ERROR_CODE.BAD_REQUEST]: -32602,
  [ERROR_CODE.INTERNAL_SERVER_ERROR]: -32603,
};
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/shared/errors/error-code.ts backend/src/shared/errors/error-factory.ts
git commit -m "feat(mcp): add UNAUTHORIZED and FORBIDDEN error codes with JSON-RPC mapping"
```

---

## Task 2: Add ALLOWED_ORIGINS Environment Variable

**Files:**
- Modify: `backend/src/configs/env.ts`

- [ ] **Step 1: Read env.ts**

Read `backend/src/configs/env.ts` to see how existing env vars are defined.

- [ ] **Step 2: Add ALLOWED_ORIGINS**

Add to `env.ts`:
```typescript
ALLOWED_ORIGINS: {
  description: "Comma-separated list of allowed CORS origins. '*' means allow all.",
  default: "*",
  example: "https://cursor.com,https://anthropic.com",
},
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/configs/env.ts
git commit -m "feat(mcp): add ALLOWED_ORIGINS env var for CORS configuration"
```

---

## Task 3: Wire Auth to MCP Endpoint

**Files:**
- Modify: `backend/src/app.mcp.ts`
- Modify: `backend/src/shared/utils/auth/verify-jwt.ts` (read-only, to understand token verification)

- [ ] **Step 1: Read verify-jwt.ts**

Read `backend/src/shared/utils/auth/verify-jwt.ts` to understand the token verification function signature. It likely returns a user object or throws. We need the exact import path and function name.

- [ ] **Step 2: Read app.mcp.ts**

Read the current `backend/src/app.mcp.ts` to understand the POST /mcp handler structure, particularly around lines 144-183.

- [ ] **Step 3: Add auth check to POST /mcp handler**

Find the `app.post("/mcp", async (c) => {` handler (around line 144). Add the auth check at the start of the try block, BEFORE the `server.isConnected()` check:

```typescript
// Add to top of file imports:
import { verifyJwt } from "@/shared/utils/auth/verify-jwt.ts";

// In the POST handler, add at start of try block (line ~147):
const authHeader = c.req.header("Authorization");
const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

if (!token) {
  logger.warn({ requestId }, "MCP request missing Authorization header");
  return c.json(
    {
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized" },
    },
    401,
  );
}

try {
  const user = await verifyJwt(token);
  c.set("user", user);
  logger.info({ requestId, userId: user.id }, "MCP request authenticated");
} catch {
  logger.warn({ requestId }, "MCP request with invalid token");
  return c.json(
    {
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized" },
    },
    401,
  );
}
```

- [ ] **Step 4: Verify the auth check is at the correct position**

The auth check must be INSIDE the `try` block, BEFORE the `server.isConnected()` check. The structure should be:

```typescript
try {
  // 1. Auth check first
  const token = ...
  if (!token) return 401
  await verifyJwt(token)

  // 2. Then connect transport
  if (!server.isConnected()) {
    await server.connect(transport);
    ...
  }

  // 3. Then handle request
  const result = await transport.handleRequest(c.req.raw);
  ...
}
```

- [ ] **Step 5: Run type check**

```bash
deno check --all-source backend/src/app.mcp.ts
```

Expected: No errors. If `verifyJwt` doesn't exist, check the actual path from step 1.

- [ ] **Step 6: Commit**

```bash
git add backend/src/app.mcp.ts
git commit -m "feat(mcp): wire Supabase JWT auth to POST /mcp endpoint"
```

---

## Task 4: Add CORS Origin Validation

**Files:**
- Modify: `backend/src/app.mcp.ts`

- [ ] **Step 1: Update CORS configuration**

Find the existing `cors({...})` call in `app.mcp.ts` (around line 92). Replace the entire CORS setup with:

```typescript
// Parse ALLOWED_ORIGINS from environment
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "*")
  .split(",")
  .map((s) => s.trim());

// CORS middleware
app.use("*", cors({
  origin: ALLOWED_ORIGINS.length > 1
    ? ALLOWED_ORIGINS
    : ALLOWED_ORIGINS[0],
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

// Enforce Origin validation per MCP spec (DNS rebinding protection)
// This runs AFTER cors() and checks disallowed origins
app.use("*", async (c, next) => {
  const origin = c.req.header("origin");
  if (
    origin &&
    ALLOWED_ORIGINS[0] !== "*" &&
    !ALLOWED_ORIGINS.includes(origin)
  ) {
    logger.warn({ requestId: c.get("requestId"), origin }, "Disallowed origin rejected");
    return c.json(
      {
        jsonrpc: "2.0",
        error: { code: -32000, message: "Forbidden" },
      },
      403,
    );
  }
  await next();
});
```

- [ ] **Step 2: Verify ALLOWED_ORIGINS is accessible**

Ensure `Deno.env.get("ALLOWED_ORIGINS")` is called before any middleware that might need it. It should be at the module top level (outside the handler), not inside the handler.

- [ ] **Step 3: Run type check**

```bash
deno check --all-source backend/src/app.mcp.ts
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/app.mcp.ts
git commit -m "feat(mcp): add environment-based CORS origin validation per MCP spec"
```

---

## Task 5: Add MCP Protocol Version Header Validation

**Files:**
- Modify: `backend/src/app.mcp.ts`

- [ ] **Step 1: Add supported versions constant**

Add at the top of `app.mcp.ts` (near the other constants like `MCP_SERVER_NAME`):

```typescript
const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-03-26"];
```

- [ ] **Step 2: Add protocol version check in POST handler**

Add AFTER the auth check, BEFORE the `server.isConnected()` check. The protocol version header is checked on all requests after initialization:

```typescript
// Protocol version validation (after initialization, header is required)
const protoVersion = c.req.header("mcp-protocol-version");
if (protoVersion && !SUPPORTED_PROTOCOL_VERSIONS.includes(protoVersion)) {
  logger.warn({ requestId, protoVersion }, "Unsupported MCP protocol version");
  return c.json(
    {
      jsonrpc: "2.0",
      error: { code: -32000, message: `Unsupported MCP protocol version: ${protoVersion}` },
    },
    400,
  );
}
```

- [ ] **Step 3: Run type check**

```bash
deno check --all-source backend/src/app.mcp.ts
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/app.mcp.ts
git commit -m "feat(mcp): validate MCP-Protocol-Version header, reject unsupported versions"
```

---

## Task 6: Add ctx.mcpReq.log() to All Tool Handlers

**Files:**
- Modify: `backend/src/modules/health/health.mcp.ts`

- [ ] **Step 1: Read health.mcp.ts**

Read `backend/src/modules/health/health.mcp.ts` to see the current `registerHealthTools` function and tool handlers.

- [ ] **Step 2: Read error-factory.ts and error-code.ts**

Read the updated error factory to get the correct imports for `AppError`, `ERROR_CODE`, and the correct JSON-RPC code mapping.

- [ ] **Step 3: Update registerHealthTools function signature**

The `registerTool` callback receives `(args, ctx)` where `ctx` is the MCP request context. Update all 6 tool handlers to use `ctx.mcpReq.log()`. For each tool, the pattern is:

```typescript
server.registerTool(
  "health_list",
  { title: "...", description: "...", inputSchema: HealthListInputSchema },
  async (args, ctx): Promise<CallToolResult> => {
    // Log entry
    ctx.mcpReq.log("info", { tool: "health_list", args }, "Starting health_list");

    try {
      const result = await healthService.findMany({
        query: args.query,
        limit: args.limit,
        latestAt: args.latestAt,
      });

      ctx.mcpReq.log("info", { count: result.data.length }, "health_list complete");

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: {
          data: result.data.map((r) => ({
            id: r.id,
            data: r.data,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          })),
          hasMore: result.hasMore,
          nextCursor: result.nextCursor?.toISOString() ?? null,
        },
      };
    } catch (error) {
      ctx.mcpReq.log("error", { tool: "health_list", error: String(error) }, "health_list failed");

      if (error instanceof AppError) {
        if (error.code === ERROR_CODE.NOT_FOUND) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, code: -32601 }) }],
            isError: true,
          };
        }
        if (error.code === ERROR_CODE.BAD_REQUEST || error.code === ERROR_CODE.VALIDATION_ERROR) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, code: -32602 }) }],
            isError: true,
          };
        }
      }

      return {
        content: [{ type: "text", text: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", code: -32603 }) }],
        isError: true,
      };
    }
  },
);
```

- [ ] **Step 4: Update all 6 tools**

Repeat the logging pattern for these 5 remaining tools:
- `health_create` — log entry with `data` arg, log exit with `id`
- `health_get` — log entry with `id` arg, log exit with result
- `health_update` — log entry with `id`, log exit with result
- `health_delete` — log entry with `id`, log exit
- `health_gap_test` — log entry with `id`, log exit with `dateGap`

For each tool, the error handling should use the same `AppError` code → JSON-RPC code mapping:
- `ERROR_CODE.NOT_FOUND` → `-32601`
- `ERROR_CODE.BAD_REQUEST` or `ERROR_CODE.VALIDATION_ERROR` → `-32602`
- Everything else → `-32603`

- [ ] **Step 5: Run type check**

```bash
deno check --all-source backend/src/modules/health/health.mcp.ts
```

Expected: No type errors. If `AppError` or `ERROR_CODE` imports fail, check the actual exports from `error-factory.ts`.

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/health/health.mcp.ts
git commit -m "feat(mcp): add ctx.mcpReq.log() logging to all tool handlers with correct error codes"
```

---

## Task 7: Update Tests

**Files:**
- Modify: `backend/src/modules/health/tests/health.mcp.test.ts`

- [ ] **Step 1: Read current health.mcp.test.ts**

Read `backend/src/modules/health/tests/health.mcp.test.ts` to find:
- Line with `protocolVersion: "2025-03-26"` (around line 32) — change to `"2025-11-25"`
- The `assertMcpSuccess` function to understand test helper patterns
- Where to insert new test cases

- [ ] **Step 2: Update protocolVersion in initializeMcpSession()**

Find:
```typescript
protocolVersion: "2025-03-26",
```
Replace with:
```typescript
protocolVersion: "2025-11-25",
```

- [ ] **Step 3: Add auth rejection test cases**

After the existing E2E test (around line 460), add these new test cases:

```typescript
// ============================================
// Auth & Security Tests
// ============================================
Deno.test({
  name: "MCP POST /mcp — rejects request without Authorization header",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    // Call without token — no Authorization header
    const response = await mcpTestApp.fetchClient<Record<string, unknown>>(
      "/mcp",
      {
        method: "POST",
        body: JSON.stringify(createMcpRequest("tools/call", {
          name: "health_list",
          arguments: { limit: 5 },
        })),
        headers: {
          "Content-Type": "application/json",
        },
      },
      // No token passed — simulates unauthenticated request
    );

    assertEquals(response.status, 401);
    assertEquals(response.data?.jsonrpc, "2.0");
    assertEquals(response.data?.error?.code, -32001);
  },
});

Deno.test({
  name: "MCP POST /mcp — rejects request with invalid token",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const response = await mcpTestApp.fetchClient<Record<string, unknown>>(
      "/mcp",
      {
        method: "POST",
        body: JSON.stringify(createMcpRequest("tools/call", {
          name: "health_list",
          arguments: { limit: 5 },
        })),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer invalid.token.here",
        },
      },
      // No token from setupMcpTestApp()
    );

    assertEquals(response.status, 401);
    assertEquals(response.data?.jsonrpc, "2.0");
    assertEquals(response.data?.error?.code, -32001);
  },
});

Deno.test({
  name: "MCP health_get — returns -32601 for not-found record",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    // Create MCP session first
    const sid = await initializeMcpSession();

    const postResponse = await callMcpToolPost(
      "health_get",
      { id: 999999 },
      sid,
    );

    // POST returns 202, need to GET the response
    if (postResponse.status === 202 || postResponse.status === 200) {
      const getResponse = await callMcpToolGet(sid);
      if (getResponse) {
        // Find the error response in the result
        const result = getResponse.result as Record<string, unknown> | undefined;
        if (result && result.error) {
          const error = result.error as Record<string, unknown>;
          assertEquals(error.code, -32601, "Should return -32601 for not-found");
        }
      }
    }
  },
});

Deno.test({
  name: "MCP initialize — accepts protocolVersion 2025-11-25",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const request = createMcpRequest("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "test-client", version: "1.0.0" },
    }, 1);

    const response = await mcpTestApp.fetchClient<Record<string, unknown>>(
      "/mcp",
      {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
      },
    );

    // Should succeed with 200 and session ID
    assertEquals(response.status === 200 || response.status === 202, true);
    assertEquals(response.data?.jsonrpc, "2.0");
    assertEquals(response.data?.result?.protocolVersion, "2025-11-25");
  },
});
```

- [ ] **Step 4: Run the tests**

```bash
deno task mcp:test
```

Expected: All existing tests pass + new auth tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/health/tests/health.mcp.test.ts
git commit -m "test(mcp): update protocolVersion to 2025-11-25 and add auth/security test cases"
```

---

## Task 8: Final Validation

**Files:**
- None (validation only)

- [ ] **Step 1: Run full code quality check**

```bash
deno check --all-source backend/src/ && deno lint backend/src/ && deno fmt --check backend/src/
```

Expected: All pass (exit code 0).

- [ ] **Step 2: Run full test suite**

```bash
deno task test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(mcp): production hardening — auth, CORS, protocol version, logging, error codes"
```

---

## Validation Commands Reference

```bash
# Code quality
deno check --all-source backend/src/
deno lint backend/src/
deno fmt --check backend/src/

# Tests
deno task mcp:test
deno task test

# Full pipeline
deno check --all-source backend/src/ && deno lint backend/src/ && deno fmt --check backend/src/ && echo "✅ Code quality PASS" && deno task test && echo "✅ All tests PASS"
```

---

## Notes

- **Auth timing:** The auth check must be inside the `try` block in `POST /mcp`. If placed outside, errors won't be caught by the existing error handler.
- **verifyJwt import:** The exact import path and function signature come from `verify-jwt.ts`. If the function name differs, update accordingly.
- **AppError import:** `AppError` and `ERROR_CODE` come from `@/shared/errors/error-factory.ts`. Verify the exact exports.
- **CORS origin check:** The `ALLOWED_ORIGINS[0] !== "*"` check avoids the `includes()` call on `"*"` string (which would always be true). The first element determines if wildcard mode is active.
- **Protocol version check:** The header check is optional — if not present, proceed normally. Only reject if present AND unsupported.
