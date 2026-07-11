import { z } from "zod/v4";

export const HaiSuggestRequestSchema = z.object({
  q: z.string().trim().min(1).max(200),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  limit: z.coerce.number().int().min(1).max(12).default(10),
});

export type HaiSuggestRequest = z.infer<typeof HaiSuggestRequestSchema>;
