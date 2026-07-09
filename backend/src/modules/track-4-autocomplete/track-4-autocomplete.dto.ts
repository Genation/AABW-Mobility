import { z } from "zod/v4";
import { createDto } from "@/shared/utils/dto-builder.ts";
import {
  track4AbbreviationTable,
  track4AutocompleteTable,
  track4EvaluationTable,
  track4PoiTable,
  track4PopularQueryTable,
} from "./track-4-autocomplete.schema.ts";

// =============================================================================
// POI DTOs
// =============================================================================

const PoiDto = createDto(track4PoiTable);

export const PoiCreateSchema = PoiDto.insert;
export const PoiSelectSchema = PoiDto.select;
export type PoiCreate = z.infer<typeof PoiCreateSchema>;
export type PoiSelect = z.infer<typeof PoiSelectSchema>;

// =============================================================================
// Autocomplete Entry DTOs
// =============================================================================

const AcDto = createDto(track4AutocompleteTable);

export const AutocompleteEntryCreateSchema = AcDto.insert;
export const AutocompleteEntrySelectSchema = AcDto.select;
export type AutocompleteEntryCreate = z.infer<
  typeof AutocompleteEntryCreateSchema
>;
export type AutocompleteEntrySelect = z.infer<
  typeof AutocompleteEntrySelectSchema
>;

// =============================================================================
// Abbreviation DTOs
// =============================================================================

const AbbrDto = createDto(track4AbbreviationTable);

export const AbbreviationCreateSchema = AbbrDto.insert;
export const AbbreviationSelectSchema = AbbrDto.select;
export type AbbreviationCreate = z.infer<typeof AbbreviationCreateSchema>;
export type AbbreviationSelect = z.infer<typeof AbbreviationSelectSchema>;

// =============================================================================
// Popular Query DTOs
// =============================================================================

const PqDto = createDto(track4PopularQueryTable);

export const PopularQueryCreateSchema = PqDto.insert;
export const PopularQuerySelectSchema = PqDto.select;
export type PopularQueryCreate = z.infer<typeof PopularQueryCreateSchema>;
export type PopularQuerySelect = z.infer<typeof PopularQuerySelectSchema>;

// =============================================================================
// Evaluation DTOs
// =============================================================================

const EvalDto = createDto(track4EvaluationTable);

export const EvaluationCreateSchema = EvalDto.insert;
export const EvaluationSelectSchema = EvalDto.select;
export type EvaluationCreate = z.infer<typeof EvaluationCreateSchema>;
export type EvaluationSelect = z.infer<typeof EvaluationSelectSchema>;

// =============================================================================
// Suggest Request DTO
// =============================================================================

export const SuggestRequestSchema = z.object({
  q: z.string().min(1).max(200),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type SuggestRequest = z.infer<typeof SuggestRequestSchema>;
