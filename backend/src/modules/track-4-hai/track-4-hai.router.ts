import { Hono } from "@hono/hono";
import type { AppEnv } from "@/shared/utils/validate.ts";
import { validateRequest } from "@/shared/utils/validate.ts";
import { track4HaiController } from "./track-4-hai.controller.ts";
import { HaiSuggestRequestSchema } from "./track-4-hai.dto.ts";

const router = new Hono<AppEnv>();

router.get(
  "/suggest",
  validateRequest({ query: HaiSuggestRequestSchema }),
  (c) => track4HaiController.suggest(c),
);

export const track4HaiRouter = router;
