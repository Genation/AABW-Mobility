import { logger } from "@/configs/logger.ts";
import { AppError } from "@/shared/errors/error-factory.ts";
import { createErrorResponse, ERROR_MESSAGES } from "@/shared/responses.ts";
import type { ErrorCode } from "@/shared/errors/error-code.ts";
import type { Context } from "@hono/hono";

export const errorHandler = (err: Error, c: Context) => {
  const appError = err as AppError;
  const isAppError = appError.name === "AppError" ||
    (appError.status && appError.code);

  if (isAppError) {
    logger.warn(
      `[${appError.code}] ${appError.message} ${
        appError.details ? JSON.stringify(appError.details) : ""
      }`,
    );

    const errorConfig =
      ERROR_MESSAGES[appError.code as keyof typeof ERROR_MESSAGES];
    const status = errorConfig?.status ?? appError.status ?? 500;
    const message = errorConfig?.message ?? appError.message;

    const response = createErrorResponse(
      appError.code as ErrorCode,
      message,
      appError.details,
    );
    return c.json(response, status);
  }

  logger.error(`[CRITICAL] ${appError.message}`);
  logger.error(appError.stack || "No stack trace available");

  const response = createErrorResponse(
    "INTERNAL_SERVER_ERROR" as ErrorCode,
    "Internal Server Error",
    undefined,
  );
  return c.json(response, 500);
};
