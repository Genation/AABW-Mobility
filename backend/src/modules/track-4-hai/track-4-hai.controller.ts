import type { Context } from "@hono/hono";
import { getQuery } from "@/shared/utils/validate.ts";
import { track4HaiService } from "./track-4-hai.service.ts";
import type { HaiSuggestRequest } from "./track-4-hai.dto.ts";

export const track4HaiController = {
  async suggest(c: Context) {
    const query = getQuery<HaiSuggestRequest>(c);
    const result = await track4HaiService.suggest(query.q, {
      lat: query.lat,
      lng: query.lng,
      limit: query.limit,
    });
    return c.json(result);
  },
};
