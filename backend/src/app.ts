import { cors } from "@hono/hono/cors";
import { loggerMiddleware } from "@/middlewares/logger.middleware.ts";
import { authMiddleware } from "@/middlewares/auth.middleware.ts";
import { errorHandler } from "@/middlewares/error-handler.ts";
import { responseMiddleware } from "@/shared/responses.ts";
import { router } from "@/router.ts";
import { createHonoApp } from "@/shared/utils/hono.ts";

export const createApp = () => {
  return createHonoApp()
    .use("*", cors({ origin: "*" }))
    .use("*", loggerMiddleware)
    .use(responseMiddleware())
    .onError(errorHandler)
    .route("/", router);
};

export const createTestApp = () => {
  return createHonoApp()
    .use("*", cors({ origin: "*" }))
    .use("*", authMiddleware)
    .use(responseMiddleware())
    .onError(errorHandler)
    .route("/", router);
};
