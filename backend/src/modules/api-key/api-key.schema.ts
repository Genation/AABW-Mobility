import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const apiKeyTable = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: varchar("key_prefix", { length: 24 }).notNull(),
  userId: uuid("user_id").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  // Add indexes
  index("idx_api_keys_user_id").on(table.userId),
  // Key hash & revokedAt for better look up
  index("idx_api_keys_key_hash").on(table.keyHash, table.revokedAt),
]).enableRLS();
