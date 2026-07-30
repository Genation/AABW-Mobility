import { TripPlan, DrivoDestination } from "./types";

/** Effective start of a track: its own startLocation, else the previous track's real endLocation, else the plan's start (track 0 only). Never a stored copy. */
export function getEffectiveTrackStart(
  plan: TripPlan,
  trackIndex: number,
): DrivoDestination | null {
  const track = plan.tracks[trackIndex];
  if (!track) return null;
  return (
    track.startLocation ??
    plan.tracks[trackIndex - 1]?.endLocation ??
    (trackIndex === 0 ? plan.startLocation : null)
  );
}

/** Effective end of a track: its own endLocation, else the plan's end (last track only). */
export function getEffectiveTrackEnd(
  plan: TripPlan,
  trackIndex: number,
): DrivoDestination | null {
  const track = plan.tracks[trackIndex];
  if (!track) return null;
  return (
    track.endLocation ??
    (trackIndex === plan.tracks.length - 1 ? plan.endLocation : null)
  );
}

interface OwnedPoint {
  point: DrivoDestination;
  /** Index into plan.tracks that added this point, or null for plan.startLocation/endLocation. */
  trackIndex: number | null;
}

/**
 * The single ordered, deduped point list for the whole trip: plan.startLocation,
 * then each track's destinations + endLocation in order, then plan.endLocation.
 * A point is dropped if it exactly matches the immediately preceding one (same
 * lat/lng) — e.g. a zero-destination track whose endLocation coincides with its
 * start, or a duplicate destination added twice in a row. This is the ONLY place
 * this dedup logic lives — buildOrderedTripPoints, buildOrderedTripPointsKey, and
 * getTrackPointRanges all derive from it so they can never disagree on indices.
 */
function buildOwnedPoints(plan: TripPlan): OwnedPoint[] {
  const raw: OwnedPoint[] = [];
  if (plan.startLocation) raw.push({ point: plan.startLocation, trackIndex: null });
  plan.tracks.forEach((track, i) => {
    for (const dest of track.destinations) raw.push({ point: dest, trackIndex: i });
    if (track.endLocation) raw.push({ point: track.endLocation, trackIndex: i });
  });
  if (plan.endLocation) raw.push({ point: plan.endLocation, trackIndex: null });

  return raw.filter((o, i) => {
    if (i === 0) return true;
    const prev = raw[i - 1];
    return o.point.lat !== prev.point.lat || o.point.lng !== prev.point.lng;
  });
}

export function buildOrderedTripPoints(plan: TripPlan): DrivoDestination[] {
  return buildOwnedPoints(plan).map((o) => o.point);
}

/** Coordinate-value fingerprint of buildOrderedTripPoints(plan) — changes only when actual geometry changes, unlike a length/reference comparison. */
export function buildOrderedTripPointsKey(plan: TripPlan): string {
  return buildOwnedPoints(plan)
    .map((o) => `${o.point.lat},${o.point.lng}`)
    .join("|");
}

export interface TrackPointRange {
  trackId: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Each track's [startIndex, endIndex] range (inclusive point-list indices) into
 * buildOrderedTripPoints(plan)'s output, for use with sliceRouteRange. Computed
 * in a single forward pass so a degenerate track (zero new points after dedup)
 * gets range {N, N} at the shared boundary instead of shifting later tracks'
 * indices — points stay in track order after dedup (dedup only collapses
 * adjacent duplicates), so a single forward-only pointer is sufficient.
 */
export function getTrackPointRanges(plan: TripPlan): TrackPointRange[] {
  const owned = buildOwnedPoints(plan);

  const ranges: TrackPointRange[] = [];
  let boundaryIndex = 0;
  for (let i = 0; i < plan.tracks.length; i++) {
    const startIndex = boundaryIndex;
    let endIndex = boundaryIndex;
    while (endIndex + 1 < owned.length && owned[endIndex + 1].trackIndex === i) {
      endIndex++;
    }
    ranges.push({ trackId: plan.tracks[i].id, startIndex, endIndex });
    boundaryIndex = endIndex;
  }
  return ranges;
}
