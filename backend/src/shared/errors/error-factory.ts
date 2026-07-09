import * as ERROR_CODE from "@/shared/errors/error-code.ts";
import { ERROR_MESSAGES } from "@/shared/errors/error-detail.ts";
import type { ErrorCode } from "@/shared/errors/error-code.ts";
import { HTTPException } from "@hono/hono/http-exception";

export { ERROR_CODE };

const ERROR_JSON_RPC_MAP: Record<string, number> = {
  [ERROR_CODE.UNAUTHORIZED]: -32001,
  [ERROR_CODE.FORBIDDEN]: -32000,
  [ERROR_CODE.NOT_FOUND]: -32601,
  [ERROR_CODE.VALIDATION_ERROR]: -32602,
  [ERROR_CODE.INTERNAL_SERVER_ERROR]: -32603,
};

/**
 * Converts an ErrorCode to its corresponding JSON-RPC error code.
 */
export function getJsonRpcCode(code: ErrorCode): number {
  return ERROR_JSON_RPC_MAP[code] ?? -32603;
}

export class AppError extends HTTPException {
  code: ErrorCode;
  details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    details?: Record<string, unknown>,
  ) {
    const config = ERROR_MESSAGES[code];
    const status = config?.status ?? 500;
    const message = config?.message ?? "Internal Server Error";

    super(status, {
      message,
      cause: details,
    });
    this.code = code;
    this.details = details;
    this.name = "AppError";

    Object.setPrototypeOf(this, AppError.prototype);
  }
}
