import { Hono } from "@hono/hono";
import { z } from "zod/v4";
import { createSuccessResponse } from "@/shared/responses.ts";
import { ApiKeyCreateSchema, ApiKeyParamSchema } from "./api-key.dto.ts";
import { apiKeyService } from "./api-key.service.ts";
import {
  getBody,
  getParams,
  validateRequest,
} from "@/shared/utils/validate.ts";
import type { AppEnv } from "@/shared/utils/validate.ts";

const apiKeyRouter = new Hono<AppEnv>();

apiKeyRouter.post(
  "/",
  validateRequest({ body: ApiKeyCreateSchema }),
  async (c) => {
    const body = getBody<z.infer<typeof ApiKeyCreateSchema>>(c);
    const user = c.get("user");
    if (!user) {
      return c.json({
        ok: false,
        error: { message: "Unauthorized", code: "UNAUTHORIZED", details: null },
        data: null,
        timestamp: Date.now(),
      }, 401);
    }
    const result = await apiKeyService.create(body.name, user.userId);
    return c.json(createSuccessResponse({ ...result.record }), 201);
  },
);

apiKeyRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({
      ok: false,
      error: { message: "Unauthorized", code: "UNAUTHORIZED", details: null },
      data: null,
      timestamp: Date.now(),
    }, 401);
  }
  const keys = await apiKeyService.list(user.userId);
  return c.json(createSuccessResponse(keys.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    revokedAt: k.revokedAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }))));
});

apiKeyRouter.delete(
  "/:id",
  validateRequest({ params: ApiKeyParamSchema }),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({
        ok: false,
        error: { message: "Unauthorized", code: "UNAUTHORIZED", details: null },
        data: null,
        timestamp: Date.now(),
      }, 401);
    }
    const params = getParams<z.infer<typeof ApiKeyParamSchema>>(c);
    await apiKeyService.revoke(params.id, user.userId);
    return c.body(null, 204);
  },
);

export default apiKeyRouter;
