import type { Context } from "@hono/hono";
import { getBody } from "@/shared/utils/validate.ts";
import type { RouteMatePlanRequest } from "./routemate.dto.ts";
import { routemateService } from "./routemate.service.ts";

export const routemateController = {
  async plan(c: Context) {
    const body = getBody<RouteMatePlanRequest>(c);
    return c.json(await routemateService.plan(body));
  },
};
