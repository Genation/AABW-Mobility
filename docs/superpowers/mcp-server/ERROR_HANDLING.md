# MCP Server — Error Handling

> **Spec:** MCP Protocol 2025-11-25 | **Error Codes:** JSON-RPC 2.0 + MCP Server Error Range

---

## 1. Error Code System

The server uses a two-layer error system:

1. **Internal errors** use `ErrorCode` (enum) defined in `error-code.ts`
2. **External errors** (over the wire) use JSON-RPC error codes

The bridge between them is `getJsonRpcCode()` from `error-factory.ts`.

### Error Code Definitions (`error-code.ts`)

```typescript
export enum ERROR_CODE {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}
```

### JSON-RPC Mapping (`error-factory.ts`)

```typescript
const ERROR_JSON_RPC_MAP: Record<string, number> = {
  [ERROR_CODE.UNAUTHORIZED]: -32001,
  [ERROR_CODE.FORBIDDEN]: -32000,
  [ERROR_CODE.NOT_FOUND]: -32601,
  [ERROR_CODE.VALIDATION_ERROR]: -32602,
  [ERROR_CODE.INTERNAL_SERVER_ERROR]: -32603,
};

export function getJsonRpcCode(code: ErrorCode): number {
  return ERROR_JSON_RPC_MAP[code] ?? -32603;
}
```

---

## 2. JSON-RPC Error Code Reference

| Internal Code | JSON-RPC Code | HTTP | Trigger | Response Location |
|---|---|---|---|---|
| `UNAUTHORIZED` | `-32001` | 401 | Missing or invalid Bearer token | HTTP layer (middleware) |
| `FORBIDDEN` | `-32000` | 403 | Origin not in `ALLOWED_ORIGINS` | HTTP layer (middleware) |
| `BAD_REQUEST` | `-32000` | 400 | Unsupported protocol version | HTTP layer (handler) |
| `NOT_FOUND` | `-32601` | 200 | Record ID doesn't exist | Tool handler result |
| `VALIDATION_ERROR` | `-32602` | 200 | Zod validation failure | Tool handler result |
| `INTERNAL_SERVER_ERROR` | `-32603` | 500 | Unexpected error (transport) | HTTP layer (handler) |

**Two-layer rule:** HTTP 200 responses are tool execution results. HTTP non-200 responses are transport/protocol errors. The MCP spec (SEP-1303) distinguishes between tool errors (`isError: true` in result body, HTTP 200) and protocol errors (HTTP 4xx/5xx).

---

## 3. AppError Usage

All business logic throws `AppError` (from `error-factory.ts`). Never throw raw strings or `Error` objects in tool handlers.

```typescript
import { AppError, getJsonRpcCode } from "@/shared/errors/error-factory.ts";
import { ERROR_CODE } from "@/shared/errors/error-code.ts";

// In service layer
throw new AppError(ERROR_CODE.NOT_FOUND, { id });
throw new AppError(ERROR_CODE.VALIDATION_ERROR, { field: "email", message: "Invalid format" });
```

`AppError` extends Hono's `HTTPException` with:
- `code: ErrorCode` — the internal error type
- `details?: Record<string, unknown>` — additional context

---

## 4. Tool Handler Error Pattern

Every tool handler must handle errors in this order:

```typescript
async (args, ctx): Promise<CallToolResult> => {
  try {
    const result = await healthService.findOne(args.id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    // 1. AppError — map to JSON-RPC code
    if (error instanceof AppError) {
      const code = getJsonRpcCode(error.code);
      return {
        content: [{ type: "text", text: JSON.stringify({ error: error.message, code }) }],
        isError: true,
      };
    }
    // 2. Fallback — always return -32603 for unknown errors
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
}
```

**Rule:** Never hardcode `-32601` or `-32602` directly. Always go through `AppError` + `getJsonRpcCode()`.

---

## 5. HTTP Layer Errors (Non-Tool)

These errors occur before the transport handles the request. They return a raw JSON-RPC response, not a `CallToolResult`.

### Missing Authorization (401)

```typescript
// From mcpAuthMiddleware
return c.json(
  { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null },
  401,
);
```

### Disallowed Origin (403)

```typescript
// From originValidationMiddleware
return c.json(
  { jsonrpc: "2.0", error: { code: -32000, message: "Forbidden" } },
  403,
);
```

### Unsupported Protocol Version (400)

```typescript
// From handleMcpRequest in app.mcp.ts
return c.json(
  {
    jsonrpc: "2.0",
    error: { code: -32000, message: `Unsupported MCP protocol version: ${protoVersion}` },
  },
  400,
);
```

### Stale Session (400)

```typescript
// From getOrCreateSession in app.mcp.ts
return c.json(
  { jsonrpc: "2.0", error: { code: -32000, message: "Session not found. Client must re-initialize." }, id: null },
  400,
);
```

### Internal Server Error (500)

```typescript
// From handleMcpRequest in app.mcp.ts
return c.json(
  {
    jsonrpc: "2.0",
    error: {
      code: -32603,
      message: error instanceof Error ? error.message : String(error),
    },
    id: errorId,
  },
  500,
);
```

---

## 6. Error Response Shape Summary

### Success (HTTP 200/202)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{ "type": "text", "text": "{\"id\": 1, \"data\": {...}}" }],
    "structuredContent": { "id": 1, "data": {...} }
  }
}
```

### Tool Error (HTTP 200/202, `isError: true`)

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{ "type": "text", "text": "{\"error\":\"Not found\",\"code\":-32601}" }],
    "isError": true
  }
}
```

### Auth Error (HTTP 401)

```json
{
  "jsonrpc": "2.0",
  "error": { "code": -32001, "message": "Unauthorized" }
}
```

### Internal Error (HTTP 500)

```json
{
  "jsonrpc": "2.0",
  "error": { "code": -32603, "message": "Unexpected error message" },
  "id": 1
}
```

---

## 7. Adding New Error Codes

1. Add to `error-code.ts`:
   ```typescript
   CONFLICT = "CONFLICT",
   ```

2. Add mapping in `error-factory.ts`:
   ```typescript
   const ERROR_JSON_RPC_MAP: Record<string, number> = {
     [ERROR_CODE.CONFLICT]: -32002,  // new code in -32000s range
     // ...
   };
   ```

3. Use in service layer:
   ```typescript
   throw new AppError(ERROR_CODE.CONFLICT, { resource: "health", existingId: id });
   ```

4. Update this document's reference table.