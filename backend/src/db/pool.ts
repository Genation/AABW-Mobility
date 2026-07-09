import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/configs/env.ts";
import { PgDatabase } from "drizzle-orm/pg-core";
import { logger } from "@/configs/logger.ts";
/**
 * @fileoverview
 * Singleton database connection pools for Client (RLS-enabled) and Admin (RLS-bypassed) usage.
 * These pools are shared across all requests in the application and should only be closed on application shutdown.
 */

/**
 * @private
 * @type {postgres.Sql | undefined}
 * Admin connection pool for bypassing RLS.
 * Single instance shared across all requests.
 */
let _dbPool: postgres.Sql | undefined;
// deno-lint-ignore no-explicit-any
let _db: PgDatabase<any> | undefined;

/**
 * Gets or creates the singleton admin pool (bypasses RLS).
 *
 * @remarks
 * Used for admin operations that require bypassing RLS policies.
 * Pool is shared across all requests.
 *
 * @returns {postgres.Sql} Shared postgres.Sql instance for admin (RLS-bypassed) connections.
 */
// deno-lint-ignore no-explicit-any
export const getDbPool = (): PgDatabase<any> => {
  if (!_dbPool) {
    _dbPool = postgres(env.DATABASE_URL, {
      max: 30,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  if (!_db) {
    _db = drizzle(_dbPool);
  }
  return _db;
};

export const db = getDbPool();

/**
 * Closes all singleton pools.
 *
 * @remarks
 * Should only be called during application shutdown.
 * DO NOT call this after each request!
 *
 * @returns {Promise<void>} Promise that resolves when all pools have been closed.
 */
export const closePool = async (): Promise<void> => {
  const promises: Promise<void>[] = [];
  if (_dbPool) {
    logger.info("[Pool] Closing database pool...");
    promises.push(_dbPool.end());
    _dbPool = undefined;
  }

  await Promise.all(promises);
  logger.info("[Pool] All pools closed");
};
