import type { RouteMateRecommendation } from "@/lib/api";

/** A recommendation tagged with the need bucket it belongs to. */
export interface FlatRecommendation extends RouteMateRecommendation {
  need_key: string;
}
