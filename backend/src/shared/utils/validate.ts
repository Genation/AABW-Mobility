/**
 * Validation Middleware for Hono
 *
 * Middleware validates:
 * - ctx.req.param() (URL path parameters)
 * - ctx.req.query() (query string)
 * - ctx.req.json() (JSON body)
 *
 * Attaches validated data to c.set() for type-safe access in handlers
 */

import { z } from "zod/v4";
import type { MiddlewareHandler } from "@hono/hono";
import type { Bindings, Variables } from "@/shared/types/app.type.ts";
import { AppError, ERROR_CODE } from "@/shared/errors/error-factory.ts";

/**
 * Extended Variables to include validated data
 */
export type ValidatedVariables = Variables & {
  validated: {
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
  };
};

/**
 * App environment type
 */
export type AppEnv = { Bindings: Bindings; Variables: ValidatedVariables };

/**
 * Options for validateRequest middleware with type inference
 */
export interface ValidateRequestOptions<
  TParams = undefined,
  TQuery = undefined,
  TBody = undefined,
> {
  /** Schema to validate URL path parameters */
  params?: TParams extends z.ZodSchema ? TParams : never;
  /** Schema to validate query string parameters */
  query?: TQuery extends z.ZodSchema ? TQuery : never;
  /** Schema to validate request body */
  body?: TBody extends z.ZodSchema ? TBody : never;
}

/**
 * Inferred types from validated request
 */
export type InferredParams<T extends z.ZodSchema | undefined> = T extends
  z.ZodSchema ? z.infer<T> : undefined;

export type InferredQuery<T extends z.ZodSchema | undefined> = T extends
  z.ZodSchema ? z.infer<T> : undefined;

export type InferredBody<T extends z.ZodSchema | undefined> = T extends
  z.ZodSchema ? z.infer<T> : undefined;

/**
 * Type for validated context
 */
type ValidatedContext = {
  get: (key: "validated") => ValidatedVariables["validated"] | undefined;
};

/**
 * Get validated params from context
 * Throws if params were not validated by middleware
 */
export function getParams<T = Record<string, unknown>>(c: ValidatedContext): T {
  const validated = c.get("validated");
  const data = validated?.params as T | undefined;
  if (data === undefined) {
    throw new AppError(ERROR_CODE.VALIDATION_ERROR, {
      message:
        "Params validation not applied. Add validateRequest({ params: ... }) middleware.",
    });
  }
  return data;
}

/**
 * Get validated query from context
 * Throws if query was not validated by middleware
 */
export function getQuery<T = Record<string, unknown>>(c: ValidatedContext): T {
  const validated = c.get("validated");
  const data = validated?.query as T | undefined;
  if (data === undefined) {
    throw new AppError(ERROR_CODE.VALIDATION_ERROR, {
      message:
        "Query validation not applied. Add validateRequest({ query: ... }) middleware.",
    });
  }
  return data;
}

/**
 * Get validated body from context
 * Throws if body was not validated by middleware
 */
export function getBody<T = Record<string, unknown>>(c: ValidatedContext): T {
  const validated = c.get("validated");
  const data = validated?.body as T | undefined;
  if (data === undefined) {
    throw new AppError(ERROR_CODE.VALIDATION_ERROR, {
      message:
        "Body validation not applied. Add validateRequest({ body: ... }) middleware.",
    });
  }
  return data;
}

/**
 * Type-safe getParams with explicit type parameter (recommended)
 * Use this when you need to narrow the type from the schema inference
 */
export function getParamsTyped<T>(c: ValidatedContext): T {
  return getParams<T>(c);
}

/**
 * Type-safe getQuery with explicit type parameter (recommended)
 */
export function getQueryTyped<T>(c: ValidatedContext): T {
  return getQuery<T>(c);
}

/**
 * Type-safe getBody with explicit type parameter (recommended)
 */
export function getBodyTyped<T>(c: ValidatedContext): T {
  return getBody<T>(c);
}

/**
 * Validation Middleware Factory
 *
 * @param options - Schemas to validate
 * @returns Hono middleware that validates and attaches validated data
 *
 * @example
 * ```typescript
 * import { validateRequest, getParams, getBody } from "@/shared/utils/validate.ts";
 * import { AppEnv } from "@/shared/utils/hono.ts";
 * import { z } from "zod";
 *
 * // Define schemas
 * const ParamsSchema = z.object({ id: z.string() });
 * const BodySchema = z.object({ name: z.string() });
 *
 * const router = new Hono<AppEnv>()
 *   .post("/:id",
 *     validateRequest({
 *       params: ParamsSchema,
 *       body: BodySchema,
 *     }),
 *     async (c) => {
 *       const params = getParams<z.infer<typeof ParamsSchema>>(c);
 *       const body = getBody<z.infer<typeof BodySchema>>(c);
 *       // params.id is guaranteed to be string
 *       // body.name is guaranteed to be string
 *     }
 *   );
 * ```
 */
export function validateRequest<
  TParams = undefined,
  TQuery = undefined,
  TBody = undefined,
>(
  options: ValidateRequestOptions<TParams, TQuery, TBody>,
): MiddlewareHandler<AppEnv, string, Record<string, never>> {
  return async (c, next) => {
    const errors: Record<string, string[]> = {};
    const validated: ValidatedVariables["validated"] = {};

    // Validate params
    if (options.params) {
      try {
        const params = c.req.param();
        validated.params = options.params.parse(params) as Record<
          string,
          unknown
        >;
      } catch (err) {
        if (err instanceof z.ZodError) {
          errors.params = err.issues.map((e) =>
            `${e.path.join(".")}: ${e.message}`
          );
        }
      }
    }

    // Validate query
    if (options.query) {
      try {
        const query = c.req.query();
        validated.query = options.query.parse(query) as Record<string, unknown>;
      } catch (err) {
        if (err instanceof z.ZodError) {
          errors.query = err.issues.map((e) =>
            `${e.path.join(".")}: ${e.message}`
          );
        }
      }
    }

    // Validate body
    if (options.body) {
      try {
        const body = await c.req.json();
        validated.body = options.body.parse(body) as Record<string, unknown>;
      } catch (err) {
        if (err instanceof z.ZodError) {
          errors.body = err.issues.map((e) =>
            `${e.path.join(".")}: ${e.message}`
          );
        } else {
          errors.body = ["Invalid JSON body"];
        }
      }
    }

    // If there are validation errors, throw 400
    if (Object.keys(errors).length > 0) {
      const flatErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(errors)) {
        flatErrors[key] = value.join("; ");
      }
      throw new AppError(ERROR_CODE.VALIDATION_ERROR, {
        message: "Request validation failed",
        ...flatErrors,
      });
    }

    // Attach validated data to context
    c.set("validated", validated);
    await next();
  };
}
