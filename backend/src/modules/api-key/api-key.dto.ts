import { z } from "zod/v4";
import { apiKeyTable } from "./api-key.schema.ts";
import { createDto } from "@/shared/utils/dto-builder.ts";

const Dto = createDto(apiKeyTable);

export const ApiKeyCreateSchema = Dto.insert.pick({ name: true });
export const ApiKeySelectSchema = Dto.select;
export const ApiKeyParamSchema = z.object({
  id: z.string().uuid(),
});

// Response shape returned at creation (full key shown ONCE)
export const ApiKeyCreatedResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(), // the full API key, shown exactly once
  keyPrefix: z.string(),
  createdAt: z.string().datetime(),
});
