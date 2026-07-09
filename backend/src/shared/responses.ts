import type { Context } from "@hono/hono";
import type { ErrorCode } from "@/shared/errors/error-code.ts";
import { ERROR_MESSAGES } from "@/shared/errors/error-detail.ts";
import { ContentfulStatusCode } from "@hono/hono/utils/http-status";

export { ERROR_MESSAGES };

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data: T | null;
  hasMore?: boolean;
  nextCursor?: string;
  error: {
    message: string;
    code: ErrorCode;
    details?: unknown;
  } | null;
  timestamp: number;
}

export interface PaginationOptions {
  hasMore?: boolean;
  nextCursor?: string;
}

export const createSuccessResponse = <T>(
  data: T,
  options: PaginationOptions = {},
): ApiResponse<T> => ({
  ok: true,
  data,
  hasMore: options.hasMore,
  nextCursor: options.nextCursor,
  error: null,
  timestamp: Date.now(),
});

export const createErrorResponse = (
  code: ErrorCode,
  message: string,
  details?: unknown,
): ApiResponse<null> => ({
  ok: false,
  data: null,
  hasMore: undefined,
  nextCursor: undefined,
  error: { code, message, details },
  timestamp: Date.now(),
});

export const responseMiddleware = () => {
  return async (c: Context, next: () => Promise<void>) => {
    c.ok = <T>(
      data: T,
      options: PaginationOptions = {},
      status: ContentfulStatusCode = 200,
    ) => {
      const response = createSuccessResponse(data, options);
      return c.json(response, status);
    };

    c.fail = (
      code: ErrorCode,
      details?: Record<string, unknown>,
      status?: ContentfulStatusCode,
    ) => {
      const errorConfig = ERROR_MESSAGES[code];
      const errorStatus = status ?? errorConfig?.status ?? 500;
      const errorMessage = errorConfig?.message ?? "Internal Server Error";
      const response = createErrorResponse(code, errorMessage, details);
      return c.json(response, errorStatus);
    };

    await next();
  };
};

declare module "@hono/hono" {
  interface Context {
    ok: <T>(
      data: T,
      options?: PaginationOptions,
      status?: ContentfulStatusCode,
    ) => Response;
    fail: (
      code: ErrorCode,
      details?: Record<string, unknown>,
      status?: ContentfulStatusCode,
    ) => Response;
  }
}
