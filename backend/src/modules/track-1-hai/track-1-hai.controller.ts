import type { Context } from "@hono/hono";
import { getBody } from "@/shared/utils/validate.ts";
import type { IntentSearchRequest } from "./track-1-hai.dto.ts";
import { track1HaiService } from "./track-1-hai.service.ts";

export const track1HaiController = {
  async understand(c: Context) {
    const body = getBody<IntentSearchRequest>(c);
    return c.json(await track1HaiService.understand(body));
  },
};
