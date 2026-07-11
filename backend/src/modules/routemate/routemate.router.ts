import { Hono } from "@hono/hono";
import type { AppEnv } from "@/shared/utils/validate.ts";
import { validateRequest } from "@/shared/utils/validate.ts";
import { routemateController } from "./routemate.controller.ts";
import { RouteMatePlanRequestSchema } from "./routemate.dto.ts";

export const routemateRouter = new Hono<AppEnv>().post(
  "/plan",
  validateRequest({ body: RouteMatePlanRequestSchema }),
  (c) => routemateController.plan(c),
);
