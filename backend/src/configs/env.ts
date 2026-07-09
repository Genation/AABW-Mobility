import { AppError, ERROR_CODE } from "@/shared/errors/error-factory.ts";

export type ENV = {
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  SUPABASE_ANON_KEY: string;
  PORT: number;
  ALLOWED_ORIGINS: string;
};

let _env: ENV | undefined;

const getEnv = (): ENV => {
  if (_env) return _env;

  _env = {
    DATABASE_URL: Deno.env.get("DATABASE_URL")!,
    SUPABASE_URL: Deno.env.get("SUPABASE_URL")!,
    SUPABASE_SECRET_KEY: Deno.env.get("SUPABASE_SECRET_KEY")!,
    SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY")!,
    PORT: Number(Deno.env.get("PORT")) || 8906,
    ALLOWED_ORIGINS: Deno.env.get("ALLOWED_ORIGINS") || "*",
  };

  if (
    !_env.DATABASE_URL || !_env.SUPABASE_URL || !_env.SUPABASE_SECRET_KEY ||
    !_env.SUPABASE_ANON_KEY
  ) {
    const missing: Record<string, string> = {};
    if (!_env.DATABASE_URL) missing.DATABASE_URL = "(not set)";
    if (!_env.SUPABASE_URL) missing.SUPABASE_URL = "(not set)";
    if (!_env.SUPABASE_SECRET_KEY) missing.SUPABASE_SECRET_KEY = "(not set)";
    if (!_env.SUPABASE_ANON_KEY) missing.SUPABASE_ANON_KEY = "(not set)";

    throw new AppError(ERROR_CODE.ENV_NOT_SET, missing);
  }

  return _env;
};

export const env = getEnv();
