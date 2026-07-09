import { jsonb, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const healthTable = pgTable("health", {
  id: serial("id").primaryKey(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}).enableRLS();
