/**
 * OSRM routing helper (shared by the Track-4 route panel and RouteMate).
 * Uses the free public OSRM server (no API key). Falls back to a straight
 * line through the given points if the request fails.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** Distance/duration/geometry for one consecutive pair of input points. */
export interface RouteLeg {
  distanceMeters: number;
  durationSeconds: number;
  /** GeoJSON coordinates [[lng, lat], ...] for just this leg. */
  coordinates: [number, number][];
}

export interface RouteInfo {
  /** GeoJSON coordinates [[lng, lat], ...] for the whole route. */
  coordinates: [number, number][];
  /** Distance in meters */
  distanceMeters: number;
  /** Duration in seconds */
  durationSeconds: number;
  /** One entry per consecutive pair in the requested points array. */
  legs: RouteLeg[];
}

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving/";

function isValidPoint(p: LatLng): boolean {
  return (
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}

/** Concatenate a leg's steps' geometries, dropping the shared join point. */
function stitchSteps(
  steps: { geometry: { coordinates: [number, number][] } }[],
): [number, number][] {
  return steps.flatMap((step, i) =>
    i === 0 ? step.geometry.coordinates : step.geometry.coordinates.slice(1),
  );
}

/**
 * Fetch a driving route through an ordered list of points (>= 2).
 * The first point is the origin, the last is the destination; any points in
 * between are waypoints (used by RouteMate to re-route via a chosen stop).
 */
export async function fetchOsrmRoute(
  points: LatLng[],
  signal?: AbortSignal,
): Promise<RouteInfo> {
  const validPoints = points.filter(isValidPoint);
  if (validPoints.length < 2) {
    throw new Error("fetchOsrmRoute needs at least an origin and destination");
  }

  const coordString = validPoints.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `${OSRM_BASE}${coordString}?overview=full&geometries=geojson&steps=true`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) {
      throw new Error("No route found");
    }
    const r = data.routes[0];
    const legs: RouteLeg[] = r.legs.map(
      (leg: { distance: number; duration: number; steps: { geometry: { coordinates: [number, number][] } }[] }) => ({
        distanceMeters: leg.distance,
        durationSeconds: leg.duration,
        coordinates: stitchSteps(leg.steps),
      }),
    );
    return {
      coordinates: r.geometry.coordinates,
      distanceMeters: r.distance,
      durationSeconds: r.duration,
      legs,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // Straight-line fallback through the requested points.
    const legs: RouteLeg[] = [];
    let distanceMeters = 0;
    for (let i = 0; i < validPoints.length - 1; i++) {
      const legDistance = haversineMeters(
        validPoints[i].lat,
        validPoints[i].lng,
        validPoints[i + 1].lat,
        validPoints[i + 1].lng,
      );
      distanceMeters += legDistance;
      legs.push({
        distanceMeters: legDistance,
        durationSeconds: (legDistance / 1000 / 40) * 3600,
        coordinates: [
          [validPoints[i].lng, validPoints[i].lat],
          [validPoints[i + 1].lng, validPoints[i + 1].lat],
        ],
      });
    }
    return {
      coordinates: validPoints.map((p) => [p.lng, p.lat] as [number, number]),
      distanceMeters,
      durationSeconds: (distanceMeters / 1000 / 40) * 3600, // ~40 km/h avg
      legs,
    };
  }
}

/**
 * Slice a sub-range of legs (indices into the ORIGINAL points array passed
 * to fetchOsrmRoute — range [2, 5] covers legs 2, 3, 4) into a single
 * coordinates/distance/duration bundle. Bounds-clamps and never throws;
 * returns a degenerate empty result if the range doesn't fit the route
 * (e.g. route was computed from a shorter/older point list).
 */
export function sliceRouteRange(
  route: RouteInfo,
  fromIndex: number,
  toIndex: number,
): { coordinates: [number, number][]; distanceMeters: number; durationSeconds: number } {
  const from = Math.max(0, Math.min(fromIndex, route.legs.length));
  const to = Math.max(0, Math.min(toIndex, route.legs.length));
  if (to <= from) {
    return { coordinates: [], distanceMeters: 0, durationSeconds: 0 };
  }

  const legs = route.legs.slice(from, to);
  const coordinates = legs.flatMap((leg, i) =>
    i === 0 ? leg.coordinates : leg.coordinates.slice(1),
  );
  const distanceMeters = legs.reduce((sum, leg) => sum + leg.distanceMeters, 0);
  const durationSeconds = legs.reduce((sum, leg) => sum + leg.durationSeconds, 0);

  return { coordinates, distanceMeters, durationSeconds };
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
