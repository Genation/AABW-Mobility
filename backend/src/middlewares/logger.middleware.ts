import { logger } from "@/configs/logger.ts";
import type { Context, Next } from "@hono/hono";

export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  logger.info(
    `${c.req.method} ${c.req.path} - ${c.res.status} [${duration}ms]`,
  );
};
