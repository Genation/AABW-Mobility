import { z } from "zod/v4";

export const SemanticSearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(500),
  top_k: z.coerce.number().int().min(1).max(50).default(5),
});

export type SemanticSearchRequest = z.infer<
  typeof SemanticSearchRequestSchema
>;
