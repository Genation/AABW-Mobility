import * as ERROR_CODE from "@/shared/errors/error-code.ts";
import type { ErrorCode } from "@/shared/errors/error-code.ts";
import { ContentfulStatusCode } from "@hono/hono/utils/http-status";

export const ERROR_MESSAGES: Record<ErrorCode, {
  message: string;
  status: ContentfulStatusCode;
}> = {
  [ERROR_CODE.ENV_NOT_SET]: {
    message: "Environment variables are not set",
    status: 500,
  },
  [ERROR_CODE.UNAUTHORIZED]: {
    message: "Unauthorized",
    status: 401,
  },
  [ERROR_CODE.FORBIDDEN]: {
    message: "Forbidden",
    status: 403,
  },
  [ERROR_CODE.VALIDATION_ERROR]: {
    message: "Request validation failed",
    status: 400,
  },
  [ERROR_CODE.NOT_FOUND]: {
    message: "Not found",
    status: 404,
  },
  [ERROR_CODE.API_KEY_NOT_FOUND]: {
    message: "API key not found or already revoked.",
    status: 404,
  },
  [ERROR_CODE.API_KEY_INVALID]: {
    message: "Invalid API key.",
    status: 401,
  },
  [ERROR_CODE.AI_SERVICE_UNAVAILABLE]: {
    message: "Hai AI service is unavailable",
    status: 503,
  },
};
