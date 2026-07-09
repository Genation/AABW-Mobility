# AGENTS.md — Backend Architecture Conventions

> **Scope:** `backend/src/**/*.ts` — Hono, Drizzle, BullMQ, Vertical Slices,
> Internal Services, MCP
>
> **Context:** Multi-track contest project. Each contest track is an independent
> module under `src/modules/<track-name>/`. Tracks share OAuth, models, and
> infrastructure but run as isolated vertical slices.

## Commands

```bash
# Development
deno task dev              # Run API server with hot reload (port from .env.local)
deno task mcp              # Run MCP server standalone (port 8908)

# Testing
deno task test             # Run ALL tests
deno task mcp:test         # Run MCP tests only
deno test -A --env-file=.env.local src/modules/health/tests/health.mcp.test.ts  # Single test file

# Lint & Format (run before commit)
deno check src/            # Type check
deno lint src/             # Lint
deno fmt src/              # Format

# Database
deno task db generate      # Generate migration from schema changes
deno task db migrate       # Apply migrations
```

**Pre-commit:** `deno check src/ && deno lint src/ && deno fmt src/` — all must
pass with zero errors.

## Architecture

Two-process system: **API Server** (HTTP, thin modules) + **Worker** (BullMQ,
heavy logic).

```
HTTP Request → Module (router→controller→service) → Internal Service → Repo → DB
                                                    ↓
                                              BullMQ Queue → Worker → Internal Service → Repo
```

**Rule:** Modules are thin HTTP wrappers. All heavy logic lives in `intenals/`.

## Tracks (Multi-Track Architecture)

The project supports multiple contest tracks. Each track is implemented as a
module under `src/modules/<track-name>/`.

### Track Isolation

- Each track **runs as an independent vertical slice** — its own router, service,
  repo, schema, DTOs, and tests
- Tracks **do NOT share database tables** — each track owns its schema. If two
  tracks need the same data, prefer duplication over coupling

### Naming Conventions (Track-ID Prefix)

All track-owned resources **MUST** be prefixed with the track ID to avoid
collisions and clearly identify ownership:

| Resource          | Convention                                  | Example                          |
| ----------------- | ------------------------------------------- | -------------------------------- |
| **Module dir**    | `src/modules/<track-id>-<feature>/`         | `track-1-users/`                 |
| **DB table**      | `<track_id>_<table>`                        | `track_1_users`                  |
| **Queue name**    | `<track-id>-<purpose>-queue`                | `track-1-billing-queue`          |
| **Service name**  | `<track-id>_<feature>_service`              | `track_1_billing_service`        |
| **Schema file**   | `<track-id>-<feature>.schema.ts`            | `track-1-users.schema.ts`        |
| **Worker name**   | `<track-id>-<feature>-worker`               | `track-1-billing-worker`         |
| **BullMQ job**    | `<track-id>-<job-type>`                     | `track-1-send-invoice`           |

```typescript
// ✅ GOOD: track ID prefix in table name
export const track1UsersTable = pgTable("track_1_users", { ... });

// ✅ GOOD: track ID prefix in queue name
export const QUEUE_TRACK_1_BILLING = "track-1-billing-queue";

// ✅ GOOD: module directory with track ID
// src/modules/track-1-users/

// ❌ BAD: generic name without track prefix — collision risk
export const usersTable = pgTable("users", { ... });
```

> **Why:** In a multi-track contest, BTC evaluates each track independently.
> Prefixing ensures zero risk of naming collisions between tracks in shared
> infrastructure (DB, queues, MCP server). File/folder naming mirrors this
> for clarity during code review.

### Shared Infrastructure

Tracks can freely depend on shared infrastructure (read-only pattern):
- **Auth:** `api-key` module for API key verification, `auth.middleware.ts` for
  JWT/Supabase auth
- **OAuth flow:** Supabase client via `@supabase/supabase-js` (configured in
  `configs/env.ts`)
- **Error handling:** `@/shared/errors/error-factory.ts` — use `AppError` and
  `ERROR_CODE`
- **Response format:** `@/shared/responses.ts` — uniform JSON envelope
- **MCP framework:** `@/shared/utils/mcp-hono.ts` — MCP server bootstrap
- **Test helpers:** `@/shared/utils/test/setup.ts`,
  `@/shared/utils/test/setup-mcp.ts`
- **DTO builder:** `@/shared/utils/dto-builder.ts`
- **Logger:** `@/configs/logger.ts`

### Creating a New Track

```
1. Create directory:    src/modules/<track-id>-<feature>/
2. Create schema:       <track-id>-<feature>.schema.ts   → register in src/db/schemas.ts
3. Create DTO:          <track-id>-<feature>.dto.ts
4. Create repo:         <track-id>-<feature>.repo.ts
5. Create service:      <track-id>-<feature>.service.ts
6. Create controller:   <track-id>-<feature>.controller.ts
7. Create router:       <track-id>-<feature>.router.ts   → register in src/router.ts
8. Create MCP (opt):    <track-id>-<feature>.mcp.tool.ts / .mcp.resource.ts
                        → register in src/app.mcp.ts (registerXxxTools + registerXxxResources)
9. Create tests:        tests/<track-id>-<feature>.unit.test.ts
                        tests/<track-id>-<feature>.db.test.ts
                        tests/<track-id>-<feature>.api.test.ts
                        tests/<track-id>-<feature>.mcp.test.ts
10. Generate migration: deno task db generate
11. Run migration:      deno task db migrate
```

### Sharing Between Tracks

```
Track A → Track B schema/repo (read only)  ✅ Allowed (query existing data)
Track A → Track B service (read only)       ✅ Allowed (call list/find methods)
Track A → Track B router/controller         ❌ Not allowed (import other track's HTTP layer)
Track A → Track B mutation (write)          ❌ Avoid — tracks own their data
```

### Router Registration

When adding a new track, register its router in `src/router.ts`:

```typescript
import trackNameRouter from "@/modules/<track-name>/<track-name>.router.ts";
// ...
export const router = new Hono<AppEnv>()
  .route(`${prefix}/<track-name>`, trackNameRouter)
```

For MCP tools/resources, register in `src/app.mcp.ts`:

```typescript
import { register<Name>Tools } from "./modules/<track-name>/<track-name>.mcp.tool.ts";
import { register<Name>Resources } from "./modules/<track-name>/<track-name>.mcp.resource.ts";

function createMcpServer(): McpServer {
  // ... existing registrations ...
  register<Name>Tools(server);
  register<Name>Resources(server);
}
```

## Module Structure (Vertical Slice)

```
modules/<name>/
├── <name>.router.ts       # Routes + middleware chain
├── <name>.controller.ts   # HTTP handlers only
├── <name>.service.ts      # Thin orchestration (DB write, queue add, internal service call)
├── <name>.repo.ts         # Database operations (named export only)
├── <name>.schema.ts       # Drizzle table schema
├── <name>.dto.ts          # Zod schemas + TS types
├── <name>.mcp.tool.ts     # MCP tool registrations (if applicable)
├── <name>.mcp.resource.ts # MCP resource registrations (if applicable)
└── tests/
```

## Internal Service Layer (`intenals/`)

- **Factory pattern mandatory** —
  `export const createXxxService = (deps?) => ({ ... })`
- No classes, no `new`, no `this`
- Module-level singleton for stateless:
  `export const webService = createWebService()`
- Per-call factory for tests/custom config: `const svc = createWebService(deps)`

## Code Style

| Aspect            | Convention                                                                    |
| ----------------- | ----------------------------------------------------------------------------- |
| **File names**    | kebab-case: `health.mcp.resource.ts`                                          |
| **Imports**       | Use `@/` alias. Always `.ts` extension. Group: external → internal → relative |
| **Exports**       | Named exports only. No `export default`                                       |
| **Functions**     | camelCase: `createWebService`, `processEval`                                  |
| **Types**         | PascalCase: `HealthCreateBody`, `EvaluateJobData`                             |
| **Constants**     | SCREAMING_SNAKE_CASE: `QUEUE_NAMES`, `ERROR_CODE`                             |
| **MCP tools**     | camelCase, verb-first per spec: `listHealthRecords`, `createHealthRecord`     |
| **MCP resources** | URI: `{server}://{module}/{type}` → `geotools://health/schema`                |

## DTO Pattern

```typescript
const BaseInsert = createInsertSchema(table, {
  jsonCol: z.record(z.string(), z.any()),
});
export const CreateXxxSchema = BaseInsert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const UpdateXxxSchema = CreateXxxSchema.partial();
export type CreateXxx = z.infer<typeof CreateXxxSchema>;
```

## Error Handling

```typescript
import { AppError, getJsonRpcCode } from "@/shared/errors/error-factory.ts";

// Service layer
if (!record) throw new AppError("NOT_FOUND", "Record not found");

// MCP tool handler
catch (error) {
  if (error instanceof AppError) {
    return { content: [{ type: "text", text: error.message }], isError: true };
  }
  return { content: [{ type: "text", text: "Internal error" }], isError: true };
}
```

## Database

- **Registry:** If create new `schema` must registry to `src/db/schemas.ts` with
  current pattern
- **Hybrid schema:** hard columns for indexed/filtered fields, `jsonb` for
  flexible data (limitation)
- **Always** `.returning()` on mutations, always set `updatedAt: new Date()`
- **Migration workflow:** modify schema → `deno task db generate` → review SQL →
  `deno task db migrate`
- Index every column you filter by

## MCP Conventions

- **Resources** = data server HAS (schemas, configs, documents) — read-only,
  URI-addressable
- **Tools** = actions server CAN DO (CRUD, computations) — model-invoked
- Resource URI scheme = server name, not module: `geotools://health/schema` (NOT
  `health://schema`)
- Tool names: camelCase, verb-first, 1-128 chars, allowed: `A-Za-z0-9_-.`
- Always return both `content` (text) and `structuredContent` (JSON object) in
  tool results

## Testing Conventions

### Test File Naming

```
modules/<name>/tests/
├── <name>.unit.test.ts     # Pure functions ONLY — no DB, no HTTP, no network
├── <name>.db.test.ts       # Repository layer — real DB, needs tables migrated
├── <name>.api.test.ts      # HTTP endpoints — real Hono app + real DB
└── <name>.mcp.test.ts      # MCP tools/resources — real MCP server + real DB
```

### Test Type Rules

| Type     | What to test                                        | External deps allowed?        | Must run without migration? |
| -------- | --------------------------------------------------- | ----------------------------- | --------------------------- |
| **Unit** | Pure functions, DTO validation, transformers, utils | ❌ NO DB, NO HTTP, NO network | ✅ YES                      |
| **DB**   | Repo CRUD, queries, filters, pagination             | ✅ Real DB only               | ❌ Needs tables             |
| **API**  | Router → Controller → Service → Repo → DB           | ✅ Real Hono + Real DB        | ❌ Needs tables             |
| **MCP**  | Tool calls, resource reads, auth flow               | ✅ Real MCP server + Real DB  | ❌ Needs tables             |

### Unit Test Rules (`.unit.test.ts`)

**MUST be pure** — zero imports from `@/db/`, `@/modules/`, or any repo/service
that touches the database.

```typescript
// ✅ GOOD: Testing pure functions, DTO schemas, transformers
import { CreateProjectSchema, ProjectParamSchema } from "../project.dto.ts";

Deno.test("CreateProjectSchema rejects empty name", () => {
  const result = CreateProjectSchema.safeParse({ name: "" });
  assertEquals(result.success, false);
});

Deno.test("computeDiff detects field changes", () => {
  const diff = computeDiff(
    { status: "planned" },
    { status: "in_progress" },
  );
  assertEquals(diff.length, 1);
  assertEquals(diff[0]!.fieldName, "status");
});
```

```typescript
// ❌ BAD: Unit test hitting the database
import { projectService } from "../project.service.ts"; // calls repo → DB
import { projectRepo } from "../project.repo.ts"; // hits DB directly

Deno.test("creates a project", async () => {
  const result = await projectService.create("Test"); // ← NOT a unit test!
});
```

**If you need to test service logic with DB:**

- Move pure logic into separate pure functions → test those in `.unit.test.ts`
- OR rename the file to `.integration.test.ts` (not `.unit.test.ts`)

### Service Layer for Testability

Services MUST use factory pattern with dependency injection so repos can be
swapped in tests:

```typescript
// ✅ GOOD: Factory with optional deps
export const createProjectService = (deps?: { repo?: typeof projectRepo }) => {
  const repo = deps?.repo ?? projectRepo;
  return {
    create: async (name: string) => {/* ... */},
    findOne: async (id: number) => {/* ... */},
  };
};

// Usage in unit test — inject mock repo
const mockRepo = { create: async () => ({ id: 1, name: "test" }) };
const service = createProjectService({ repo: mockRepo });
```

### DB Test Rules (`.db.test.ts`)

- Uses real `repo` against real database
- Each test should clean up after itself (delete created records in final step)
- Call `closePool()` in `afterAll`
- Tests pagination, filters, edge cases at the query level

### API Test Rules (`.api.test.ts`)

- Uses `setupTestApp()` for in-memory Hono server
- Each test creates its own data for isolation
- Tests HTTP status codes, validation errors (400), auth errors (401), not-found
  (404)
- Never share state between tests

### MCP Test Rules (`.mcp.test.ts`)

- Uses `setupMcpTestApp()` for MCP server
- Tests both `content` (text) and `structuredContent` (JSON) in responses
- Tests auth flow (401 without key, wrong prefix)
- Tests error handling (`isError: true`)

### Quick Decision Guide

```
Want to test...                          → File
─────────────────────────────────────────────────────────
Zod schema validation                    → .unit.test.ts
Pure utility/helper function             → .unit.test.ts
Diff calculation, value serialization    → .unit.test.ts
Repo insert/select/update/delete         → .db.test.ts
Query filters, pagination, indexes       → .db.test.ts
HTTP status codes, middleware chain      → .api.test.ts
MCP tool call, resource read, auth       → .mcp.test.ts
```

## Cross-Layer Rules

1. Modules → Internal services: ✅ expected
2. Modules → Other modules (read only): ✅
3. Internal → Internal: ✅ composition encouraged
4. Internal → Modules: ❌ circular dependency

## Quick Decision Guide

| Need                    | Where                                         |
| ----------------------- | --------------------------------------------- |
| HTTP endpoint           | `modules/<name>/`                             |
| Business logic, no HTTP | `intenals/<name>/<name>.service.ts`           |
| Multi-stage pipeline    | `intenals/core/processor/`                    |
| Long-running task       | BullMQ queue → worker                         |
| External API client     | `libs/` or `intenals/<name>/<name>.engine.ts` |
