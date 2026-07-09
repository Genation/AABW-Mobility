import type { Context } from "@hono/hono";
import { track4Service } from "./track-4-autocomplete.service.ts";
import type { SuggestRequest } from "./track-4-autocomplete.dto.ts";
import { getQuery } from "@/shared/utils/validate.ts";

export const track4Controller = {
  suggest(c: Context) {
    const query = getQuery<SuggestRequest>(c);
    const result = track4Service.suggest(query.q, {
      lat: query.lat,
      lng: query.lng,
      limit: query.limit,
    });
    return c.json(result);
  },

  async init(c: Context) {
    await track4Service.init();
    return c.json({ status: "ok" });
  },
};
