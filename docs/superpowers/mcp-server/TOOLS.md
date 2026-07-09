# MCP Server — Tool Development

> **Spec:** MCP Protocol 2025-11-25 | **SDK:** `@modelcontextprotocol/sdk`

---

## 1. Tool Registration Pattern

Every module exports a **factory function** that registers tools to a `McpServer` instance. Tools are not wrapped in a class.

### File Structure

```
modules/<name>/
├── health.mcp.ts         # registerHealthTools(server) + registerHealthResources(server)
├── health.service.ts     # Business logic (no MCP awareness)
└── tests/
    └── health.mcp.test.ts
```

### Basic Pattern

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { logTool } from "@/types/mcp-context.ts";
import { z } from "zod/v4";
import { AppError, getJsonRpcCode } from "@/shared/errors/error-factory.ts";
import { healthService } from "./health.service.ts";

// 1. Define input schema
const MyToolInputSchema = z.object({
  id: z.coerce.number().int().positive().describe("Record ID"),
});

// 2. Export factory
export function registerMyTools(server: McpServer): void {
  server.registerTool(
    "module_action",
    {
      title: "Action Title",
      description: "What this tool does in one sentence.",
      inputSchema: MyToolInputSchema,
    },
    async (args, ctx): Promise<CallToolResult> => {
      logTool(ctx, "info", { tool: "module_action", args }, "Starting module_action");

      try {
        const result = await myService.action(args.id);
        logTool(ctx, "info", { tool: "module_action", result: result.id }, "module_action complete");

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: { id: result.id, data: result.data },
        };
      } catch (error) {
        logTool(ctx, "error", { tool: "module_action", error: String(error) }, "module_action failed");

        if (error instanceof AppError) {
          const code = getJsonRpcCode(error.code);
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, code }) }],
            isError: true,
          };
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              code: -32603,
            }),
          }],
          isError: true,
        };
      }
    },
  );
}
```

---

## 2. Input Schema Rules

### Zod v4 Only — No `z.coerce.date()`

MCP's JSON Schema serialization cannot handle `Date` objects. Use `z.string().datetime()` and parse manually.

```typescript
// ❌ Wrong — Date cannot be serialized to JSON Schema
latestAt: z.coerce.date().optional()

// ✅ Correct — string input, parsed manually in handler
latestAt: z.string().datetime({ offset: true }).optional()

// In handler:
const latestAtDate = args.latestAt ? new Date(args.latestAt) : undefined;
```

### Common Patterns

| Pattern | Schema | Notes |
|---|---|---|
| Integer ID | `z.coerce.number().int().positive()` | coerce from string automatically |
| Optional pagination | `z.coerce.number().int().min(1).max(100).default(20)` | coercion + bounds + default |
| JSON data | `z.record(z.string(), z.unknown())` | arbitrary key-value object |
| Optional partial update | `z.record(z.string(), z.unknown()).optional()` | for PATCH semantics |

### Exported Types

Always export the inferred Zod type so consumers can use it:

```typescript
export type MyToolInput = z.infer<typeof MyToolInputSchema>;
```

---

## 3. Response Format

### Standard Success

Always return JSON text in `content[0].text`:

```typescript
return {
  content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
};
```

**Do not** return raw strings or non-JSON text. If the result is empty:

```typescript
return {
  content: [{ type: "text", text: JSON.stringify({ data: [], message: "No records found" }, null, 2) }],
};
```

### Structured Content (Local Extension)

Return `structuredContent` for a more structured response format that clients can access without parsing JSON:

```typescript
return {
  content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  structuredContent: {
    id: result.id,
    data: result.data,
    createdAt: result.createdAt.toISOString(),
  },
};
```

### Error Response

```typescript
return {
  content: [{ type: "text", text: JSON.stringify({ error: error.message, code }) }],
  isError: true,
};
```

---

## 4. Logging Pattern

Log at three points in every handler:

1. **Entry** — what tool is being called with what args (sanitize sensitive data)
2. **Success** — what was returned (count, ID, key fields)
3. **Error** — what went wrong

```typescript
async (args, ctx): Promise<CallToolResult> => {
  logTool(ctx, "info", {
    tool: "health_create",
    args: { data: args.data }, // sanitize if needed
  }, "Starting health_create");

  try {
    const result = await healthService.create({ data: args.data });
    logTool(ctx, "info", { tool: "health_create", id: result.id }, "health_create complete");
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    logTool(ctx, "error", { tool: "health_create", error: String(error) }, "health_create failed");
    // ...
  }
}
```

Never use `console.log` inside a tool handler. Always use `logTool`.

---

## 5. Registering Tools in the Server Factory

After defining the factory function, register it in `createMcpServer()` in **both** places:

1. `app.mcp.ts` — production server factory
2. `mcp-hono.ts` — shared server factory (used by tests)

```typescript
// app.mcp.ts
function createMcpServer(): McpServer {
  const server = new McpServer({ name: "geo-tools-mcp-server", version: "1.0.0" }, {
    capabilities: { tools: {}, resources: {}, logging: {} },
    // ...
  });
  registerHealthTools(server);   // ← add here
  registerHealthResources(server);
  return server;
}

// mcp-hono.ts
function createMcpServer(): McpServer {
  // ...
  registerHealthTools(server);   // ← add here too
  registerHealthResources(server);
  return server;
}
```

---

## 6. Tool Catalog

### Implemented Tools

| Tool | Input | Maps to | Description |
|---|---|---|---|
| `health_list` | `{ query?, limit?, latestAt? }` | `GET /health` | Paginated list with cursor |
| `health_create` | `{ data: object }` | `POST /health` | Create record |
| `health_get` | `{ id: number }` | `GET /health/:id` | Get by ID |
| `health_update` | `{ id: number, data? }` | `PATCH /health/:id` | Update record |
| `health_delete` | `{ id: number }` | `DELETE /health/:id` | Delete record |
| `health_gap_test` | `{ id: number }` | `GET /health/:id/gap-test` | Calculate time gap |

---

## 7. Adding a New Tool to an Existing Module

1. Define `XxxInputSchema` in `modules/<name>/<name>.mcp.ts`
2. Export the type: `export type XxxInput = z.infer<typeof XxxInputSchema>`
3. Add `server.registerTool("module_action", { ... }, handler)` inside the existing `register<Name>Tools()` function
4. Run `deno check --all-source` to verify types

No changes needed to `app.mcp.ts` or `mcp-hono.ts` for new tools within an existing module.