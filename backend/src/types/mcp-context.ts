/**
 * Extended context type for MCP tool handlers.
 * Maps to the SDK's RequestHandlerExtra which provides logging through mcpReq.log.
 */
export interface McpToolContext {
  mcpReq?: {
    log(
      level: "debug" | "info" | "warn" | "error",
      data?: Record<string, unknown>,
      message?: string,
    ): void;
  };
}

/**
 * Generic context type for MCP tool handlers.
 * Accepts any object with optional mcpReq property for logging.
 */
export type ToolContext = {
  mcpReq?: {
    log(
      level: "debug" | "info" | "warn" | "error",
      data?: Record<string, unknown>,
      message?: string,
    ): void;
  };
  [key: string]: unknown;
};

/**
 * Helper to safely call mcpReq.log if available.
 * Accepts any object that may have an mcpReq property with a log method.
 */
export function logTool(
  ctx: ToolContext | Record<string, unknown>,
  level: "debug" | "info" | "warn" | "error",
  data: Record<string, unknown>,
  message: string,
): void {
  const mcpReq = ctx.mcpReq as {
    log(
      level: "debug" | "info" | "warn" | "error",
      data?: Record<string, unknown>,
      message?: string,
    ): void;
  } | undefined;
  mcpReq?.log?.(level, data, message);
}
