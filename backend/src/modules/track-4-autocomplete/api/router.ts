import { Hono } from "@hono/hono";
import { track4Controller } from "./controller.ts";
import { validateRequest } from "@/shared/utils/validate.ts";
import type { AppEnv } from "@/shared/utils/validate.ts";
import { SuggestRequestSchema } from "../schema/dto.ts";

const router = new Hono<AppEnv>();

router.get(
  "/suggest",
  validateRequest({ query: SuggestRequestSchema }),
  (c) => track4Controller.suggest(c),
);

export default router;
