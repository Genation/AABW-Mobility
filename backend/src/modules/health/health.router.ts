import { Hono } from "@hono/hono";
import { z } from "zod/v4";
import { createSuccessResponse } from "@/shared/responses.ts";
import {
  HealthCreateSchema,
  HealthParamSchema,
  HealthQuerySchema,
  HealthUpdateSchema,
} from "./health.dto.ts";
import { healthService } from "./health.service.ts";
import {
  getBody,
  getParams,
  getQuery,
  validateRequest,
} from "@/shared/utils/validate.ts";
import { AppEnv } from "@/shared/utils/hono.ts";

const healthRouter = new Hono<AppEnv>();

// NOTE: Static routes (with specific segments) must come BEFORE dynamic routes (/:id)

// GET /health
healthRouter.get(
  "/",
  validateRequest({ query: HealthQuerySchema }),
  async (c) => {
    const query = getQuery<z.infer<typeof HealthQuerySchema>>(c);
    const result = await healthService.findMany(query);
    return c.json(createSuccessResponse(result.data, {
      hasMore: result.hasMore,
      nextCursor: result.nextCursor?.toISOString(),
    }));
  },
);

// POST /health
healthRouter.post(
  "/",
  validateRequest({ body: HealthCreateSchema }),
  async (c) => {
    const body = getBody<z.infer<typeof HealthCreateSchema>>(c);
    const result = await healthService.create(body);
    return c.json(createSuccessResponse(result), 201);
  },
);

// GET /health/:id/gap-test test only (MUST be before /:id)
healthRouter.get(
  "/:id/gap-test",
  validateRequest({ params: HealthParamSchema }),
  async (c) => {
    const params = getParams<z.infer<typeof HealthParamSchema>>(c);
    const result = await healthService.getDateGap(params.id);
    return c.json(createSuccessResponse(result));
  },
);

// GET /health/:id
healthRouter.get(
  "/:id",
  validateRequest({ params: HealthParamSchema }),
  async (c) => {
    const params = getParams<z.infer<typeof HealthParamSchema>>(c);
    const data = await healthService.findOne(params.id);
    return c.json(createSuccessResponse(data));
  },
);

// PATCH /health/:id
healthRouter.patch(
  "/:id",
  validateRequest({ params: HealthParamSchema, body: HealthUpdateSchema }),
  async (c) => {
    const params = getParams<z.infer<typeof HealthParamSchema>>(c);
    const body = getBody<z.infer<typeof HealthUpdateSchema>>(c);
    const result = await healthService.update(params.id, body);
    return c.json(createSuccessResponse(result));
  },
);

// DELETE /health/:id
healthRouter.delete(
  "/:id",
  validateRequest({ params: HealthParamSchema }),
  async (c) => {
    const params = getParams<z.infer<typeof HealthParamSchema>>(c);
    await healthService.delete(params.id);
    return c.body(null, 204);
  },
);

export default healthRouter;
