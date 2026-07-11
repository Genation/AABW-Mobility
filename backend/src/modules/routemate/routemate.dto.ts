import { z } from "zod/v4";

const LatLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const RouteMatePlanRequestSchema = z.object({
  origin: LatLngSchema,
  destination: z.object({
    name: z.string().trim().min(1).max(512),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }),
  vehicle_type: z.enum(["ev", "petrol"]).default("petrol"),
  distance_km: z.coerce.number().min(0).max(5000).optional(),
  duration_min: z.coerce.number().min(0).max(100000).optional(),
  free_text: z.string().trim().max(512).optional(),
  use_llm: z.boolean().default(false),
  corridor_km: z.coerce.number().min(0.2).max(25).default(5),
  limit_per_need: z.coerce.number().int().min(1).max(10).default(4),
  route_polyline: z.array(LatLngSchema).max(2000).default([]),
  attributes: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  attributes_by_need: z
    .record(z.string(), z.array(z.string().trim().min(1).max(40)).max(20))
    .default({}),
});

export type RouteMatePlanRequest = z.infer<typeof RouteMatePlanRequestSchema>;
