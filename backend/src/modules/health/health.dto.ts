import { z } from "zod/v4";
import { healthTable } from "./health.schema.ts";
import { createDto } from "@/shared/utils/dto-builder.ts";
import { QuerySchema } from "@/shared/utils/dto-builder.ts";

const Dto = createDto(healthTable);

// CRUD STANDARDS
export const HealthCreateSchema = Dto.insert.pick({ data: true });
export const HealthUpdateSchema = Dto.update.pick({ data: true }).partial();
export const HealthSelectSchema = Dto.select;
export const HealthQuerySchema = QuerySchema;
export const HealthParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// CUSTOM SCHEMAS
// Example select with optional logical field like dateGap (now - createdAt)
export const HealthSelectWithDateGapSchema = HealthSelectSchema.pick({
  id: true,
  createdAt: true,
}).extend({
  dateGap: z.number().int().positive(),
});
