import { Hono } from "@hono/hono";
import { track4Controller } from "./track-4-autocomplete.controller.ts";
import { validateRequest } from "@/shared/utils/validate.ts";
import type { AppEnv } from "@/shared/utils/validate.ts";
import { SuggestRequestSchema } from "./track-4-autocomplete.dto.ts";

const router = new Hono<AppEnv>();

router.get(
  "/suggest",
  validateRequest({ query: SuggestRequestSchema }),
  (c) => track4Controller.suggest(c),
);

export default router;
