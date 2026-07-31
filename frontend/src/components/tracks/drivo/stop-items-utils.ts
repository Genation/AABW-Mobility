import { DrivoDestination, DrivoTrack } from "./types";
import { StopItem } from "./components/TrackStopsList";
import { TrackPointRange } from "./track-chain-utils";
import { haversineMeters, sliceRouteRange, RouteInfo } from "@/lib/osrm";

export function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(0)}km` : `${m.toFixed(0)}m`;
}

interface BuildStopItemsParams {
  track: DrivoTrack;
  effectiveStartLocation: DrivoDestination | null;
  trackPointRange: TrackPointRange | undefined;
  route: RouteInfo | null;
  routeDegraded: boolean;
  isRouteFresh: boolean;
}

/**
 * A point that exactly matches its predecessor is dropped by buildOrderedTripPoints'
 * dedup — mirror that rule here (same adjacency, since this track's own sequence is
 * a contiguous sub-range of the global deduped list) so pointIndex never drifts out
 * of sync with route.legs when a duplicate-coordinate stop exists.
 */
export function buildStopItems({
  track,
  effectiveStartLocation,
  trackPointRange,
  route,
  routeDegraded,
  isRouteFresh,
}: BuildStopItemsParams): StopItem[] {
  function distanceFrom(pointIndex: number, prev: DrivoDestination | undefined, curr: DrivoDestination): { text?: string; degraded: boolean } {
    if (prev && prev.lat === curr.lat && prev.lng === curr.lng) {
      return { text: formatDistance(0), degraded: false };
    }
    if (isRouteFresh && trackPointRange && route) {
      const { distanceMeters } = sliceRouteRange(route, pointIndex, pointIndex + 1);
      return { text: formatDistance(distanceMeters), degraded: false };
    }
    if (prev) {
      const m = haversineMeters(prev.lat, prev.lng, curr.lat, curr.lng);
      return { text: formatDistance(m), degraded: routeDegraded };
    }
    return { degraded: false };
  }

  const items: StopItem[] = [];
  let pointIndex = trackPointRange?.startIndex ?? 0;
  let prev: DrivoDestination | undefined = effectiveStartLocation ?? undefined;

  if (effectiveStartLocation) {
    items.push({ id: effectiveStartLocation.id, label: effectiveStartLocation.name, kind: "start", destination: effectiveStartLocation });
  }

  for (const d of track.destinations) {
    const isNewPoint = !prev || prev.lat !== d.lat || prev.lng !== d.lng;
    const { text, degraded } = distanceFrom(pointIndex, prev, d);
    items.push({ id: d.id, label: d.name, kind: "waypoint", destination: d, distanceFromPrev: text, degraded: !!text && degraded });
    if (isNewPoint) pointIndex += 1;
    prev = d;
  }

  if (track.endLocation) {
    const { text, degraded } = distanceFrom(pointIndex, prev, track.endLocation);
    items.push({ id: track.endLocation.id, label: track.endLocation.name, kind: "end", destination: track.endLocation, distanceFromPrev: text, degraded: !!text && degraded });
  }

  return items;
}
