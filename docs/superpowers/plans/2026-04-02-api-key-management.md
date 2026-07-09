# API Key Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user-controlled API key management to the MCP server so clients (Cursor, Claude Desktop, etc.) can authenticate via a persistent `gtool_sk_...` key instead of a short-lived Supabase JWT.

**Architecture:** API keys are generated as `gtool_sk_` + 32 random bytes (base64url, no padding). The full key is shown exactly once at creation time. Only a bcrypt hash (cost=12) and a 9-char key prefix are stored in the database. Keys use **soft delete** (revoked boolean + revoked_at timestamp) for audit trail. The MCP auth middleware accepts **only** `gtool_sk_` API keys via `X-GEO-API-KEY` header — no JWT verification on MCP endpoints. Supabase JWT is used only for the REST API to create/revoke/list keys. No key expiration, no logging of key usage, unlimited keys per user. API key management is **REST-only** — no MCP tools for api-key (to avoid circular loop: API key is the gateway to MCP).

**Tech Stack:** Drizzle ORM, bcrypt via `bcryptjs`, Supabase JWT verification via `jose`, existing Hono + MCP SDK stack.

---

## File Structure

```
backend/src/modules/api-key/
├── api-key.schema.ts       # Drizzle table: api_keys (id, name, key_hash, key_prefix, user_id, revoked, revoked_at, created_at)
├── api-key.dto.ts          # Zod schemas: create, select, param
├── api-key.repo.ts         # DB queries: create, findByPrefixAndHash, findByUser, revoke (soft delete)
└── api-key.service.ts      # Business logic: create(), list(), revoke(), verify()

backend/src/
├── db/schemas.ts                     # MODIFY: add apiKeyTable export
├── router.ts                         # MODIFY: mount api-key router
├── shared/errors/error-code.ts       # MODIFY: add API_KEY errors
├── shared/errors/error-detail.ts     # MODIFY: add API_KEY messages
└── middlewares/mcp.middleware.ts     # MODIFY: add API key auth branch in mcpAuthMiddleware

Note: No MCP tools for api-key management (REST-only, avoids circular loop).
API key auth is tested via health MCP endpoint (Task 9).
```

---

## Task 1: Add API Key Table Schema

**Files:**
- Create: `backend/src/modules/api-key/api-key.schema.ts`
- Modify: `backend/src/db/schemas.ts`

- [ ] **Step 1: Create the Drizzle table schema**

```typescript
// backend/src/modules/api-key/api-key.schema.ts
import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const apiKeyTable = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 24 }).notNull(), // stores 9-char "gtool_sk_" prefix
  userId: uuid("user_id").notNull(),
  revoked: boolean("revoked").notNull().default(false),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

- [ ] **Step 2: Export from db/schemas.ts**

```typescript
// backend/src/db/schemas.ts
export * from "../../src/modules/health/health.schema.ts";
export * from "../../src/modules/api-key/api-key.schema.ts";
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/api-key/api-key.schema.ts src/db/schemas.ts
git commit -m "feat(api-key): add Drizzle table schema for api_keys"
```

---

## Task 2: Write API Key DTO Schemas

**Files:**
- Create: `backend/src/modules/api-key/api-key.dto.ts`

- [ ] **Step 1: Write the DTO schemas**

```typescript
// backend/src/modules/api-key/api-key.dto.ts
import { z } from "zod/v4";
import { apiKeyTable } from "./api-key.schema.ts";
import { createDto } from "@/shared/utils/dto-builder.ts";

const Dto = createDto(apiKeyTable);

export const ApiKeyCreateSchema = Dto.insert.pick({ name: true });
export const ApiKeySelectSchema = Dto.select;
export const ApiKeyParamSchema = z.object({
  id: z.string().uuid(),
});

// Response shape returned at creation (full key shown ONCE)
export const ApiKeyCreatedResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  key: z.string(),
  keyPrefix: z.string(),
  createdAt: z.string().datetime(),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/api-key/api-key.dto.ts
git commit -m "feat(api-key): add Zod DTO schemas"
```

---

## Task 3: Write API Key Repository

**Files:**
- Create: `backend/src/modules/api-key/api-key.repo.ts`
- Create: `backend/src/modules/api-key/tests/api-key.db.test.ts`
- Create: `backend/src/db/test-utils.ts` (also used by integration tests)

- [ ] **Step 1: Create test utilities**

```typescript
// backend/src/db/test-utils.ts
import { db } from "@/db/pool.ts";
import { apiKeyTable } from "@/modules/api-key/api-key.schema.ts";

/** Deletes all api_keys records. Used for test isolation. */
export async function clearAllApiKeys(): Promise<void> {
  await db.delete(apiKeyTable);
}
```

- [ ] **Step 2: Write failing repository tests**

```typescript
// backend/src/modules/api-key/tests/api-key.db.test.ts
import { assertEquals } from "@std/assert";
import { apiKeyRepo } from "../api-key.repo.ts";
import { clearAllApiKeys } from "@/db/test-utils.ts";

Deno.test("apiKeyRepo.create inserts a record with revoked=false", async () => {
  await clearAllApiKeys();
  const result = await apiKeyRepo.create({
    name: "Test Key",
    keyHash: "bcrypt_hash_placeholder",
    keyPrefix: "gtool_sk_abc",
    userId: "00000000-0000-0000-0000-000000000001",
  });
  assertEquals(result.name, "Test Key");
  assertEquals(result.keyPrefix, "gtool_sk_abc");
  assertEquals(result.revoked, false);
  assertEquals(result.id, 1);
});

Deno.test("apiKeyRepo.findByUser returns all keys (including revoked) for audit", async () => {
  await clearAllApiKeys();
  const userId = "00000000-0000-0000-0000-000000000002";
  const active = await apiKeyRepo.create({
    name: "Active", keyHash: "h1", keyPrefix: "gtool_a", userId,
  });
  await apiKeyRepo.create({
    name: "Revoked", keyHash: "h2", keyPrefix: "gtool_b", userId,
  });
  await apiKeyRepo.revoke(active.id);

  const result = await apiKeyRepo.findByUser(userId);
  assertEquals(result.length, 2); // both returned (including revoked) for audit
});

Deno.test("apiKeyRepo.findByPrefixAndHash skips revoked keys", async () => {
  await clearAllApiKeys();
  const userId = "00000000-0000-0000-0000-000000000003";
  const record = await apiKeyRepo.create({
    name: "Key C", keyHash: "h3", keyPrefix: "gtool_c", userId,
  });
  await apiKeyRepo.revoke(record.id);

  const result = await apiKeyRepo.findByPrefixAndHash("gtool_c");
  assertEquals(result, null);
});

Deno.test("apiKeyRepo.findByPrefixAndHash returns record when active", async () => {
  await clearAllApiKeys();
  const userId = "00000000-0000-0000-0000-000000000004";
  await apiKeyRepo.create({
    name: "Key D", keyHash: "h4", keyPrefix: "gtool_d", userId,
  });

  const result = await apiKeyRepo.findByPrefixAndHash("gtool_d");
  assertEquals(result?.name, "Key D");
});

Deno.test("apiKeyRepo.revoke sets revoked=true and revokedAt", async () => {
  await clearAllApiKeys();
  const userId = "00000000-0000-0000-0000-000000000005";
  const record = await apiKeyRepo.create({
    name: "To Revoke", keyHash: "h5", keyPrefix: "gtool_e", userId,
  });
  await apiKeyRepo.revoke(record.id);

  const found = await apiKeyRepo.findByPrefixAndHash("gtool_e");
  assertEquals(found, null); // skipped because revoked
  const all = await apiKeyRepo.findByUser(userId);
  assertEquals(all.length, 1);
  assertEquals(all[0].revoked, true);
  assertEquals(all[0].revokedAt instanceof Date, true);
});
```

- [ ] **Step 3: Write the repository implementation**

```typescript
// backend/src/modules/api-key/api-key.repo.ts
import { db } from "@/db/pool.ts";
import { apiKeyTable } from "./api-key.schema.ts";
import type { z } from "zod/v4";
import type { ApiKeyCreateSchema } from "./api-key.dto.ts";
import { and, eq } from "drizzle-orm";

export const apiKeyRepo = {
  create: async (
    data: z.infer<typeof ApiKeyCreateSchema> & {
      keyHash: string;
      keyPrefix: string;
      userId: string;
    },
  ) => {
    const [result] = await db.insert(apiKeyTable).values(data).returning();
    return result;
  },

  /** Finds by prefix, skips revoked keys. Hash compare is in the service layer. */
  findByPrefixAndHash: async (prefix: string) => {
    const [result] = await db
      .select({
        id: apiKeyTable.id,
        name: apiKeyTable.name,
        keyHash: apiKeyTable.keyHash,
        keyPrefix: apiKeyTable.keyPrefix,
        userId: apiKeyTable.userId,
        createdAt: apiKeyTable.createdAt,
      })
      .from(apiKeyTable)
      .where(and(eq(apiKeyTable.keyPrefix, prefix), eq(apiKeyTable.revoked, false)));
    return result ?? null;
  },

  /** Returns all keys for a user including revoked (for audit trail). */
  findByUser: async (userId: string) => {
    return await db
      .select({
        id: apiKeyTable.id,
        name: apiKeyTable.name,
        keyPrefix: apiKeyTable.keyPrefix,
        revoked: apiKeyTable.revoked,
        revokedAt: apiKeyTable.revokedAt,
        userId: apiKeyTable.userId,
        createdAt: apiKeyTable.createdAt,
      })
      .from(apiKeyTable)
      .where(eq(apiKeyTable.userId, userId));
  },

  /** Soft delete: sets revoked=true and revokedAt. */
  revoke: async (id: number): Promise<void> => {
    await db
      .update(apiKeyTable)
      .set({ revoked: true, revokedAt: new Date() })
      .where(eq(apiKeyTable.id, id));
  },
};
```

- [ ] **Step 4: Run tests**

Run: `deno test --env-file=.env.local -A src/modules/api-key/tests/api-key.db.test.ts`
Expected: PASS (all 5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/modules/api-key/api-key.repo.ts src/modules/api-key/tests/api-key.db.test.ts src/db/test-utils.ts
git commit -m "feat(api-key): add repository layer with soft-delete revoke"
```

---

## Task 4: Add Error Codes

**Files:**
- Modify: `backend/src/shared/errors/error-code.ts`
- Modify: `backend/src/shared/errors/error-detail.ts`

- [ ] **Step 1: Add error codes**

```typescript
// backend/src/shared/errors/error-code.ts — add:
export const API_KEY_NOT_FOUND = "API_KEY_NOT_FOUND";
export const API_KEY_INVALID = "API_KEY_INVALID";
```

- [ ] **Step 2: Add error messages**

Read `backend/src/shared/errors/error-detail.ts`, then add:

```typescript
[ERROR_CODE.API_KEY_NOT_FOUND]: { status: 404, message: "API key not found or already revoked." },
[ERROR_CODE.API_KEY_INVALID]: { status: 401, message: "Invalid API key." },
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/errors/error-code.ts src/shared/errors/error-detail.ts
git commit -m "feat(api-key): add API_KEY_NOT_FOUND and API_KEY_INVALID error codes"
```

---

## Task 5: Write API Key Service

**Files:**
- Create: `backend/src/modules/api-key/api-key.service.ts`

- [ ] **Step 1: Write the service**

```typescript
// backend/src/modules/api-key/api-key.service.ts
import { apiKeyRepo } from "./api-key.repo.ts";
import { AppError, ERROR_CODE } from "@/shared/errors/error-factory.ts";
import type { ApiKeyCreatedResponseSchema } from "./api-key.dto.ts";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";

const KEY_PREFIX = "gtool_sk_";
const KEY_LENGTH_BYTES = 32;
const BCRYPT_ROUNDS = 12;

function generateApiKey(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(KEY_LENGTH_BYTES));
  const base64url = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return KEY_PREFIX + base64url;
}

export const apiKeyService = {
  /** Generates a new API key, hashes it, stores the hash + prefix.
   * Returns the full key to the caller (shown exactly once). */
  create: async (
    name: string,
    userId: string,
  ): Promise<{ key: string; record: z.infer<typeof ApiKeyCreatedResponseSchema> }> => {
    const rawKey = generateApiKey();
    const keyPrefix = rawKey.slice(0, 12);
    const keyHash = await bcrypt.hash(rawKey, BCRYPT_ROUNDS);

    const record = await apiKeyRepo.create({
      name,
      keyHash,
      keyPrefix,
      userId,
    });

    return {
      key: rawKey,
      record: {
        id: record.id,
        name: record.name,
        keyPrefix: record.keyPrefix,
        createdAt: record.createdAt.toISOString(),
      },
    };
  },

  /** Lists all API keys for a user (including revoked, for audit).
   * Never returns the hash or full key. */
  list: async (userId: string) => {
    return await apiKeyRepo.findByUser(userId);
  },

  /** Revokes an API key by id (soft delete). Verifies ownership before revoking. */
  revoke: async (id: number, userId: string): Promise<void> => {
    const keys = await apiKeyRepo.findByUser(userId);
    const key = keys.find((k) => k.id === id);
    if (!key) {
      throw new AppError(ERROR_CODE.API_KEY_NOT_FOUND, { id: String(id) });
    }
    if (key.revoked) {
      throw new AppError(ERROR_CODE.API_KEY_NOT_FOUND, {
        id: String(id),
        reason: "already revoked",
      });
    }
    await apiKeyRepo.revoke(id);
  },

  /** Verifies a raw API key against stored hash.
   * Returns the userId if valid and not revoked, null otherwise. */
  verify: async (rawKey: string): Promise<string | null> => {
    if (!rawKey.startsWith(KEY_PREFIX)) {
      return null;
    }
    const keyPrefix = rawKey.slice(0, 12);

    // findByPrefixAndHash already skips revoked keys
    const record = await apiKeyRepo.findByPrefixAndHash(keyPrefix);
    if (!record) {
      return null;
    }

    const valid = await bcrypt.compare(rawKey, record.keyHash);
    return valid ? record.userId : null;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/api-key/api-key.service.ts
git commit -m "feat(api-key): add service layer with key generation and verification"
```

---

## Task 6: Write API Key Router (REST)

**Files:**
- Create: `backend/src/modules/api-key/api-key.router.ts`
- Modify: `backend/src/router.ts`

- [ ] **Step 1: Write the router**

```typescript
// backend/src/modules/api-key/api-key.router.ts
import { Hono } from "@hono/hono";
import { z } from "zod/v4";
import { createSuccessResponse } from "@/shared/responses.ts";
import { ApiKeyCreateSchema, ApiKeyParamSchema } from "./api-key.dto.ts";
import { apiKeyService } from "./api-key.service.ts";
import {
  getBody,
  getParams,
  validateRequest,
} from "@/shared/utils/validate.ts";
import type { AppEnv } from "@/shared/utils/hono.ts";

const apiKeyRouter = new Hono<AppEnv>();

apiKeyRouter.post(
  "/",
  validateRequest({ body: ApiKeyCreateSchema }),
  async (c) => {
    const body = getBody<z.infer<typeof ApiKeyCreateSchema>>(c);
    const user = c.get("user");
    if (!user) return c.json({ success: false, error: "Unauthorized" }, 401);
    const result = await apiKeyService.create(body.name, user.userId);
    return c.json(createSuccessResponse({ ...result.record, key: result.key }), 201);
  },
);

apiKeyRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ success: false, error: "Unauthorized" }, 401);
  const keys = await apiKeyService.list(user.userId);
  return c.json(createSuccessResponse(keys.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    revoked: k.revoked,
    revokedAt: k.revokedAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }))));
});

apiKeyRouter.delete(
  "/:id",
  validateRequest({ params: ApiKeyParamSchema }),
  async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ success: false, error: "Unauthorized" }, 401);
    const params = getParams<z.infer<typeof ApiKeyParamSchema>>(c);
    await apiKeyService.revoke(params.id, user.userId);
    return c.body(null, 204);
  },
);

export default apiKeyRouter;
```

- [ ] **Step 2: Mount the router**

```typescript
// backend/src/router.ts
import { Hono } from "@hono/hono";
import healthRouter from "@/modules/health/health.router.ts";
import apiKeyRouter from "@/modules/api-key/api-key.router.ts";
import type { AppEnv } from "@/shared/utils/hono.ts";

const prefix = "/api/v1";

export const router = new Hono<AppEnv>()
  .route(`${prefix}/health`, healthRouter)
  .route(`${prefix}/api-keys`, apiKeyRouter);
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/api-key/api-key.router.ts src/router.ts
git commit -m "feat(api-key): add REST router for key management"
```

---

## Task 7: Update MCP Auth Middleware — API Key Only

**Files:**
- Modify: `backend/src/middlewares/mcp.middleware.ts`
- Modify: `backend/src/shared/utils/mcp-hono.ts` (add `userId?: string` to `McpVariables`)

> **Note:** The MCP endpoint only accepts `gtool_sk_` API keys via `X-GEO-API-KEY` header. No JWT verification on MCP. Flow: JWT access token → create API key (REST) → API key access MCP.

- [ ] **Step 1: Extend McpVariables**

```typescript
// backend/src/shared/utils/mcp-hono.ts
// Add userId to McpVariables:
export interface McpVariables extends McpAuthVariables {
  requestId: string;
  userId?: string;  // set by mcpAuthMiddleware after API key verification
}
```

- [ ] **Step 2: Replace mcpAuthMiddleware body**

The middleware only accepts `gtool_sk_` API keys. If the key is valid and not revoked, `userId` is set in context.

```typescript
// backend/src/middlewares/mcp.middleware.ts
// Replace mcpAuthMiddleware body (after reading file, modify lines 93-134):
export const mcpAuthMiddleware = createMiddleware<McpAppEnv>(
  async (c, next) => {
    if (new URL(c.req.url).pathname !== "/mcp") {
      return await next();
    }

    const apiKey = c.req.header("X-GEO-API-KEY");

    if (!apiKey) {
      const requestId = c.get("requestId");
      logger.warn({ requestId }, "MCP request rejected: missing X-GEO-API-KEY header");
      return c.json(
        { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null },
        401,
      );
    }

    // MCP accepts only gtool_sk_ API keys — no JWT path
    if (!apiKey.startsWith("gtool_sk_")) {
      const requestId = c.get("requestId");
      logger.warn({ requestId }, "MCP request rejected: invalid auth format");
      return c.json(
        { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null },
        401,
      );
    }

    const userId = await apiKeyService.verify(apiKey);
    if (!userId) {
      const requestId = c.get("requestId");
      logger.warn({ requestId }, "MCP request rejected: invalid API key");
      return c.json(
        { jsonrpc: "2.0", error: { code: -32001, message: "Invalid or revoked API key" }, id: null },
        401,
      );
    }

    c.set("userId", userId);
    await next();
  },
);
```

- [ ] **Step 3: Commit**

```bash
git add src/middlewares/mcp.middleware.ts
git commit -m "feat(api-key): add API key authentication to MCP middleware"
```

---

## Task 8: Write REST + API Key Auth MCP Integration Tests

**Files:**
- Create: `backend/src/modules/api-key/tests/api-key.api.test.ts`
- Create: `backend/src/modules/api-key/tests/api-key.mcp-auth.test.ts`

> **Test setup pattern:** Two separate test app instances are used:
> - `restApp` (setupTestApp) — mounts REST API routes, used for JWT-authenticated API key CRUD
> - `mcpApp` (setupMcpTestApp) — mounts only MCP endpoint with API key auth, used for MCP auth testing
>
> **Auth flow:** JWT → create API key (REST) → API key → MCP

- [ ] **Step 1: Write REST integration tests**

```typescript
// backend/src/modules/api-key/tests/api-key.api.test.ts
import { assertEquals } from "@std/assert";
import { createTestApp } from "@/shared/utils/test/setup.ts";
import { clearAllApiKeys } from "@/db/test-utils.ts";

async function setup() {
  const { fetchClient, getToken } = await createTestApp();
  const token = await getToken();
  return { fetch: fetchClient, token };
}

Deno.test("POST /api/v1/api-keys creates a key and returns it once", async () => {
  await clearAllApiKeys();
  const { fetch, token } = await setup();
  const res = await fetch("/api/v1/api-keys", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test Key" }),
  });
  assertEquals(res.status, 201);
  const json = await res.json();
  assertEquals(json.success, true);
  assertEquals(json.data.name, "Test Key");
  assertEquals(json.data.key.startsWith("gtool_sk_"), true);
  assertEquals(json.data.key.length, 51);
  assertEquals(json.data.keyPrefix, json.data.key.slice(0, 12));
});

Deno.test("GET /api/v1/api-keys lists keys without showing full key or hash", async () => {
  await clearAllApiKeys();
  const { fetch, token } = await setup();
  const createRes = await fetch("/api/v1/api-keys", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "List Test" }),
  });
  const fullKey = (await createRes.json()).data.key;

  const res = await fetch("/api/v1/api-keys", {
    headers: { Authorization: `Bearer ${token}` },
  });
  assertEquals(res.status, 200);
  const json = await res.json();
  const listed = json.data.find((k: any) => k.name === "List Test");
  assertEquals("key" in listed, false); // full key absent
  assertEquals(listed.keyPrefix, fullKey.slice(0, 12));
  assertEquals(listed.revoked, false);
  assertEquals(listed.revokedAt, null);
});

Deno.test("DELETE /api/v1/api-keys/:id soft-revokes the key", async () => {
  await clearAllApiKeys();
  const { fetch, token } = await setup();
  const createRes = await fetch("/api/v1/api-keys", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "To Revoke" }),
  });
  const keyId = (await createRes.json()).data.id;

  const res = await fetch(`/api/v1/api-keys/${keyId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  assertEquals(res.status, 204);

  // Verify marked as revoked in list (still appears for audit)
  const listRes = await fetch("/api/v1/api-keys", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const revoked = (await listRes.json()).data.find((k: any) => k.id === keyId);
  assertEquals(revoked.revoked, true);
  assertEquals(revoked.revokedAt !== null, true);
});

Deno.test("Unauthenticated request returns 401", async () => {
  await clearAllApiKeys();
  const { fetch } = await setup();
  const res = await fetch("/api/v1/api-keys", { headers: {} });
  assertEquals(res.status, 401);
});

Deno.test("Revoking already-revoked key returns 404", async () => {
  await clearAllApiKeys();
  const { fetch, token } = await setup();
  const createRes = await fetch("/api/v1/api-keys", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Double Revoke" }),
  });
  const keyId = (await createRes.json()).data.id;
  await fetch(`/api/v1/api-keys/${keyId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const res = await fetch(`/api/v1/api-keys/${keyId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  assertEquals(res.status, 404);
});
```

- [ ] **Step 2: Write MCP API key auth integration tests**

This verifies API keys authenticate against the MCP endpoint (via `health_list` tool — avoids circular loop).
Uses two separate app instances: `restApp` for REST calls (JWT auth) and `mcpApp` for MCP calls (API key auth).

```typescript
// backend/src/modules/api-key/tests/api-key.mcp-auth.test.ts
// @ts-nocheck
import { assertEquals } from "@std/assert";
import { setupTestApp } from "@/shared/utils/test/setup.ts";
import { setupMcpTestApp } from "@/shared/utils/test/setup-mcp.ts";
import { clearAllApiKeys } from "@/db/test-utils.ts";
import { createMcpRequest } from "@/shared/utils/test/setup-mcp.ts";
import { closePool } from "@/db/pool.ts";

let restApp: Awaited<ReturnType<typeof setupTestApp>>;
let mcpApp: Awaited<ReturnType<typeof setupMcpTestApp>>;

Deno.test.beforeAll(async () => {
  restApp = await setupTestApp();
  mcpApp = await setupMcpTestApp();
});

Deno.test.afterAll(async () => {
  await closePool();
  await restApp.close();
  await mcpApp.close();
});

Deno.test({
  name: "API key authenticates MCP endpoint and calls health_list",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await clearAllApiKeys();

    // Step 1: Create API key via REST (uses JWT from setupTestApp)
    const createRes = await restApp.fetchClient("/api-keys", {
      method: "POST",
      headers: { Authorization: `Bearer ${restApp.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "MCP Auth Test" }),
    });
    assertEquals(createRes.status, 201);
    const apiKey = (createRes.data as any).data.key;
    assertEquals(apiKey.startsWith("gtool_sk_"), true);

    // Step 2: Initialize MCP session with API key
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
        "X-GEO-API-KEY": apiKey,
      },
    });
    assertEquals(initRes.status, 200);
    const sessionId = initRes.response.headers.get("mcp-session-id");
    assertEquals(sessionId !== null, true);

    // Step 3: Complete handshake (initialized notification)
    const notifReq = createMcpRequest("notifications/initialized", {});
    await mcpApp.fetchClient("/mcp", {
      method: "POST",
      body: JSON.stringify(notifReq),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "mcp-session-id": sessionId!,
        "X-GEO-API-KEY": apiKey,
      },
    });

    // Step 4: Call health_list tool
    const toolRequest = createMcpRequest("tools/call", {
      name: "health_list",
      arguments: { limit: 5 },
    }, 2);

    const toolRes = await mcpApp.fetchClient("/mcp", {
      method: "POST",
      body: JSON.stringify(toolRequest),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "mcp-session-id": sessionId!,
        "X-GEO-API-KEY": apiKey,
      },
    });

    assertEquals(toolRes.status, 200);
    const toolJson = toolRes.data as any;
    assertEquals(toolJson.jsonrpc, "2.0");
    assertEquals(toolJson.result !== undefined, true);
  },
});

Deno.test({
  name: "Revoked API key does not authenticate MCP — returns 401",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await clearAllApiKeys();

    // Create and revoke a key via REST
    const createRes = await restApp.fetchClient("/api-keys", {
      method: "POST",
      headers: { Authorization: `Bearer ${restApp.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Revoked Key" }),
    });
    const keyId = (createRes.data as any).data.id;
    const revokedKey = (createRes.data as any).data.key;

    // Revoke it
    await restApp.fetchClient(`/api-keys/${keyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${restApp.token}` },
    });

    // Try to use revoked key on MCP
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
        "X-GEO-API-KEY": revokedKey,
      },
    });

    assertEquals(initRes.status, 401, `Expected 401, got ${initRes.status}`);
    const json = initRes.data as any;
    assertEquals(json.jsonrpc, "2.0");
  },
});

Deno.test({
  name: "Missing X-GEO-API-KEY header returns 401 on MCP",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await clearAllApiKeys();
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
      },
    });

    assertEquals(initRes.status, 401);
  },
});

Deno.test({
  name: "Wrong prefix (not gtool_sk_) returns 401 on MCP",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await clearAllApiKeys();
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
        "X-GEO-API-KEY": "not_a_gtool_key_xxx",
      },
    });

    assertEquals(initRes.status, 401);
  },
});
```

- [ ] **Step 3: Run all tests**

Run: `deno test --env-file=.env.local -A src/modules/api-key/tests/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/modules/api-key/tests/
git commit -m "test(api-key): add REST and MCP API key auth integration tests"
```

---

## Task 9: Create Drizzle Migration

**Files:**
- Generate: `backend/drizzle/YYYY-MM-DD-create-api-keys.sql`

- [ ] **Step 1: Generate the migration**

Run: `deno task db generate`
Expected: New migration file in `backend/drizzle/` for `api_keys` table.

> Uses `deno task` which maps to the Deno task runner. Verify the task name: `deno task --` to list available tasks.

- [ ] **Step 2: Apply the migration locally**

Run: `deno task db migrate`

- [ ] **Step 3: Commit migration files**

```bash
git add drizzle/
git commit -m "feat(api-key): add api_keys table migration"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- [ ] API key generation with `gtool_sk_` prefix
- [ ] One-way hash storage (bcrypt cost=12)
- [ ] Never expire
- [ ] Unlimited keys per user
- [ ] Full key shown exactly once at creation
- [ ] Key prefix returned on list
- [ ] Soft delete with `revoked` + `revoked_at` (audit trail)
- [ ] Bearer JWT auth required for create/revoke/list (REST)
- [x] API key auth **only** on MCP endpoint (no JWT verification on MCP)
- [ ] No logging of key usage
- [ ] No UI
- [ ] Rate limiting skipped
- [ ] No MCP tools for api-key (REST-only, avoids circular loop)

**2. Placeholder scan:** No TBD/TODO. All code is concrete.

**3. Type consistency:**
- `ApiKeyCreateSchema` → `name: string`
- `ApiKeyParamSchema` → `id: string` (UUID)
- `apiKeyService.create()` returns `{ key: string; record: ApiKeyCreatedResponseSchema }`
- `apiKeyService.verify()` returns `string | null`
- `findByUser` returns records with `revoked`, `revokedAt`, `keyPrefix`, `userId`
- `findByPrefixAndHash` skips revoked (filtered in DB query)

**4. Definition of done:**
- [ ] All tasks are complete
- [ ] All tests are passing
- [ ] All files are committed
- [ ] Plan saved to `docs/superpowers/plans/2026-04-02-api-key-management.md`
- [ ] `deno check src/` passes
- [ ] `deno lint src/` passes
- [ ] `deno fmt --check src/` passes

---

Plan complete and saved to `docs/superpowers/plans/2026-04-02-api-key-management.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
