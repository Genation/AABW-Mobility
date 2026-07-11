/**
 * OSRM routing helper (shared by the Track-4 route panel and RouteMate).
 * Uses the free public OSRM server (no API key). Falls back to a straight
 * line through the given points if the request fails.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteInfo {
  /** GeoJSON coordinates [[lng, lat], ...] */
  coordinates: [number, number][];
  /** Distance in meters */
  distanceMeters: number;
  /** Duration in seconds */
  durationSeconds: number;
}

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving/";

/**
 * Fetch a driving route through an ordered list of points (>= 2).
 * The first point is the origin, the last is the destination; any points in
 * between are waypoints (used by RouteMate to re-route via a chosen stop).
 */
export async function fetchOsrmRoute(
  points: LatLng[],
  signal?: AbortSignal,
): Promise<RouteInfo> {
  if (points.length < 2) {
    throw new Error("fetchOsrmRoute needs at least an origin and destination");
  }

  const coordString = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `${OSRM_BASE}${coordString}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) {
      throw new Error("No route found");
    }
    const r = data.routes[0];
    return {
      coordinates: r.geometry.coordinates,
      distanceMeters: r.distance,
      durationSeconds: r.duration,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // Straight-line fallback through the requested points.
    let distanceMeters = 0;
    for (let i = 0; i < points.length - 1; i++) {
      distanceMeters += haversineMeters(
        points[i].lat,
        points[i].lng,
        points[i + 1].lat,
        points[i + 1].lng,
      );
    }
    return {
      coordinates: points.map((p) => [p.lng, p.lat] as [number, number]),
      distanceMeters,
      durationSeconds: (distanceMeters / 1000 / 40) * 3600, // ~40 km/h avg
    };
  }
}

/** Haversine distance in meters between two lat/lng points. */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
