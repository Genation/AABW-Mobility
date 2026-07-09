# MCP Server — Testing

> **Runtime:** Deno | **Test Framework:** Built-in `Deno.test` | **Setup:** `setup-mcp.ts`

---

## 1. Test Setup Architecture

Tests use a **real integration** approach — no mocks, no stubs. Each test starts a dedicated MCP server instance with a real Supabase connection. Sessions are isolated via an in-memory registry.

```
Test flow:
setupMcpTestApp()   → starts test server on random port
  → ensures test user exists in Supabase
  → fetches access token
  → returns fetchClient + token

Per test:
initializeSession() → full MCP handshake (init + notification/initialized)
  → returns sessionId (mcp-session-id header value)

Per tool call:
callTool()          → POST /mcp with sessionId
callToolOk()        → callTool + assert 200/202
```

---

## 2. Core Helpers (from `setup-mcp.ts`)

These are exported from `backend/src/shared/utils/test/setup-mcp.ts` and should be used in all MCP test files.

### `setupMcpTestApp()`

Creates a full test MCP server. Call once per test file (or per test suite if sharing the same server is acceptable).

```typescript
import { setupMcpTestApp } from "@/shared/utils/test/setup-mcp.ts";

Deno.test({
  name: "health_list returns records",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const app = await setupMcpTestApp();
    try {
      // test code...
    } finally {
      await app.close();
    }
  },
});
```

Returns `McpTestAppInstance`:
```typescript
{
  token: string;      // Supabase JWT for the test user
  fetchClient: <T>(path, options?, token?) => Promise<McpFetchClientResponse<T>>;
  port: number;
  baseUrl: string;
  close: () => Promise<void>;
}
```

### `createMcpRequest(method, params?, id?)`

Builds a JSON-RPC 2.0 request object. Use `id` only for requests that need a response ID. Omit `id` for notifications.

```typescript
// Request with id
createMcpRequest("initialize", { protocolVersion: "2025-11-25" }, 1)
// → { jsonrpc: "2.0", method: "initialize", params: {...}, id: 1 }

// Notification (no id)
createMcpRequest("notifications/initialized", {})
// → { jsonrpc: "2.0", method: "notifications/initialized", params: {} }
```

### `initializeSession(fetchClient, token)`

Performs the full MCP initialize handshake and returns the `mcp-session-id` header value.

```typescript
const sid = await initializeSession(app.fetchClient, app.token);
// sid is the session ID to include in all subsequent tool call headers
```

### `callTool(fetchClient, toolName, args, sessionId, token)`

Sends a JSON-RPC `tools/call` request. Returns the raw `McpFetchClientResponse`.

```typescript
const response = await callTool(app.fetchClient, "health_list", { limit: 5 }, sid, app.token);
// response: { status: number, data: unknown, response: Response }
```

### `callToolOk(fetchClient, toolName, args, sessionId, token)`

Same as `callTool` but asserts HTTP 200/202 and JSON-RPC 2.0. Use for happy-path tests.

```typescript
const response = await callToolOk(app.fetchClient, "health_list", { limit: 5 }, sid, app.token);
// response: { status: number, data: Record<string, unknown>, response: Response }
```

---

## 3. Test File Structure

Each module has its own test file at `modules/<name>/tests/<name>.mcp.test.ts`. The test file imports helpers from `setup-mcp.ts` and does not redefine them.

```typescript
/**
 * @ts-nocheck  (if needed — full type refactor is a future task)
 */
import { assertEquals } from "@std/assert";
import {
  setupMcpTestApp,
  initializeSession,
  callTool,
  callToolOk,
  createMcpRequest,
} from "@/shared/utils/test/setup-mcp.ts";

Deno.test({
  name: "health_list returns records within limit",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const app = await setupMcpTestApp();
    try {
      const sid = await initializeSession(app.fetchClient, app.token);
      const response = await callToolOk(app.fetchClient, "health_list", { limit: 5 }, sid, app.token);

      const result = response.data.result as Record<string, unknown>;
      assertEquals(result.structuredContent?.hasMore !== undefined, true);
    } finally {
      await app.close();
    }
  },
});
```

---

## 4. Session Management Rules

### One Session Per Test

Each `Deno.test` should call `initializeSession()` at the start. Do not reuse session IDs across tests — each test gets its own session.

### Sanitize Flags

MCP tests hold long-running resources (HTTP servers, network connections). Always set:

```typescript
Deno.test({
  name: "...",
  sanitizeResources: false,  // MCP server holds resources
  sanitizeOps: false,       // Network ops may not close cleanly
  async fn() { ... }
});
```

### Always Close the Server

Wrap test logic in `try { ... } finally { await app.close(); }` to ensure the test server is torn down even if the test fails.

---

## 5. Auth Testing

The test server requires a valid token on `/mcp` requests. The `setupMcpTestApp()` ensures this by checking auth before delegating to the transport.

To test auth rejection:

```typescript
// Call without token
const response = await mcpTestApp.fetchClient("/mcp", {
  method: "POST",
  body: JSON.stringify(createMcpRequest("tools/call", { name: "health_list", arguments: {} })),
  headers: { "Content-Type": "application/json" },
}); // no token passed

assertEquals(response.status, 401);
assertEquals(response.data?.error?.code, -32001);
```

---

## 6. Protocol Version

Always use `"2025-11-25"` in initialize requests:

```typescript
createMcpRequest("initialize", {
  protocolVersion: "2025-11-25",
  capabilities: {},
  clientInfo: { name: "test-client", version: "1.0.0" },
}, 1);
```

---

## 7. Running Tests

```bash
# MCP integration tests
deno task mcp:test

# All tests (including unit tests)
deno task test

# Type check
deno check --all-source backend/src/

# Lint
deno lint backend/src/

# Format check
deno fmt --check backend/src/
```

---

## 8. Test Database State

Tests operate against the **real Supabase database** (staging or local). No test data is created in `setupMcpTestApp()`. Tests that need specific data should:

1. Create data at the start of the test
2. Use the data within the test
3. Clean up (optional — test data can be left for investigation)

```typescript
// Example: create a record for testing
const createResponse = await callToolOk(app.fetchClient, "health_create", {
  data: { test: "value" },
}, sid, app.token);

const created = createResponse.data.result as Record<string, unknown>;
const recordId = (created.structuredContent as Record<string, unknown>).id as number;

// Then test get/update/delete with this ID
```

---

## 9. Deferred Issues

| Issue | Status | Notes |
|---|---|---|
| `@ts-nocheck` on test file | Deferred | Removing requires full type refactor of the test file |
| Inline session management in `app.mcp.ts` vs. shared in test | Working | Both patterns are valid — production uses inline, test uses shared |