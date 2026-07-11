import { haiAiService } from "@/intenals/hai-ai/hai-ai.service.ts";
import type { RouteMatePlanRequest } from "./routemate.dto.ts";

/**
 * RouteMate — route-aware discovery that unifies P6 (understanding), P7
 * (ranking), and P9 (autocomplete). Proxies to the Python `ml-service`
 * `POST /routemate/plan`, which infers the traveler's needs, finds real POIs
 * inside the route corridor, and ranks them by quality/detour.
 */
export const routemateService = {
  plan(input: RouteMatePlanRequest) {
    return haiAiService.routematePlan(input);
  },
};
