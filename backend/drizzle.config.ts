import { defineConfig } from "drizzle-kit";
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas.ts",
  schemaFilter: ["public"],
  dialect: "postgresql",
  dbCredentials: {
    url: Deno.env.get("DATABASE_URL")!,
  },
  entities: {
    roles: {
      provider: "supabase",
    },
  },
});
