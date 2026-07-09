import { db } from "@/db/pool.ts";
import { apiKeyTable } from "./api-key.schema.ts";
import { and, eq, isNull } from "drizzle-orm";

export const apiKeyRepo = {
  create: async (
    data: {
      name: string;
      keyHash: string;
      keyPrefix: string;
      userId: string;
    },
  ) => {
    const [result] = await db.insert(apiKeyTable).values(data).returning();
    return result;
  },

  /** Finds by prefix, skips revoked keys. Hash compare is in the service layer. */
  findByPrefixAndHash: async (prefix: string) => {
    const [result] = await db
      .select({
        id: apiKeyTable.id,
        name: apiKeyTable.name,
        keyHash: apiKeyTable.keyHash,
        keyPrefix: apiKeyTable.keyPrefix,
        userId: apiKeyTable.userId,
        createdAt: apiKeyTable.createdAt,
      })
      .from(apiKeyTable)
      .where(
        and(eq(apiKeyTable.keyPrefix, prefix), isNull(apiKeyTable.revokedAt)),
      );
    return result ?? null;
  },

  /** Returns all keys for a user including revoked (for audit trail). */
  findByUser: async (userId: string) => {
    return await db
      .select({
        id: apiKeyTable.id,
        name: apiKeyTable.name,
        keyPrefix: apiKeyTable.keyPrefix,
        revokedAt: apiKeyTable.revokedAt,
        userId: apiKeyTable.userId,
        createdAt: apiKeyTable.createdAt,
      })
      .from(apiKeyTable)
      .where(eq(apiKeyTable.userId, userId));
  },

  /** Soft delete: sets revokedAt. */
  revoke: async (id: string): Promise<void> => {
    await db
      .update(apiKeyTable)
      .set({ revokedAt: new Date() })
      .where(eq(apiKeyTable.id, id));
  },
};
