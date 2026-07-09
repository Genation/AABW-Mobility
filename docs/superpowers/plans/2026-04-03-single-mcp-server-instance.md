# MCP Server Single Instance Refactor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `app.mcp.ts` để dùng single `McpServer` instance thay vì tạo mới mỗi session. Transport vẫn được tách theo session.

**Architecture:** Một `McpServer` instance được tạo 1 lần lúc startup, đăng ký tất cả tools/resources 1 lần duy nhất. Mỗi session chỉ tạo `WebStandardStreamableHTTPServerTransport` riêng, nhưng reuse server đã registered. `SessionEntry` bỏ field `server`, chỉ giữ `transport` + metadata.

**Tech Stack:** TypeScript, MCP SDK, Hono, Deno

---

## File Change Map

- **Modify:** `backend/src/app.mcp.ts` — refactor session management, tách server creation khỏi session creation
- **Unchanged:** `modules/health/health.mcp.tool.ts` — chỉ export function, không cần sửa
- **Unchanged:** `modules/health/health.mcp.resource.ts` — chỉ export function, không cần sửa
- **Unchanged:** Tất cả test files — vì registration logic không đổi, test vẫn pass

---

### Task 1: Refactor `app.mcp.ts` — Single Server + Transport-per-Session

**Files:**
- Modify: `backend/src/app.mcp.ts:44-103` (SessionEntry + create functions)
- Modify: `backend/src/app.mcp.ts:115-182` (getOrCreateSession)
- Modify: `backend/src/app.mcp.ts:444-467` (server startup)

- [ ] **Step 1: Thay đổi SessionEntry interface — bỏ field `server`**

Tìm và thay thế `SessionEntry` interface (dòng 44-50):

```typescript
// OLD (dòng 44-50):
interface SessionEntry {
  transport: WebStandardStreamableHTTPServerTransport;
  server: McpServer;
  createdAt: number;
  lastActivity: number;
  initialized: boolean;
}

// NEW:
interface SessionEntry {
  transport: WebStandardStreamableHTTPServerTransport;
  createdAt: number;      // Date.now() when session was created
  lastActivity: number;   // Date.now() of last handled request
  initialized: boolean;   // true once server reaches initialized state
}
```

- [ ] **Step 2: Viết lại `buildMcpServer()` — factory không còn là factory**

Thay thế hàm `createMcpServer()` (dòng 67-88) bằng `buildMcpServer()` trả về `McpServer` singleton dùng chung cho tất cả session:

```typescript
/**
 * Builds a single McpServer instance with all tools & resources registered.
 * Called ONCE at startup — NOT per session.
 */
function buildMcpServer(): McpServer {
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
```

- [ ] **Step 3: Viết lại `getOrCreateSession()` — chỉ tạo transport mới**

Thay thế toàn bộ body của `getOrCreateSession()` (dòng 115-182) — bỏ `createMcpServer()` bên trong, dùng module-level `mcpServer`:

```typescript
// Module-level singleton — created once at startup
let mcpServer: McpServer | null = null;

async function getOrCreateSession(
  sessionId: string | null,
): Promise<SessionEntry> {
  if (sessionId && sessionRegistry.has(sessionId)) {
    const entry = sessionRegistry.get(sessionId)!;
    entry.lastActivity = Date.now();
    return entry;
  }

  if (sessionId) {
    throw new Error("Session not found. Client must re-initialize.");
  }

  const registryKey = crypto.randomUUID();

  // Hard cap — evict oldest idle session
  if (sessionRegistry.size >= SESSION_MAX_COUNT) {
    let oldest: [string, SessionEntry] | null = null;
    for (const pair of sessionRegistry) {
      if (!oldest || pair[1].lastActivity < oldest[1].lastActivity) {
        oldest = pair;
      }
    }
    if (oldest) {
      await oldest[1].transport.close();
      logger.warn(
        { evictedSessionId: oldest[0], count: sessionRegistry.size },
        "Session evicted due to max session cap",
      );
    }
  }

  const entry: SessionEntry = {
    transport: null!, // assigned below
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

  // Connect the SINGLE server instance to this transport
  await mcpServer!.connect(transport);

  sessionRegistry.set(registryKey, entry);

  const originalClose = transport.close.bind(transport);
  transport.close = async () => {
    await originalClose();
    sessionRegistry.delete(registryKey);
  };

  startSessionSweeper();

  return entry;
}
```

- [ ] **Step 4: Cập nhật startup — tạo `mcpServer` 1 lần trước khi buildApp**

Thay thế block `if (import.meta.main)` (dòng 444-465):

```typescript
if (import.meta.main) {
  // Create single McpServer instance ONCE
  mcpServer = buildMcpServer();

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
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/app.mcp.ts
git commit -m "refactor: single McpServer instance reused across sessions"
```

---

### Task 2: Chạy tests để verify

**Files:**
- Test: `backend/src/modules/health/tests/health.mcp.test.ts`
- Test: `backend/src/modules/api-key/tests/api-key.mcp-auth.test.ts`
- Test: `backend/src/modules/api-key/tests/api-key.api.test.ts`

- [ ] **Step 1: Chạy health MCP test**

Run: `cd backend && deno test src/modules/health/tests/health.mcp.test.ts -v`
Expected: PASS

- [ ] **Step 2: Chạy api-key tests**

Run: `cd backend && deno test src/modules/api-key/tests/ -v`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: verify single server refactor"
```

---

## Self-Review Checklist

1. **Spec coverage:** Tất cả thay đổi nằm trong `app.mcp.ts`. `SessionEntry` bỏ `server` field — session entry chỉ giữ transport. `getOrCreateSession` không còn tạo `createMcpServer()` — đúng theo plan.
2. **Placeholder scan:** Không có TBD/TODO. Tất cả code đều cụ thể.
3. **Type consistency:** `mcpServer` là `McpServer | null`, checked với `!` trước `connect()`. Transport vẫn được tạo mới mỗi session — đúng.
4. **Backup:** Không cần file backup vì chỉ modify 1 file, git history đủ để revert.

---

## Summary of Changes

| Trước | Sau |
|-------|-----|
| `createMcpServer()` gọi mỗi session | `buildMcpServer()` gọi 1 lần lúc startup |
| `SessionEntry.server` tồn tại | `SessionEntry` chỉ còn `transport` |
| `registerHealthTools/Resources` gọi N lần | `registerHealthTools/Resources` gọi 1 lần |
| 1 McpServer per session | 1 McpServer dùng chung, N transports |

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-03-single-mcp-server-instance.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** — Dispatch fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**