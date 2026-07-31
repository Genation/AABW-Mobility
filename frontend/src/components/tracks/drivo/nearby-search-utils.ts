import { haversineMeters } from "@/lib/osrm";

export const NEARBY_RADIUS_M = 5000;

export interface NearbyCenter {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

/** Filters items to those within radiusM of center and sorts nearest-first. Items missing lat/lng are dropped. */
export function filterSortByNearby<T extends { lat?: number | null; lng?: number | null }>(
  items: T[],
  center: { lat: number; lng: number },
  radiusM: number = NEARBY_RADIUS_M,
): { item: T; distanceM: number }[] {
  return items
    .filter((item): item is T & { lat: number; lng: number } =>
      typeof item.lat === "number" && typeof item.lng === "number" &&
      Number.isFinite(item.lat) && Number.isFinite(item.lng),
    )
    .map((item) => ({ item, distanceM: haversineMeters(center.lat, center.lng, item.lat, item.lng) }))
    .filter((x) => x.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM);
}
