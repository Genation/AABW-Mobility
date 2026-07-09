import { db } from "@/db/pool.ts";
import {
  track4AbbreviationTable,
  track4AutocompleteTable,
  track4EmbeddingTable,
  track4EvaluationTable,
  track4PoiTable,
  track4PopularQueryTable,
} from "../schema/schema.ts";
import { desc, eq, or, sql } from "drizzle-orm";

export const track4Repo = {
  getAllAbbreviations() {
    return db
      .select({
        abbreviation: track4AbbreviationTable.abbreviation,
        expandedForm: track4AbbreviationTable.expandedForm,
        type: track4AbbreviationTable.type,
        isGenerated: track4AbbreviationTable.isGenerated,
      })
      .from(track4AbbreviationTable);
  },

  getAllAutocompleteEntries() {
    return db
      .select({
        id: track4AutocompleteTable.id,
        originalId: track4AutocompleteTable.originalId,
        inputPrefix: track4AutocompleteTable.inputPrefix,
        suggestionText: track4AutocompleteTable.suggestionText,
        suggestionType: track4AutocompleteTable.suggestionType,
        score: track4AutocompleteTable.score,
        queryFrequency: track4AutocompleteTable.queryFrequency,
        isGenerated: track4AutocompleteTable.isGenerated,
      })
      .from(track4AutocompleteTable);
  },

  getAllPois() {
    return db
      .select({
        id: track4PoiTable.id,
        originalId: track4PoiTable.originalId,
        poiName: track4PoiTable.poiName,
        category: track4PoiTable.category,
        brand: track4PoiTable.brand,
        city: track4PoiTable.city,
        latitude: track4PoiTable.latitude,
        longitude: track4PoiTable.longitude,
        popularityScore: track4PoiTable.popularityScore,
        tags: track4PoiTable.tags,
        isGenerated: track4PoiTable.isGenerated,
      })
      .from(track4PoiTable);
  },

  getAllPopularQueries() {
    return db
      .select({
        id: track4PopularQueryTable.id,
        originalId: track4PopularQueryTable.originalId,
        queryText: track4PopularQueryTable.queryText,
        intentType: track4PopularQueryTable.intentType,
        monthlyFrequency: track4PopularQueryTable.monthlyFrequency,
        region: track4PopularQueryTable.region,
        isGenerated: track4PopularQueryTable.isGenerated,
      })
      .from(track4PopularQueryTable);
  },

  getPopularByRegion(region: string, limit = 10) {
    return db
      .select({
        queryText: track4PopularQueryTable.queryText,
        intentType: track4PopularQueryTable.intentType,
        monthlyFrequency: track4PopularQueryTable.monthlyFrequency,
        region: track4PopularQueryTable.region,
      })
      .from(track4PopularQueryTable)
      .where(
        or(
          eq(track4PopularQueryTable.region, region),
          eq(track4PopularQueryTable.region, "Toàn quốc"),
        ),
      )
      .orderBy(desc(track4PopularQueryTable.monthlyFrequency))
      .limit(limit);
  },

  getAllEvaluations() {
    return db
      .select({
        id: track4EvaluationTable.id,
        originalId: track4EvaluationTable.originalId,
        inputPrefix: track4EvaluationTable.inputPrefix,
        expectedSuggestionType: track4EvaluationTable.expectedSuggestionType,
        expectedTopSuggestions: track4EvaluationTable.expectedTopSuggestions,
        difficulty: track4EvaluationTable.difficulty,
        skillsTested: track4EvaluationTable.skillsTested,
        isGenerated: track4EvaluationTable.isGenerated,
      })
      .from(track4EvaluationTable)
      .where(eq(track4EvaluationTable.isGenerated, false));
  },

  // -------------------------------------------------------------------------
  // Embedding operations (pgvector)
  // -------------------------------------------------------------------------

  /** Delete all embedding rows (idempotent rebuild). */
  async clearAllEmbeddings() {
    await db.delete(track4EmbeddingTable);
  },

  /** Batch-insert embeddings using Drizzle multi-row insert. */
  async insertEmbeddingBatch(
    rows: { displayText: string; queryType: string; embedding: number[] }[],
  ) {
    if (rows.length === 0) return;
    // Use Drizzle's native batch insert — handled per-row for reliability
    // with the custom vector type.
    for (const row of rows) {
      await db.insert(track4EmbeddingTable).values({
        displayText: row.displayText,
        queryType: row.queryType,
        embedding: row.embedding,
      });
    }
  },

  /**
   * Cosine similarity search via pgvector <=> operator.
   * Returns results sorted by similarity descending (most similar first).
   * similarity = 1 - cosine_distance
   */
  async searchSimilar(queryVec: number[], limit: number) {
    const vecLiteral = JSON.stringify(queryVec);
    const rows = await db.execute(sql`
      SELECT
        display_text,
        query_type,
        1 - (embedding <=> ${vecLiteral}::vector) AS similarity
      FROM ${track4EmbeddingTable}
      ORDER BY embedding <=> ${vecLiteral}::vector
      LIMIT ${limit}
    `);
    return (rows as unknown as Array<{
      display_text: string;
      query_type: string;
      similarity: number;
    }>);
  },
};
