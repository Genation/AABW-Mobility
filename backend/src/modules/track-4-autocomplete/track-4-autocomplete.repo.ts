import { db } from "@/db/pool.ts";
import {
  track4AbbreviationTable,
  track4AutocompleteTable,
  track4PoiTable,
  track4PopularQueryTable,
} from "./track-4-autocomplete.schema.ts";
import { desc, eq, or } from "drizzle-orm";

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
};
