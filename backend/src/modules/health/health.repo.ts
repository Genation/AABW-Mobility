import { db } from "@/db/pool.ts";
import { healthTable } from "./health.schema.ts";
import type { z } from "zod/v4";
import {
  HealthCreateSchema,
  HealthQuerySchema,
  HealthSelectSchema,
  HealthUpdateSchema,
} from "./health.dto.ts";
import { and, desc, eq, lt } from "drizzle-orm";

export const healthRepo = {
  create: async (
    data: z.infer<typeof HealthCreateSchema>,
  ): Promise<z.infer<typeof HealthSelectSchema>> => {
    const [result] = await db
      .insert(healthTable)
      .values(data)
      .returning();
    return result as z.infer<typeof HealthSelectSchema>;
  },

  findMany: async (query: z.infer<typeof HealthQuerySchema>) => {
    const conditions = [];
    if (query.latestAt) {
      conditions.push(lt(healthTable.createdAt, query.latestAt));
    }

    const whereClause = conditions.length > 0
      ? (conditions.length === 1 ? conditions[0] : and(...conditions))
      : undefined;

    const data = await db
      .select({
        id: healthTable.id,
        data: healthTable.data,
        createdAt: healthTable.createdAt,
        updatedAt: healthTable.updatedAt,
      })
      .from(healthTable)
      .where(whereClause)
      .limit(query.limit + 1)
      .orderBy(desc(healthTable.createdAt));

    const hasMore = data.length > query.limit;
    const items = data.slice(0, query.limit);
    const nextCursor = hasMore && items.length > 0
      ? items[items.length - 1]?.createdAt
      : null;

    return { data: items, hasMore, nextCursor };
  },

  findOne: async (
    id: number,
  ): Promise<z.infer<typeof HealthSelectSchema> | null> => {
    const [result] = await db
      .select({
        id: healthTable.id,
        data: healthTable.data,
        createdAt: healthTable.createdAt,
        updatedAt: healthTable.updatedAt,
      })
      .from(healthTable)
      .where(eq(healthTable.id, id));
    return (result as z.infer<typeof HealthSelectSchema>) ?? null;
  },

  update: async (
    id: number,
    data: z.infer<typeof HealthUpdateSchema>,
  ): Promise<z.infer<typeof HealthSelectSchema> | null> => {
    const [result] = await db
      .update(healthTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(healthTable.id, id))
      .returning();
    return (result as z.infer<typeof HealthSelectSchema>) ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await db.delete(healthTable).where(eq(healthTable.id, id));
  },
};
