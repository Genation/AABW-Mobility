import { Hono } from "@hono/hono";
import type { AppEnv } from "@/shared/utils/validate.ts";
import { validateRequest } from "@/shared/utils/validate.ts";
import { track1HaiController } from "./track-1-hai.controller.ts";
import { IntentSearchRequestSchema } from "./track-1-hai.dto.ts";

export const track1HaiRouter = new Hono<AppEnv>().post(
  "/understand",
  validateRequest({ body: IntentSearchRequestSchema }),
  (c) => track1HaiController.understand(c),
);
