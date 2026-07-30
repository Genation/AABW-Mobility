# Drivo Track-Chaining Architecture: Point Deduplication & Index Alignment

## Overview

The Drivo trip planner chains multiple tracks together into a single ordered trip. Each track has:
- **startLocation**: origin point (nullable; derived from previous track's end if not set)
- **destinations**: intermediate stops (array)
- **endLocation**: final point of the track (nullable; used as next track's implicit start)

This document explains the non-obvious index alignment between the trip's flat point list and per-track ranges.

## The Problem

When combining all track points into one ordered list for OSRM routing:
- The same point can appear as two tracks' shared boundary (end of track N = start of track N+1)
- Duplicate points must be deduplicated before sending to OSRM (to avoid degenerate routes)
- After dedup, we need to **map back** from the OSRM response (which has fewer points) to **which points belong to which track**

Example:
```
Track 0: A → B → [end: C]
Track 1: [start: (null, derives to C)] → D → [end: E]
Track 2: [start: (null, derives to E)] → F → [end: G]

Ordered points before dedup: A, B, C, D, E, F, G (7 points, 6 legs)
If D == E (user creates a zero-stop track): A, B, C, D, F, G (6 points, 5 legs)
↑ Track 1 has range [2, 2] — a single point, not shifted for later tracks.
```

## The Solution: Single Source of Truth

All three functions derive from **`buildOwnedPoints(plan)`** — a **single forward pass** that:

1. **Assembles** all points in order: plan.startLocation, each track's destinations + endLocation, plan.endLocation
2. **Deduplicates** consecutive identical points (lines 54–59 in track-chain-utils.ts):
   ```typescript
   return raw.filter((o, i) => {
     if (i === 0) return true;
     const prev = raw[i - 1];
     return o.point.lat !== prev.point.lat || o.point.lng !== prev.point.lng;
   });
   ```
   - **Invariant**: Dedup only collapses adjacent duplicates, never reorders points
   - Preserves track ownership (`trackIndex: number | null` field)

3. **Exports** via three derived functions:
   - **`buildOrderedTripPoints(plan)`**: Returns the dedup'd point list for OSRM
   - **`buildOrderedTripPointsKey(plan)`**: Fingerprint (used to detect staleness in route cache)
   - **`getTrackPointRanges(plan)`**: Maps each track to [startIndex, endIndex] into the dedup'd list

## Index Mapping: How `getTrackPointRanges` Works

```typescript
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
```

**Key insight**: Single forward pointer (`boundaryIndex`) that moves monotonically. No re-scanning, no index-shifting logic.

For the example above (zero-length track case):
- Track 0 (index 0): startIndex=0, endIndex=2 (points A, B, C)
- Track 1 (index 1): startIndex=2, endIndex=2 (point D, same as endIndex because owned[3] has trackIndex=2)
- Track 2 (index 2): startIndex=2, endIndex=5 (points D, F, G — D inherited from T1's end)

**No index shifts, no special cases for zero-length tracks** — the boundary naturally stays at 2.

## Route Slicing: Using the Indices

When OSRM routes through these dedup'd points, it returns:
```typescript
RouteInfo {
  legs: RouteLeg[]  // one leg per consecutive pair in buildOrderedTripPoints
  // legs[0] = route from point 0 to 1 (A→B)
  // legs[1] = route from point 1 to 2 (B→C)
  // legs[2] = route from point 2 to 3 (C→D)
  // ... etc
}
```

To get track N's distance/polyline, use `sliceRouteRange()`:
```typescript
export function sliceRouteRange(
  route: RouteInfo,
  fromIndex: number,  // track's startIndex
  toIndex: number,    // track's endIndex
): { coordinates; distanceMeters; durationSeconds }
```

**Critical**: `fromIndex` and `toIndex` are **indices into the deduplicated point list**, and also **leg indices** in the OSRM response:
- `sliceRouteRange(route, 0, 2)` → sum of legs [0, 1] (A→B→C)
- `sliceRouteRange(route, 2, 2)` → degenerate result (zero distance, empty coords)

The function bounds-clamps to handle stale routes (lines 132–133):
```typescript
const from = Math.max(0, Math.min(fromIndex, route.legs.length));
const to = Math.max(0, Math.min(toIndex, route.legs.length));
if (to <= from) return { coordinates: [], distanceMeters: 0, durationSeconds: 0 };
```

## The Chaining Bug (Now Fixed)

**Old code** (Phase 2 fixed this):
```typescript
// Broken:
const newTrack = { startLocation: tracks[N-1].endLocation }  // ← copies the object reference
```

If the shared boundary point moved later, the two objects silently diverged:
- Track N-1's endLocation moved to new position X
- Track N's startLocation stayed at old position Y
- Route disconnected at the boundary

**New code**:
```typescript
// Correct:
function getEffectiveTrackStart(plan: TripPlan, trackIndex: number) {
  const track = plan.tracks[trackIndex];
  return (
    track.startLocation ??
    plan.tracks[trackIndex - 1]?.endLocation ??
    (trackIndex === 0 ? plan.startLocation : null)
  );
}
```

Always **derive** the start; don't **store** a copy. Checked every time we read it.

## Red Team Findings (Phase Review)

This architecture was flagged by the red team review for:
- **Finding 1 (Critical)**: `sliceRouteRange` bounds-check → Fixed via clamping (lines 132–133)
- **Finding 3 (High)**: Degenerate zero-length track index handling → Correct via forward-only pointer
- **Finding 8 (Medium)**: `getTrackPointRanges` called unmemoized in hot render path → Consumer's responsibility to memoize if needed

See `/plans/260730-2205-drivo-live-route-track-detail/plan.md` for full validation notes.

## Files to Reference

- **Index mapping logic**: `frontend/src/components/tracks/drivo/track-chain-utils.ts` (102 lines)
- **Route slicing**: `frontend/src/lib/osrm.ts::sliceRouteRange()` (lines 127–146)
- **Live-sync state mgmt**: `frontend/src/components/tracks/drivo/DrivoApp.tsx` (consumes the indices)
- **Implementation plan**: `/plans/260730-2205-drivo-live-route-track-detail/` (phase-02 through phase-05)

## Invariants (Don't Break These)

1. **`buildOwnedPoints` is the single source of truth** — all other functions derive from it
2. **Dedup is adjacent-only** — a→a→b becomes a→b, never reorders
3. **Indices are stable within a trip** — add/remove a point in track N, and track N+1's indices shift, but only after track N's boundary
4. **`getEffectiveTrackStart` always derives, never caches** — to avoid divergence at boundaries
5. **`sliceRouteRange` must bounds-clamp** — never throw on out-of-range indices; return degenerate result instead
