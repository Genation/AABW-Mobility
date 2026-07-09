import {
  boolean,
  customType,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Custom vector type for pgvector
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(384)";
  },
});

// =============================================================================
// Track 4: AI-Powered Autocomplete & Query Suggestions
// =============================================================================

export const track4PoiTable = pgTable(
  "track_4_pois",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    originalId: varchar("original_id", { length: 20 }).notNull(),
    poiName: text("poi_name").notNull(),
    category: varchar("category", { length: 100 }),
    brand: varchar("brand", { length: 100 }),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewCount: integer("review_count"),
    popularityScore: integer("popularity_score"),
    tags: jsonb("tags").$type<string[]>(),
    isGenerated: boolean("is_generated").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_track_4_pois_category").on(table.category),
    index("idx_track_4_pois_brand").on(table.brand),
    index("idx_track_4_pois_city").on(table.city),
  ],
).enableRLS();

export const track4AutocompleteTable = pgTable(
  "track_4_autocomplete_entries",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    originalId: varchar("original_id", { length: 20 }).notNull(),
    inputPrefix: text("input_prefix").notNull(),
    suggestionText: text("suggestion_text").notNull(),
    suggestionType: varchar("suggestion_type", { length: 50 }).notNull(),
    score: decimal("score", { precision: 4, scale: 3 }).notNull(),
    queryFrequency: integer("query_frequency"),
    isGenerated: boolean("is_generated").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_track_4_ac_prefix").on(table.inputPrefix),
    index("idx_track_4_ac_type").on(table.suggestionType),
  ],
).enableRLS();

export const track4AbbreviationTable = pgTable(
  "track_4_abbreviations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    abbreviation: varchar("abbreviation", { length: 50 }).notNull(),
    expandedForm: varchar("expanded_form", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    isGenerated: boolean("is_generated").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("idx_track_4_abbr_type").on(table.type)],
).enableRLS();

export const track4PopularQueryTable = pgTable(
  "track_4_popular_queries",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    originalId: varchar("original_id", { length: 20 }).notNull(),
    queryText: text("query_text").notNull(),
    intentType: varchar("intent_type", { length: 50 }).notNull(),
    monthlyFrequency: integer("monthly_frequency").notNull(),
    region: varchar("region", { length: 100 }),
    isGenerated: boolean("is_generated").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_track_4_pq_region").on(table.region),
    index("idx_track_4_pq_intent").on(table.intentType),
  ],
).enableRLS();

export const track4EvaluationTable = pgTable(
  "track_4_evaluations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    originalId: varchar("original_id", { length: 20 }).notNull(),
    inputPrefix: text("input_prefix").notNull(),
    expectedSuggestionType: varchar("expected_suggestion_type", {
      length: 100,
    }),
    expectedTopSuggestions: jsonb("expected_top_suggestions").$type<string[]>(),
    difficulty: varchar("difficulty", { length: 20 }),
    skillsTested: text("skills_tested"),
    isGenerated: boolean("is_generated").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("idx_track_4_eval_difficulty").on(table.difficulty)],
).enableRLS();

export const track4EmbeddingTable = pgTable(
  "track_4_suggestion_embeddings",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    displayText: text("display_text").notNull(),
    queryType: varchar("query_type", { length: 100 }).default(
      "Discovery Search",
    ),
    embedding: vector("embedding").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
).enableRLS();
