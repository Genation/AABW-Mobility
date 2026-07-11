import type { Context } from "@hono/hono";
import { getBody } from "@/shared/utils/validate.ts";
import type { SemanticSearchRequest } from "./track-2-hai.dto.ts";
import { track2HaiService } from "./track-2-hai.service.ts";

export const track2HaiController = {
  async search(c: Context) {
    const body = getBody<SemanticSearchRequest>(c);
    return c.json(await track2HaiService.search(body));
  },
};
