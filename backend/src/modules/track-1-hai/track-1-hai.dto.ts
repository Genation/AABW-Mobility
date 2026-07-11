import { z } from "zod/v4";

export const IntentSearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(500),
  boost: z.boolean().default(false),
});

export type IntentSearchRequest = z.infer<typeof IntentSearchRequestSchema>;
