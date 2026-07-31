import { DrivoDestination, DrivoTrack } from "./types";
import { StopItem } from "./components/TrackStopsList";
import { TrackPointRange } from "./track-chain-utils";
import { haversineMeters, sliceRouteRange, RouteInfo } from "@/lib/osrm";

export function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(0)}km` : `${m.toFixed(0)}m`;
}

export function formatClockTime(d: Date): string {
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDurationShort(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes} phút`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h${m}p` : `${h}h`;
}

interface BuildStopItemsParams {
  track: DrivoTrack;
  effectiveStartLocation: DrivoDestination | null;
  trackPointRange: TrackPointRange | undefined;
  route: RouteInfo | null;
  routeDegraded: boolean;
  isRouteFresh: boolean;
  globalWaypointStartIndex?: number;
  /** Trip start time — absolute ETA is rendered when set, else a relative "+X from departure". */
  startTime?: Date | null;
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
  globalWaypointStartIndex = 1,
  startTime,
}: BuildStopItemsParams): StopItem[] {
  const validStartTime = startTime instanceof Date && !isNaN(startTime.getTime()) ? startTime : null;

  function etaFor(pointIndex: number): string | undefined {
    if (!route) return undefined;
    const secs = sliceRouteRange(route, 0, pointIndex).durationSeconds;
    const base = validStartTime
      ? `Dự kiến đến: ${formatClockTime(new Date(validStartTime.getTime() + secs * 1000))}`
      : `+${formatDurationShort(secs)} từ lúc khởi hành`;
    return isRouteFresh ? base : `${base} (ước tính)`;
  }

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

  let currentGlobalIndex = globalWaypointStartIndex;

  if (effectiveStartLocation) {
    items.push({
      id: effectiveStartLocation.id,
      label: effectiveStartLocation.name,
      kind: "start",
      destination: effectiveStartLocation,
      globalIndex: currentGlobalIndex,
      etaText: etaFor(pointIndex),
    });
    // We only increment if the track has destinations, but wait, the next point will check isNewPoint.
    // If the next point is a destination and differs from start, isNewPoint will be true, so it will increment before assigning?
    // Wait, in the existing code, it assigns currentGlobalIndex, THEN increments.
    // So for start, we assign currentGlobalIndex. Then for the loop, we should increment FIRST if isNewPoint?
  }

  for (const d of track.destinations) {
    const isNewPoint = !prev || prev.lat !== d.lat || prev.lng !== d.lng;
    if (isNewPoint) {
      pointIndex += 1;
      currentGlobalIndex += 1;
    }
    const { text, degraded } = distanceFrom(pointIndex, prev, d);
    items.push({
      id: d.id,
      label: d.name,
      kind: "waypoint",
      destination: d,
      distanceFromPrev: text,
      degraded: !!text && degraded,
      globalIndex: currentGlobalIndex,
      etaText: etaFor(pointIndex),
    });
    prev = d;
  }

  if (track.endLocation) {
    const isNewPoint = !prev || prev.lat !== track.endLocation.lat || prev.lng !== track.endLocation.lng;
    if (isNewPoint) {
      currentGlobalIndex += 1;
    }
    const endPointIndex = pointIndex + (isNewPoint ? 1 : 0);
    const { text, degraded } = distanceFrom(endPointIndex, prev, track.endLocation);
    items.push({
      id: track.endLocation.id,
      label: track.endLocation.name,
      kind: "end",
      destination: track.endLocation,
      distanceFromPrev: text,
      degraded: !!text && degraded,
      globalIndex: currentGlobalIndex,
      etaText: etaFor(endPointIndex),
    });
  }

  return items;
}
