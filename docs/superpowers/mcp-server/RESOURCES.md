# MCP Server — Resource Development

> **Spec:** MCP Protocol 2025-11-25 | **SDK:** `@modelcontextprotocol/sdk`

---

## 1. What Are Resources?

Resources are **URI-addressable static data** that LLMs can read without triggering side effects. Unlike tools (which mutate state), resources are read-only.

They are useful for:
- Server metadata (statistics, schema, version)
- Configuration data
- Reference data that tools don't need to fetch on each call

---

## 2. Registration Pattern

Resources follow the same factory pattern as tools:

```typescript
import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerHealthResources(server: McpServer): void {
  server.registerResource(
    "health-stats",           // unique identifier
    "health://stats",         // URI (protocol://path)
    {
      title: "Health Server Statistics",
      description: "Returns real-time server statistics including total record count.",
      mimeType: "application/json",
    },
    async (uri: URL): Promise<ReadResourceResult> => {
      // ... compute data ...
      return {
        contents: [{
          uri: uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2),
        }],
      };
    },
  );
}
```

---

## 3. URI Convention

Resources use a **custom protocol** matching the module name:

```
health://stats     → server statistics
health://schema    → JSON Schema for health records
```

Pattern: `<module>://<resource-name>`

The URI is returned in the response and clients use it to reference the resource in `resources/read` calls.

---

## 4. Enabling Resources in the Server

**Critical:** The `McpServer` must declare `capabilities: { resources: {} }` in its constructor for resource methods (`resources/list`, `resources/read`) to be registered. Without this, these methods return "Method not found".

```typescript
const server = new McpServer(
  { name: "geo-tools-mcp-server", version: "1.0.0" },
  {
    capabilities: {
      tools: {},       // enables tools/*
      resources: {},  // ← must be declared to enable resources/*
      logging: {},
    },
  },
);
```

If `resources/list` returns "Method not found", the first thing to check is whether `resources: {}` is in the capabilities.

---

## 5. ReadResourceResult Format

The `readCallback` must return `ReadResourceResult`:

```typescript
import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";

type ReadResourceResult = {
  contents: Array<{
    uri: string;
    mimeType: string;
    text: string;
  }>;
};
```

Always return a valid JSON string in `text`. For schema resources, use the appropriate MIME type.

---

## 6. Error Handling in Resources

Resources should gracefully handle errors and return a meaningful response rather than throwing:

```typescript
async (uri: URL): Promise<ReadResourceResult> => {
  try {
    const stats = await healthService.findMany({ limit: 1 });
    // ...
    return { contents: [{ uri: uri.toString(), mimeType: "application/json", text: JSON.stringify(data) }] };
  } catch {
    // Return error as content, don't throw
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: "application/json",
        text: JSON.stringify({ error: "Failed to load statistics" }),
      }],
    };
  }
}
```

---

## 7. Resource Catalog

| Resource | URI | MIME Type | Description |
|---|---|---|---|
| Health Stats | `health://stats` | `application/json` | Server statistics: total records, most recent, timestamp |
| Health Schema | `health://schema` | `application/schema+json` | JSON Schema defining health record structure |

---

## 8. Adding a New Resource

1. Define the `server.registerResource()` call inside the module's `registerXxxResources(server)` function
2. If the resource needs data from a service, call the service inside the `readCallback`
3. Register in `createMcpServer()` in both `app.mcp.ts` and `mcp-hono.ts`

```typescript
// In health.mcp.ts
export function registerHealthResources(server: McpServer): void {
  server.registerResource("health-stats", "health://stats", { ... }, async (uri) => { ... });
  server.registerResource("health-schema", "health://schema", { ... }, async (uri) => { ... });
  // Add new resources here
}
```

No changes needed to tool handlers or middlewares.