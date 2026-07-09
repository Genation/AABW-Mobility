import { Hono } from "@hono/hono";
import healthRouter from "@/modules/health/health.router.ts";
import apiKeyRouter from "@/modules/api-key/api-key.router.ts";
import type { AppEnv } from "@/shared/utils/hono.ts";

const prefix = "/api/v1";

export const router = new Hono<AppEnv>()
  .route(`${prefix}/health`, healthRouter)
  .route(`${prefix}/api-keys`, apiKeyRouter);
