import { createRemoteJWKSet, jwtVerify } from "jose";
import type { JwtToken } from "@/shared/types/jwt-token.type.ts";
import { env } from "@/configs/env.ts";

const JWKS_URL = `${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`;
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export async function verifySupabaseJwt(
  token: string | null,
): Promise<JwtToken> {
  if (!token) return { role: "anon" };

  try {
    const { payload } = await jwtVerify(token, JWKS);
    return payload as JwtToken;
  } catch (jwksError: unknown) {
    const error = jwksError as { code?: string };
    if (error.code === "ERR_JWT_EXPIRED") {
      return { role: "anon" };
    }
  }
  return { role: "anon" };
}
