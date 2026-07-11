import { Hono } from "@hono/hono";
import type { AppEnv } from "@/shared/utils/validate.ts";
import { validateRequest } from "@/shared/utils/validate.ts";
import { track2HaiController } from "./track-2-hai.controller.ts";
import { SemanticSearchRequestSchema } from "./track-2-hai.dto.ts";

export const track2HaiRouter = new Hono<AppEnv>().post(
  "/search",
  validateRequest({ body: SemanticSearchRequestSchema }),
  (c) => track2HaiController.search(c),
);
