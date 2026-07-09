import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { PgTable } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

/**
 * DTO Builder - Creates schemas from Drizzle tables (snake_case)
 */
export function createDto<const T extends PgTable>(table: T) {
  return {
    insert: createInsertSchema(table),
    select: createSelectSchema(table),
    update: createUpdateSchema(table),
  };
}

/**
 * Common query schemas (snake_case)
 */
export const QuerySchema = z.object({
  query: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  latestAt: z.coerce.date().optional(),
});
