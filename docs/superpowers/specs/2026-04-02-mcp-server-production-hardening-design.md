# MCP Server — Production Hardening

> **Spec version:** 2.0.1
> **Date:** 2026-04-02
> **Author:** Agent
> **Status:** Draft

---

## 1. Context

This MCP server (`geo-tools-mcp-server`) wraps the existing health CRUD API as MCP tools, enabling AI clients (Cursor, Claude Desktop, custom) to manage health records via the Model Context Protocol.

**Current state (v2.0.1):**
- ✅ 6 health tools implemented (`health_list`, `health_create`, `health_get`, `health_update`, `health_delete`, `health_gap_test`)
- ✅ Stateful transport mode with session IDs
- ✅ Single-instance server+transport reused across requests
- ✅ Real integration tests with no mocks
- ❌ **No auth** — any client can call any tool
- ❌ **Wildcard CORS** — `origin: "*"` in production
- ⚠️ Logging capability declared but not used in handlers
- ⚠️ Test initialization uses legacy protocol version `2025-03-26` instead of `2025-11-25`
- ⚠️ MCP-Protocol-Version header not validated
- ⚠️ All JSON-RPC errors hardcoded to `-32603` (should distinguish not-found vs validation)

**Decision context:** MCP spec `2025-11-25` requires Origin validation and recommends auth. The server is production-ready for internal use, but these two gaps block external exposure.

---

## 2. Goals

1. Wire Supabase JWT auth to the MCP endpoint — unauthenticated requests return 401
2. Replace CORS wildcard `origin: "*"` with environment-based `ALLOWED_ORIGINS`
3. Add MCP-Protocol-Version header validation — unsupported versions return 400
4. Integrate `ctx.mcpReq.log()` in all tool handlers (logging capability is declared)
5. Update test initialization to `protocolVersion: "2025-11-25"`
6. Map JSON-RPC error codes correctly (`-32601` for not-found, `-32602` for invalid params, `-32603` for internal)
7. Validate spec coverage — no orphaned requirements

---

## 3. Non-Goals

- Migrating to `@hono/mcp` (keep SDK native until `@hono/mcp` hits v1.0)
- Unified single-server architecture (out of scope for this plan)
- Adding new tools or changing existing tool signatures
- Changing the `structuredContent` local extension (out of scope)
- 100% test coverage refactoring (existing tests are sufficient)

---

## 4. User Stories

### US-1: AI Client calls MCP tool with valid token
**Given** an AI client (Cursor/Claude) with a valid Supabase JWT Bearer token
**When** it sends a `health_list` tool call to `POST /mcp` with `Authorization: Bearer <token>`
**Then** the server validates the token, executes the tool, and returns the result with 200/202

### US-2: AI Client calls MCP tool without token
**Given** a client sends a tool call with no `Authorization` header
**When** the server receives the request
**Then** it returns HTTP 401 with JSON-RPC error `{ "error": { "code": -32001, "message": "Unauthorized" } }`

### US-3: AI Client calls from disallowed origin
**Given** `ALLOWED_ORIGINS` is set to `https://cursor.com,https://anthropic.com`
**When** a request arrives with `Origin: https://evil.com`
**Then** the server returns HTTP 403 Forbidden

### US-4: MCP client uses wrong protocol version
**Given** a client sends `MCP-Protocol-Version: 2024-11-05` (deprecated)
**When** the server processes the request
**Then** it returns HTTP 400 Bad Request

### US-5: Tool handler logs execution
**Given** a tool is called successfully
**When** it executes
**Then** it emits structured log via `ctx.mcpReq.log("info", ...)` at entry and exit

### US-6: Not-found returns correct error code
**Given** a client calls `health_get` with `id: 999999` (does not exist)
**When** the server processes the request
**Then** the JSON-RPC error code is `-32601` (not found), not `-32603`

---

## 5. Architecture

### 5.1 Current Architecture (two processes)

```
Terminal 1: deno task mcp  →  :3101/mcp  (MCP server, app.mcp.ts)
Terminal 2: deno task dev  →  :3100/api/v1/health  (REST API, app.ts)
```

MCP server and REST API are separate processes. Both use Hono but are independent deployments.

### 5.2 Security Architecture (changes in this plan)

```
Request
   │
   ▼
CORS middleware ──── origin check ──── 403 if disallowed
   │
   ▼
Auth middleware ──── Bearer token verify ──── 401 if missing/invalid
   │
   ▼
MCP Protocol Version header check ──── 400 if unsupported
   │
   ▼
transport.handleRequest(c) ──── MCP JSON-RPC processing
   │
   ▼
Tool handler ──── ctx.mcpReq.log() on entry/exit/error
   │
   ▼
Health service → health repo → Supabase PostgreSQL
```

### 5.3 Auth Integration Strategy

The existing `auth.middleware.ts` uses `@supabase/supabase-js` to verify JWT Bearer tokens. It cannot be directly applied as Hono middleware to the MCP endpoint because MCP's `initialize` request flow is special.

**Decision: Inline auth check in MCP handler (Option A from spec)**

```typescript
// In app.mcp.ts POST /mcp handler
app.post("/mcp", async (c) => {
  const requestId = c.get("requestId") || crypto.randomUUID();

  // ── Auth check ──────────────────────────────────────────────
  // MCP initialize request doesn't carry auth — token is on HTTP header
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) {
    const errorId = await getRequestId(c).catch(() => null);
    return c.json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized" },
      id: errorId ?? undefined,
    }, 401);
  }

  try {
    // Verify token against Supabase
    const user = await verifyJwt(token);
    c.set("user", user);
  } catch {
    const errorId = await getRequestId(c).catch(() => null);
    return c.json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized" },
      id: errorId ?? undefined,
    }, 401);
  }
  // ────────────────────────────────────────────────────────────

  // Continue with transport.handleRequest...
});
```

**Why not Option B (route-based)?** Would require restructuring the MCP handler architecture. Option A is surgical — add auth before transport dispatch.

### 5.4 CORS Strategy

```typescript
// Environment-based, matches MCP spec mandate
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "*")
  .split(",")
  .map((s) => s.trim());

app.use("*", cors({
  origin: ALLOWED_ORIGINS.length > 1 ? ALLOWED_ORIGINS : ALLOWED_ORIGINS[0],
  allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  // ... other headers
}));

// Enforce Origin per MCP spec
app.use("*", async (c, next) => {
  const origin = c.req.header("origin");
  if (
    origin &&
    ALLOWED_ORIGINS !== "*" &&
    !ALLOWED_ORIGINS.includes(origin)
  ) {
    return c.json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Forbidden" },
    }, 403);
  }
  await next();
});
```

### 5.5 Protocol Version Strategy

```typescript
const SUPPORTED_VERSIONS = ["2025-11-25", "2025-03-26"];

app.post("/mcp", async (c) => {
  const protoVersion = c.req.header("mcp-protocol-version");
  if (protoVersion && !SUPPORTED_VERSIONS.includes(protoVersion)) {
    return c.json({
      jsonrpc: "2.0",
      error: { code: -32000, message: `Unsupported protocol version: ${protoVersion}` },
    }, 400);
  }
  // ...
});
```

---

## 6. Error Code Mapping

| Error Type | HTTP | JSON-RPC Code | Trigger |
|---|---|---|---|
| Unauthorized | 401 | `-32001` | Missing or invalid Bearer token |
| Forbidden | 403 | `-32000` | Origin not in ALLOWED_ORIGINS |
| Bad Request | 400 | `-32000` | Unsupported MCP-Protocol-Version |
| Invalid params | 200 | `-32602` | Zod validation failure in tool |
| Not found | 200 | `-32601` | Record ID not in database |
| Internal error | 500 | `-32603` | Unexpected server error |

**Note:** Tool execution errors return HTTP 200 with `isError: true` in `CallToolResult` (per SEP-1303). Protocol-level errors return non-200 HTTP status.

---

## 7. File Changes

| File | Action | Responsibility |
|---|---|---|
| `backend/src/app.mcp.ts` | Modify | Add auth check, CORS env vars, protocol version header, MCP logging, error code mapping |
| `backend/src/modules/health/health.mcp.ts` | Modify | Add `ctx.mcpReq.log()` calls in all 6 tool handlers |
| `backend/src/modules/health/tests/health.mcp.test.ts` | Modify | Update protocolVersion to `2025-11-25`, add auth test cases, add CORS test cases |
| `backend/src/configs/env.ts` | Modify | Add `ALLOWED_ORIGINS` env var definition |
| `backend/src/shared/errors/error-code.ts` | Modify | Add `UNAUTHORIZED`, `FORBIDDEN` error codes |
| `backend/src/shared/errors/error-factory.ts` | Modify | Wire new error codes, map to correct JSON-RPC codes |

---

## 8. API Reference

### 8.1 MCP Endpoint Behavior (POST /mcp)

**Request headers required:**
```
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
Accept: application/json, text/event-stream
mcp-session-id: <uuid>          (after init, required on all requests)
MCP-Protocol-Version: 2025-11-25  (optional, validated if present)
```

**Response on missing auth:**
```json
HTTP 401
{
  "jsonrpc": "2.0",
  "error": { "code": -32001, "message": "Unauthorized" }
  // id field omitted (not null) per JSON-RPC 2.0 spec
}
```

### 8.2 Implemented Tools

| Tool | Input Schema | Description |
|---|---|---|
| `health_list` | `{ query?, limit?, latestAt? }` | Paginated list |
| `health_create` | `{ data: Record<string, unknown> }` | Create record |
| `health_get` | `{ id: number }` | Get by ID |
| `health_update` | `{ id: number, data? }` | Update record |
| `health_delete` | `{ id: number }` | Delete record |
| `health_gap_test` | `{ id: number }` | Calculate time gap |

### 8.3 Logging in Tool Handlers

```typescript
// Pattern for all tools
server.registerTool("health_list", {
  title: "List Health Records",
  description: "...",
  inputSchema: HealthListInputSchema,
}, async (args, ctx): Promise<CallToolResult> => {
  ctx.mcpReq.log("info", { tool: "health_list", args }, "Starting health list");

  try {
    const result = await healthService.findMany(args);
    ctx.mcpReq.log("info", { count: result.data.length }, "Health list complete");
    return successResult(result);
  } catch (error) {
    ctx.mcpReq.log("error", { error: String(error) }, "Health list failed");
    if (error instanceof AppError && error.code === ERROR_CODE.NOT_FOUND) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: error.message }) }],
        isError: true,
      };
    }
    return errorResult(
      error instanceof Error ? error.message : "Unknown error",
      "HEALTH_LIST_ERROR",
    );
  }
});
```

---

## 9. Testing

### 9.1 Test Scope

All existing tests run via `deno task mcp:test` and `deno task test`. No new test files needed.

### 9.2 New Test Cases

| Test | Description |
|---|---|
| `MCP health_list — rejects request without Authorization header` | Returns HTTP 401 |
| `MCP health_create — rejects request with invalid token` | Returns HTTP 401 |
| `MCP tools — reject disallowed Origin` | Returns HTTP 403 |
| `MCP initialize — accepts protocolVersion 2025-11-25` | Returns 200 |
| `MCP initialize — rejects unsupported protocolVersion` | Returns HTTP 400 |
| `MCP health_get — returns -32601 for not-found` | JSON-RPC code `-32601` |
| `MCP health_list — logs entry and exit` | Log output present |

### 9.3 Test Fixtures

Test user (already in `setup-mcp.ts`):
- ID: `b82303fb-7bd8-4de9-8f01-037442724252`
- Email: `admin-test@example.com`
- Token: fetched from Supabase in `setupMcpTestApp()`

---

## 10. Spec Reference URLs

| Priority | URL | Use |
|---|---|---|
| 🔴 Critical | `modelcontextprotocol.io/specification/2025-11-25/basic/transports.md` | Transport, security requirements |
| 🔴 Critical | `modelcontextprotocol.io/specification/2025-11-25/server/tools.md` | Tool definitions, CallToolResult |
| 🟡 High | `modelcontextprotocol.io/specification/2025-11-25/basic/authorization.md` | Auth framework |
| 🟡 High | `modelcontextprotocol.io/seps/1303-input-validation-errors-as-tool-execution-errors.md` | SEP-1303 error distinction |
| 🟡 High | `modelcontextprotocol.io/specification/2025-11-25/schema.md` | Error code values |

---

## 11. Open Questions

| # | Question | Decision |
|---|---|---|
| OQ-1 | Should auth be skipped for `initialize` request (MCP spec pattern)? | **No** — all requests including initialize should require auth. AI clients can send initialize without knowing the user identity, but tool calls must be authenticated. |
| OQ-2 | Should `ALLOWED_ORIGINS` default to `"*"` or `""`? | **`"localhost"` for dev, `"*"` for dev env** — dev env defaults to open, prod must set explicitly. |
| OQ-3 | Should error responses include the request ID in the `id` field? | **Yes** — JSON-RPC spec requires echoing ID if parseable, omitting if not. Avoid `null`. |

---

## 12. Environment Variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `ALLOWED_ORIGINS` | `string` | `"*"` | Comma-separated list of allowed origins (no spaces). `"*"` means allow all. |
| `MCP_HOST` | `string` | `"0.0.0.0"` | Host to bind to. MCP spec recommends `"127.0.0.1"` for local dev. |
| `MCP_PORT` | `number` | `3100 + 1` | Port for MCP server (currently `3101`). |
| `SUPABASE_URL` | `string` | — | Required. Supabase project URL. |
| `SUPABASE_SECRET_KEY` | `string` | — | Required (admin key for test user creation). |
| `JWT_SECRET` | `string` | — | Optional. Used by `verifyJwt` for custom JWT validation. |

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Auth check breaks existing test suite | Medium | High | All existing tests use Supabase token from `setupMcpTestApp()` — they will pass. Only add new negative tests. |
| CORS change blocks local development | Low | Medium | Default `ALLOWED_ORIGINS="*"` preserves existing behavior |
| Protocol version check blocks older MCP clients | Low | Medium | Allow fallback `2025-03-26` — both versions supported |
| `ctx.mcpReq.log()` not available in older SDK | Low | Low | Already on `@modelcontextprotocol/sdk@^1.0.0` — confirmed available |
