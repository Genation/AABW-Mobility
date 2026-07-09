import { createTestApp } from "@/app.ts";
import { logger } from "@/configs/logger.ts";
import { env } from "@/configs/env.ts";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);

const TEST_USER = {
  id: "b82303fb-7bd8-4de9-8f01-037442724252",
  email: "admin-test@example.com",
  password: "123456",
};

/** Cached test JWT token — reused across all test suites to avoid ~25s signInWithPassword call each time. */
let _cachedTestToken: string | null = null;

/** Returns the cached token, or "" if not yet initialized. */
export const getCachedTestToken = () => _cachedTestToken ?? "";

export interface FetchClientResponse<T = unknown> {
  status: number;
  data: T | null;
  response: Response;
}

export interface TestAppInstance {
  token: string;
  fetchClient: <T = unknown>(
    path: string,
    options?: RequestInit,
    token?: string,
  ) => Promise<FetchClientResponse<T>>;
  port: number;
  baseUrl: string;
  close: () => Promise<void>;
}

async function ensureTestUser(): Promise<string> {
  // Return cached token if available — Supabase JWT is valid for 1 hour
  if (_cachedTestToken) {
    logger.info("[Test] Reusing cached JWT token");
    return _cachedTestToken;
  }

  const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(
    TEST_USER.id,
  );
  logger.info(`[Test] Supabase User: ${existingUser?.user?.email}`);

  if (!existingUser?.user) {
    logger.info("[Test] Creating test user...");
    const { error } = await supabaseAdmin.auth.admin.createUser({
      id: TEST_USER.id,
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: { name: "Test User" },
    });
    if (error) {
      throw new Error(`[Test] Failed to create user: ${error.message}`);
    }
  }

  const { data: sessionData } = await supabaseAdmin.auth.signInWithPassword({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });

  if (sessionData?.session) {
    _cachedTestToken = sessionData.session.access_token;
    logger.info("[Test] Cached JWT token for reuse");
  }

  return _cachedTestToken ?? "";
}

async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  token?: string,
): Promise<FetchClientResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  let data = null as T | null;
  if (response.headers.get("content-type")?.includes("application/json")) {
    data = await response.json();
  }

  return { status: response.status, data, response };
}

export async function setupTestApp(): Promise<
  TestAppInstance & { token: string }
> {
  const app = createTestApp();
  // Health endpoint must be registered BEFORE authMiddleware, otherwise
  // the polling check below fails with 401 (no Authorization header).
  app.get("/ready", (c) => c.json({ ready: true }));
  const token = await ensureTestUser();

  const port = env.PORT + Math.floor(Math.random() * 1000);
  const baseUrl = `http://localhost:${port}/api/v1`;

  const server = Deno.serve({
    port,
    async handler(req) {
      return await app.fetch(req);
    },
  });

  // Poll /ready instead of fixed 500ms sleep — server is ready as soon as it responds.
  // Note: /ready is behind authMiddleware, so we must pass the token.
  const startMs = Date.now();
  while (Date.now() - startMs < 5000) {
    try {
      const r = await fetch(`http://localhost:${port}/ready`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        logger.info(`[Test] Server ready on port ${port} (polled ${Date.now() - startMs}ms)`);
        break;
      }
    } catch {
      // not ready yet
    }
    await new Promise<void>((r) => setTimeout(r, 50));
  }

  return {
    fetchClient: <T = unknown>(
      path: string,
      options: RequestInit = {},
      token?: string,
    ) => {
      const fullUrl = `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
      return fetchJson<T>(fullUrl, options, token);
    },
    token,
    port,
    baseUrl,
    close: async () => {
      logger.info("[Test] Closing server...");
      await server.shutdown();
    },
  };
}
