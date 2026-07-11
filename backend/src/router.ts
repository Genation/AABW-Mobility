import { Hono } from "@hono/hono";
import healthRouter from "@/modules/health/health.router.ts";
import apiKeyRouter from "@/modules/api-key/api-key.router.ts";
import track4AutocompleteRouter from "@/modules/track-4-autocomplete/api/router.ts";
import { track1HaiRouter } from "@/modules/track-1-hai/track-1-hai.router.ts";
import { track2HaiRouter } from "@/modules/track-2-hai/track-2-hai.router.ts";
import { track4HaiRouter } from "@/modules/track-4-hai/track-4-hai.router.ts";
import { routemateRouter } from "@/modules/routemate/routemate.router.ts";
import type { AppEnv } from "@/shared/utils/hono.ts";

const prefix = "/api/v1";

export const router = new Hono<AppEnv>()
  .route(`${prefix}/health`, healthRouter)
  .route(`${prefix}/api-keys`, apiKeyRouter)
  .route(`${prefix}/track-1-hai`, track1HaiRouter)
  .route(`${prefix}/track-2-hai`, track2HaiRouter)
  // Backward-compatible team route plus an explicit owner-labelled route.
  .route(`${prefix}/track-4`, track4AutocompleteRouter)
  .route(`${prefix}/track-4-phong`, track4AutocompleteRouter)
  .route(`${prefix}/track-4-hai`, track4HaiRouter)
  .route(`${prefix}/routemate`, routemateRouter);
