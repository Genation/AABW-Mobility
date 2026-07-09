export type { ApiResponse, PaginationOptions } from "@/shared/responses.ts";

export type Bindings = {
  // Example:
  // DATABASE_URL: string
  // JWT_SECRET: string
  // API_KEY: string

  [key: string]: string | undefined;
};

/**
 * User context set by auth middleware
 */
export type UserContext = {
  userId: string;
  ipAddress: string;
};

/**
 * Variables: Data for each request (request-scoped)
 * Example: user after auth, requestId, tenantId...
 */
export type Variables = {
  // user context after auth (set by authMiddleware)
  user?: UserContext;
};
