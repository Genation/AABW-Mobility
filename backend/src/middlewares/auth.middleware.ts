import { createMiddleware } from "@hono/hono/factory";
import type { Context } from "@hono/hono";
import { verifySupabaseJwt } from "@/shared/utils/auth/verify-jwt.ts";
import { ERROR_CODE } from "@/shared/errors/error-factory.ts";
import type { UserContext } from "@/shared/types/app.type.ts";

function extractToken(req: Request): string | null {
  const header = req.headers.get("Authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

export const authMiddleware = createMiddleware<{ Variables: { user: UserContext } }>(
  async (c: Context, next) => {
    const token = extractToken(c.req.raw);
    const jwt = await verifySupabaseJwt(token);

    if (jwt.role === "anon") {
      return c.json({
        ok: false,
        data: null,
        error: {
          message: "Unauthorized",
          code: ERROR_CODE.UNAUTHORIZED,
        },
        timestamp: Date.now(),
      }, 401);
    }

    const userContext: UserContext = {
      userId: jwt.sub!,
      ipAddress: c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") || "unknown",
    };

    c.set("user", userContext);
    await next();
  },
);
