# Drivo Pre-Trip UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> sdlc:subagent-driven-development (recommended) or sdlc:executing-plans to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Goal:** Redesign Drivo's 3 pre-trip screens with map-first, mobile-first UX — making the map the primary interaction surface for creating trips, managing tracks, and adding waypoints with AI-powered POI suggestions.

**Architecture:** Keep the existing 3-screen state machine in `DrivoApp.tsx`. Extend `DrivoMapInner` with interactive features (draggable markers, map tap). Build 2 new shared components (HorizontalTimeline, AISuggestions). Rebuild `TrackDetailScreen` as map-first with overlay panel. Upgrade `TripItineraryScreen` with timeline + segment coloring. Add map preview to `CreateTripScreen`. CSS uses pitch-deck road-yellow `#FFC928` on asphalt `#11161C`.

**Tech Stack:** Next.js, React, TypeScript, Leaflet/react-leaflet, CSS Modules, existing `searchPlaces` API (P7), existing `fetchOsrmRoute`, existing `SmartLocationInput`.

---

### Task 1: Extend DrivoMapInner with interactive features

**Files:**
- Modify: `frontend/src/components/tracks/drivo/components/DrivoMapInner.tsx`
- Create: `frontend/src/components/tracks/drivo/components/MapTapHandler.tsx`

- [ ] **Step 1: Add interactive mode props to DrivoMapInner**

In `DrivoMapInner.tsx`, add new optional props to the `Props` interface:

```typescript
interface Props {
  origin: DrivoDestination | null;
  destination: DrivoDestination | null;
  waypoints: DrivoDestination[];
  route: RouteInfo | null;
  // New props
  interactive?: boolean;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  onMarkerDrag?: (id: string, lat: number, lng: number) => void;
  selectedMarkerId?: string | null;
  crosshairLatLng?: { lat: number; lng: number } | null;
}
```

Only apply new behavior when `interactive === true` to avoid breaking existing usage in TripItinerary/CreateTrip screens.

- [ ] **Step 2: Create MapTapHandler component**

Create `frontend/src/components/tracks/drivo/components/MapTapHandler.tsx`:

```typescript
"use client";

import { useMapEvents } from "react-leaflet";

interface Props {
  onTap: (latlng: { lat: number; lng: number }) => void;
  enabled: boolean;
}

export function MapTapHandler({ onTap, enabled }: Props) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onTap({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}
```

- [ ] **Step 3: Render MapTapHandler when interactive**

In `DrivoMapInner`, after `<MapAutoFit ... />`, add:

```tsx
{interactive && onMapClick && (
  <MapTapHandler onTap={onMapClick} enabled={interactive} />
)}
```

- [ ] **Step 4: Add crosshair marker**

After `<MapAutoFit ... />`, add:

```tsx
{crosshairLatLng && (
  <Marker
    position={[crosshairLatLng.lat, crosshairLatLng.lng]}
    icon={crosshairIcon}
  >
    <Popup>Thêm điểm dừng tại đây?</Popup>
  </Marker>
)}
```

Add a new icon factory before the component:

```typescript
function crosshairIconFactory() {
  return L.divIcon({
    className: "",
    html: `<div style="width:32px;height:32px;border:3px solid #FFC928;border-radius:50%;background:rgba(255,201,40,0.2);box-shadow:0 0 12px rgba(255,201,40,0.5);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;background:#FFC928;border-radius:50%;"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}
const crosshairIcon = crosshairIconFactory();
```

- [ ] **Step 5: Make waypoint markers draggable in interactive mode**

Replace the waypoint markers section. The existing loop renders `Marker` with `waypointIcon`. When `interactive` is true and `onMarkerDrag` is provided, make markers draggable:

```tsx
{waypoints.map((wp, index) => (
  <Marker
    key={wp.id}
    position={[wp.lat, wp.lng]}
    icon={selectedMarkerId === wp.id ? waypointIconSelected : waypointIcon}
    draggable={interactive && !!onMarkerDrag}
    eventHandlers={
      interactive && onMarkerDrag
        ? {
            dragend(e) {
              const marker = e.target;
              const pos = marker.getLatLng();
              onMarkerDrag(wp.id, pos.lat, pos.lng);
            },
          }
        : undefined
    }
  >
    <Popup>
      <div style={{ fontWeight: "bold" }}>{wp.name}</div>
      <div style={{ fontSize: 11, color: "#666" }}>Điểm dừng {index + 1}</div>
    </Popup>
    <Tooltip permanent direction="top" offset={[0, -14]}>
      {wp.name}
    </Tooltip>
  </Marker>
))}
```

Add `waypointIconSelected` variant (road-yellow instead of green):

```typescript
const waypointIconSelected = dotIcon("#FFC928");
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/tracks/drivo/components/DrivoMapInner.tsx frontend/src/components/tracks/drivo/components/MapTapHandler.tsx
git commit -m "feat(drivo): extend DrivoMapInner with interactive markers and map tap"
```

---

### Task 2: Build HorizontalTimeline component

**Files:**
- Create: `frontend/src/components/tracks/drivo/components/HorizontalTimeline.tsx`
- Modify: `frontend/src/components/tracks/drivo/drivo.module.css`

- [ ] **Step 1: Define types for the component**

The timeline displays waypoints as horizontal-scrollable cards with "+" buttons between them. Props:

```typescript
import { DrivoDestination } from "../types";

export interface TimelineWaypoint {
  id: string;
  label: string;       // "A", "B", or destination name
  kind: "start" | "end" | "waypoint";
  destination?: DrivoDestination;
  distanceFromPrev?: string;  // e.g. "45km"
  timeFromPrev?: string;      // e.g. "~1h"
}

interface Props {
  waypoints: TimelineWaypoint[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  onAddBetween: (afterId: string) => void;
  onRemove?: (id: string) => void;
}
```

- [ ] **Step 2: Write the component**

Create `frontend/src/components/tracks/drivo/components/HorizontalTimeline.tsx`:

```tsx
"use client";

import { useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { HorizontalTimeline as Props, TimelineWaypoint } from "../types";
import styles from "../drivo.module.css";

export function HorizontalTimeline({
  waypoints,
  activeId,
  onSelect,
  onAddBetween,
  onRemove,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-wp-id="${activeId}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <div className={styles.timelineStrip} ref={scrollRef}>
      {waypoints.map((wp, i) => (
        <div key={wp.id} className={styles.timelineGroup}>
          {i > 0 && (
            <button
              className={styles.timelineAddBtn}
              onClick={() => onAddBetween(waypoints[i - 1].id)}
              title="Thêm điểm dừng"
            >
              <Plus size={14} />
            </button>
          )}
          <button
            data-wp-id={wp.id}
            className={`${styles.timelineCard} ${activeId === wp.id ? styles.timelineCardActive : ""} ${wp.kind === "start" ? styles.timelineCardStart : ""} ${wp.kind === "end" ? styles.timelineCardEnd : ""}`}
            onClick={() => onSelect(wp.id)}
          >
            <div className={styles.timelineCardIcon}>
              {wp.kind === "start" ? "A" : wp.kind === "end" ? "B" : i}
            </div>
            <div className={styles.timelineCardContent}>
              <div className={styles.timelineCardName}>{wp.label}</div>
              {wp.distanceFromPrev && (
                <div className={styles.timelineCardDist}>{wp.distanceFromPrev}{wp.timeFromPrev ? ` · ${wp.timeFromPrev}` : ""}</div>
              )}
            </div>
            {onRemove && wp.kind === "waypoint" && (
              <button
                className={styles.timelineRemoveBtn}
                onClick={(e) => { e.stopPropagation(); onRemove(wp.id); }}
              >
                <X size={12} />
              </button>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Add CSS for HorizontalTimeline**

Add to `frontend/src/components/tracks/drivo/drivo.module.css`:

```css
.timelineStrip {
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
  padding: 8px 12px 12px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-snap-type: x mandatory;
}

.timelineStrip::-webkit-scrollbar {
  display: none;
}

.timelineGroup {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  scroll-snap-align: center;
}

.timelineAddBtn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px dashed var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  margin: 0 6px;
  transition: all var(--transition-fast);
}

.timelineAddBtn:hover {
  border-color: #FFC928;
  color: #FFC928;
  background: rgba(255, 201, 40, 0.08);
}

.timelineCard {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--color-surface);
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 100px;
  max-width: 160px;
  transition: all var(--transition-fast);
}

.timelineCardActive {
  border-color: #FFC928;
  background: rgba(255, 201, 40, 0.06);
}

.timelineCardStart {
  border-left: 3px solid #3B82F6;
}

.timelineCardEnd {
  border-left: 3px solid #EF4444;
}

.timelineCardIcon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #FFC928;
  color: #11161C;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.timelineCardStart .timelineCardIcon { background: #3B82F6; color: #fff; }
.timelineCardEnd .timelineCardIcon { background: #EF4444; color: #fff; }

.timelineCardContent {
  min-width: 0;
}

.timelineCardName {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timelineCardDist {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.timelineRemoveBtn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.timelineRemoveBtn:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #EF4444;
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/tracks/drivo/components/HorizontalTimeline.tsx frontend/src/components/tracks/drivo/drivo.module.css
git commit -m "feat(drivo): add HorizontalTimeline component with interactive cards"
```

---

### Task 3: Build AISuggestions component

**Files:**
- Create: `frontend/src/components/tracks/drivo/components/AISuggestions.tsx`
- Modify: `frontend/src/components/tracks/drivo/drivo.module.css`

- [ ] **Step 1: Define types and write the component**

Create `frontend/src/components/tracks/drivo/components/AISuggestions.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { searchPlaces, PlaceCandidate } from "@/lib/api";
import { Plus, Loader2, MapPin } from "lucide-react";
import styles from "../drivo.module.css";

const CATEGORIES = [
  { key: "an_uong", label: "🍜 Ăn uống", query: "quán ăn ngon" },
  { key: "cafe", label: "☕ Cafe", query: "quán cafe đẹp" },
  { key: "tram_xang", label: "⛽ Trạm xăng", query: "trạm xăng" },
  { key: "checkin", label: "📸 Check-in", query: "điểm check-in đẹp" },
  { key: "nghi_duong", label: "🏨 Nghỉ dưỡng", query: "resort nghỉ dưỡng" },
];

interface Props {
  routeLatLngs: { lat: number; lng: number }[];
  activeCategory: string;
  onCategoryChange: (key: string) => void;
  onAddPOI: (poi: PlaceCandidate) => void;
}

export function AISuggestions({
  routeLatLngs,
  activeCategory,
  onCategoryChange,
  onAddPOI,
}: Props) {
  const [results, setResults] = useState<PlaceCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!activeCategory || routeLatLngs.length < 2) {
      setResults([]);
      return;
    }

    const cat = CATEGORIES.find((c) => c.key === activeCategory);
    if (!cat) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    // Sample midpoints along the route for searching
    const mid = routeLatLngs[Math.floor(routeLatLngs.length / 2)];

    searchPlaces(cat.query, 8, ac.signal)
      .then((res) => {
        if (ac.signal.aborted) return;
        // Filter to results that have lat/lng
        const withCoords = res.results.filter(
          (r) => r.lat != null && r.lng != null
        );
        // Sort by approximate distance from route midpoint
        withCoords.sort((a, b) => {
          const dA = Math.hypot((a.lat! - mid.lat), (a.lng! - mid.lng));
          const dB = Math.hypot((b.lat! - mid.lat), (b.lng! - mid.lng));
          return dA - dB;
        });
        setResults(withCoords);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("Không tải được gợi ý");
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [activeCategory, routeLatLngs]);

  return (
    <div className={styles.aiSuggestions}>
      <div className={styles.aiSuggestionsHeader}>Gợi ý dọc đường</div>

      <div className={styles.categoryChips}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`${styles.categoryChip} ${activeCategory === cat.key ? styles.categoryChipActive : ""}`}
            onClick={() => onCategoryChange(activeCategory === cat.key ? "" : cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.aiSuggestionsLoading}>
          <Loader2 size={18} className={styles.spin} /> Đang tìm...
        </div>
      )}

      {error && <div className={styles.aiSuggestionsError}>{error}</div>}

      {!loading && !error && results.length > 0 && (
        <div className={styles.poiList}>
          {results.map((poi) => (
            <div key={poi.poi_id} className={styles.poiCard}>
              <div className={styles.poiCardInfo}>
                <div className={styles.poiCardName}>{poi.name}</div>
                <div className={styles.poiCardMeta}>
                  <MapPin size={12} />
                  {poi.category}
                  {poi.rating != null && ` · ⭐ ${poi.rating}`}
                </div>
              </div>
              <button
                className={styles.poiAddBtn}
                onClick={() => onAddPOI(poi)}
                title="Thêm vào chặng"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && activeCategory && (
        <div className={styles.aiSuggestionsEmpty}>
          Không tìm thấy gợi ý phù hợp dọc tuyến
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add CSS for AISuggestions**

Add to `frontend/src/components/tracks/drivo/drivo.module.css`:

```css
.aiSuggestions {
  padding: 0 16px 16px;
}

.aiSuggestionsHeader {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 10px;
}

.categoryChips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  scrollbar-width: none;
}

.categoryChips::-webkit-scrollbar {
  display: none;
}

.categoryChip {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.categoryChipActive {
  border-color: #FFC928;
  background: rgba(255, 201, 40, 0.12);
  color: #FFC928;
  font-weight: 600;
}

.aiSuggestionsLoading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 13px;
  padding: 16px 0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.aiSuggestionsError {
  color: var(--color-error);
  font-size: 13px;
  padding: 16px 0;
}

.aiSuggestionsEmpty {
  color: var(--color-text-secondary);
  font-size: 13px;
  padding: 16px 0;
}

.poiList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.poiCard {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

.poiCardInfo {
  flex: 1;
  min-width: 0;
}

.poiCardName {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poiCardMeta {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.poiAddBtn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 201, 40, 0.12);
  color: #FFC928;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.poiAddBtn:hover {
  background: #FFC928;
  color: #11161C;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/tracks/drivo/components/AISuggestions.tsx frontend/src/components/tracks/drivo/drivo.module.css
git commit -m "feat(drivo): add AISuggestions component with category filters and POI cards"
```

---

### Task 4: Rebuild TrackDetailScreen (map-first)

**Files:**
- Modify: `frontend/src/components/tracks/drivo/screens/TrackDetailScreen.tsx`
- Modify: `frontend/src/components/tracks/drivo/DrivoApp.tsx`
- Modify: `frontend/src/components/tracks/drivo/drivo.module.css`

- [ ] **Step 1: Rewrite TrackDetailScreen**

Replace the entire `TrackDetailScreen.tsx` with a map-first layout:

```tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { DrivoTrack, DrivoDestination } from "../types";
import { DrivoMap } from "../components/DrivoMap";
import { HorizontalTimeline, TimelineWaypoint } from "../components/HorizontalTimeline";
import { AISuggestions } from "../components/AISuggestions";
import { PlaceCandidate } from "@/lib/api";
import { haversineMeters } from "@/lib/osrm";
import { ArrowLeft, Check } from "lucide-react";
import styles from "../drivo.module.css";

interface Props {
  track: DrivoTrack;
  onSave: (track: DrivoTrack) => void;
  onCancel: () => void;
  routeCoordinates?: [number, number][];
}

export function TrackDetailScreen({ track: initialTrack, onSave, onCancel, routeCoordinates }: Props) {
  const [track, setTrack] = useState<DrivoTrack>({ ...initialTrack });
  const [crosshair, setCrosshair] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [addMode, setAddMode] = useState<"mapTap" | "between" | null>(null);
  const [addAfterId, setAddAfterId] = useState<string | null>(null);

  const addDestination = useCallback((dest: DrivoDestination) => {
    setTrack((prev) => {
      const newDests = [...prev.destinations];
      if (addAfterId) {
        const idx = newDests.findIndex((d) => d.id === addAfterId);
        newDests.splice(idx + 1, 0, dest);
      } else {
        newDests.push(dest);
      }
      return { ...prev, destinations: newDests };
    });
    setCrosshair(null);
    setAddMode(null);
    setAddAfterId(null);
  }, [addAfterId]);

  const removeDestination = useCallback((id: string) => {
    setTrack((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((d) => d.id !== id),
    }));
    if (selectedMarkerId === id) setSelectedMarkerId(null);
  }, [selectedMarkerId]);

  const handleMarkerDrag = useCallback((id: string, lat: number, lng: number) => {
    setTrack((prev) => {
      if (prev.startLocation?.id === id) {
        return { ...prev, startLocation: { ...prev.startLocation!, lat, lng } };
      }
      if (prev.endLocation?.id === id) {
        return { ...prev, endLocation: { ...prev.endLocation!, lat, lng } };
      }
      return {
        ...prev,
        destinations: prev.destinations.map((d) =>
          d.id === id ? { ...d, lat, lng } : d
        ),
      };
    });
  }, []);

  const handleMapClick = useCallback((latlng: { lat: number; lng: number }) => {
    setCrosshair(latlng);
    setAddMode("mapTap");
    setAddAfterId(null);
    setPanelExpanded(true);
  }, []);

  const handleAddBetween = useCallback((afterId: string) => {
    setAddMode("between");
    setAddAfterId(afterId);
    setCrosshair(null);
    setPanelExpanded(true);
  }, []);

  const handleAddPOI = useCallback((poi: PlaceCandidate) => {
    if (poi.lat == null || poi.lng == null) return;
    const dest: DrivoDestination = {
      id: `dest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: poi.name,
      lat: poi.lat,
      lng: poi.lng,
      poi_id: poi.poi_id,
      category: poi.category,
      score: poi.score,
      reasons: poi.reasons,
    };
    addDestination(dest);
  }, [addDestination]);

  const timelineWaypoints: TimelineWaypoint[] = useMemo(() => {
    const items: TimelineWaypoint[] = [];
    if (track.startLocation) {
      items.push({
        id: track.startLocation.id,
        label: track.startLocation.name,
        kind: "start",
        destination: track.startLocation,
      });
    }
    track.destinations.forEach((d, i) => {
      const prev = i === 0 ? track.startLocation : track.destinations[i - 1];
      let dist = "";
      if (prev && prev.lat && prev.lng && d.lat && d.lng) {
        const m = haversineMeters(prev.lat, prev.lng, d.lat, d.lng);
        if (m >= 1000) dist = `${(m / 1000).toFixed(0)}km`;
        else dist = `${m.toFixed(0)}m`;
      }
      items.push({
        id: d.id,
        label: d.name,
        kind: "waypoint",
        destination: d,
        distanceFromPrev: dist || undefined,
      });
    });
    if (track.endLocation) {
      const prev = track.destinations.length > 0
        ? track.destinations[track.destinations.length - 1]
        : track.startLocation;
      let dist = "";
      if (prev && prev.lat && prev.lng && track.endLocation.lat && track.endLocation.lng) {
        const m = haversineMeters(prev.lat, prev.lng, track.endLocation.lat, track.endLocation.lng);
        if (m >= 1000) dist = `${(m / 1000).toFixed(0)}km`;
        else dist = `${m.toFixed(0)}m`;
      }
      items.push({
        id: track.endLocation.id,
        label: track.endLocation.name,
        kind: "end",
        destination: track.endLocation,
        distanceFromPrev: dist || undefined,
      });
    }
    return items;
  }, [track]);

  return (
    <div className={styles.trackDetailContainer}>
      <div className={styles.trackDetailMap}>
        <DrivoMap
          origin={track.startLocation}
          destination={track.endLocation}
          waypoints={track.destinations}
          route={null}
          interactive
          onMapClick={handleMapClick}
          onMarkerDrag={handleMarkerDrag}
          selectedMarkerId={selectedMarkerId}
          crosshairLatLng={crosshair}
        />
      </div>

      <div className={styles.trackDetailHeader}>
        <button onClick={onCancel} className={styles.trackDetailBackBtn}>
          <ArrowLeft size={22} />
        </button>
        <div className={styles.trackDetailHeaderInfo}>
          <input
            value={track.name}
            onChange={(e) => setTrack((prev) => ({ ...prev, name: e.target.value }))}
            className={styles.trackDetailNameInput}
            placeholder="Tên chặng"
          />
        </div>
        <button onClick={() => onSave(track)} className={styles.trackDetailSaveBtn}>
          <Check size={22} />
        </button>
      </div>

      <div className={`${styles.trackDetailPanel} ${panelExpanded ? styles.trackDetailPanelExpanded : ""}`}>
        <div
          className={styles.panelDragHandle}
          onClick={() => setPanelExpanded((p) => !p)}
        >
          <div className={styles.panelDragBar} />
        </div>

        <HorizontalTimeline
          waypoints={timelineWaypoints}
          activeId={selectedMarkerId}
          onSelect={setSelectedMarkerId}
          onAddBetween={handleAddBetween}
          onRemove={removeDestination}
        />

        {panelExpanded && (
          <AISuggestions
            routeLatLngs={routeCoordinates?.map(([lng, lat]) => ({ lat, lng })) ?? []}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onAddPOI={handleAddPOI}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TrackDetailScreen CSS**

Add to `drivo.module.css`:

```css
.trackDetailContainer {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.trackDetailMap {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.trackDetailHeader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  padding-top: max(12px, env(safe-area-inset-top));
  background: linear-gradient(to bottom, rgba(17, 22, 28, 0.95), rgba(17, 22, 28, 0.7) 80%, transparent);
}

.trackDetailBackBtn,
.trackDetailSaveBtn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.trackDetailSaveBtn {
  background: #FFC928;
  color: #11161C;
}

.trackDetailHeaderInfo {
  flex: 1;
  text-align: center;
}

.trackDetailNameInput {
  background: transparent;
  border: none;
  border-bottom: 1px dashed rgba(255, 201, 40, 0.3);
  color: var(--color-text);
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  padding: 4px 8px;
  width: 100%;
  max-width: 200px;
  outline: none;
}

.trackDetailNameInput:focus {
  border-bottom-color: #FFC928;
}

.trackDetailPanel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: rgba(17, 22, 28, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px 20px 0 0;
  max-height: 35%;
  overflow-y: auto;
  transition: max-height 0.3s ease;
}

.trackDetailPanelExpanded {
  max-height: 70%;
}

.panelDragHandle {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  cursor: pointer;
}

.panelDragBar {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
}
```

- [ ] **Step 3: Update DrivoApp to pass routeCoordinates**

In `DrivoApp.tsx`, find the `<TrackDetailScreen` rendering section and add the `routeCoordinates` prop. Get it from the existing `route` state:

```tsx
<TrackDetailScreen
  track={activeTrack}
  onSave={handleSaveTrack}
  onCancel={handleCancelTrack}
  routeCoordinates={route?.coordinates}
/>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/tracks/drivo/screens/TrackDetailScreen.tsx frontend/src/components/tracks/drivo/DrivoApp.tsx frontend/src/components/tracks/drivo/drivo.module.css
git commit -m "feat(drivo): rebuild TrackDetailScreen with map-first UX, timeline, AI suggestions"
```

---

### Task 5: Upgrade TripItineraryScreen with timeline and segment coloring

**Files:**
- Modify: `frontend/src/components/tracks/drivo/screens/TripItineraryScreen.tsx`
- Modify: `frontend/src/components/tracks/drivo/components/DrivoMapInner.tsx`
- Modify: `frontend/src/components/tracks/drivo/drivo.module.css`

- [ ] **Step 1: Add per-track segment coloring to DrivoMapInner**

Add a new optional prop for track segment colors:

```typescript
interface Props {
  // ... existing props
  trackSegments?: Array<{
    trackId: string;
    coordinates: [number, number][];
    color: string;
    isActive: boolean;
  }>;
}
```

Render additional polylines in the map:

```tsx
{trackSegments?.map((seg, i) => (
  <Polyline
    key={seg.trackId}
    positions={seg.coordinates.map(([lng, lat]) => [lat, lng])}
    pathOptions={{
      color: seg.color,
      weight: seg.isActive ? 6 : 4,
      opacity: seg.isActive ? 0.9 : 0.4,
    }}
  />
))}
```

Define a palette of track colors:

```typescript
const TRACK_COLORS = [
  "#FFC928", "#F97316", "#10B981", "#3B82F6", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F59E0B", "#6366F1",
];
```

- [ ] **Step 2: Rewrite TripItineraryScreen with timeline cards**

Replace the existing `TripItineraryScreen.tsx` content:

```tsx
"use client";

import { useMemo } from "react";
import { TripPlan, DrivoTrack } from "../types";
import { haversineMeters } from "@/lib/osrm";
import { Plus, Navigation, Clock, ArrowLeft, GripVertical, Trash2 } from "lucide-react";
import styles from "../drivo.module.css";

interface Props {
  plan: TripPlan;
  onAddTrack: () => void;
  onEditTrack: (track: DrivoTrack) => void;
  onCancelTrip: () => void;
  activeTrackId?: string | null;
  onSelectTrack?: (id: string) => void;
  onDeleteTrack?: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

const TRACK_COLORS = [
  "#FFC928", "#F97316", "#10B981", "#3B82F6", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F59E0B", "#6366F1",
];

export function TripItineraryScreen({
  plan,
  onAddTrack,
  onEditTrack,
  onCancelTrip,
  activeTrackId,
  onSelectTrack,
  onDeleteTrack,
}: Props) {
  const totalDistance = useMemo(() => {
    // Sum distances between consecutive track endpoints
    let total = 0;
    for (let i = 0; i < plan.tracks.length; i++) {
      const t = plan.tracks[i];
      const start = t.startLocation ?? (i > 0 ? plan.tracks[i - 1].endLocation : plan.startLocation);
      const end = t.endLocation ?? (i < plan.tracks.length - 1 ? plan.tracks[i + 1].startLocation : plan.endLocation);
      if (start?.lat != null && start?.lng != null && end?.lat != null && end?.lng != null) {
        total += haversineMeters(start.lat, start.lng, end.lat, end.lng);
      }
    }
    return total;
  }, [plan.tracks, plan.startLocation, plan.endLocation]);

  return (
    <div className={styles.itinerarySheet}>
      <div className={styles.itineraryHeader}>
        <button onClick={onCancelTrip} className={styles.itineraryBackBtn}>
          <ArrowLeft size={18} />
        </button>
        <div className={styles.itineraryHeaderInfo}>
          <h2 className={styles.itineraryTitle}>
            {plan.startLocation?.name ?? "?"} → {plan.endLocation?.name ?? "?"}
          </h2>
          <div className={styles.itineraryMeta}>
            <span><Navigation size={12} /> {plan.tracks.length} chặng</span>
            <span><Clock size={12} /> {plan.startTime?.toLocaleDateString("vi-VN") ?? "Chưa định"}</span>
            {totalDistance > 0 && (
              <span>{totalDistance >= 1000 ? `${(totalDistance / 1000).toFixed(0)}km` : `${totalDistance.toFixed(0)}m`}</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.itineraryTrackList}>
        {plan.tracks.length === 0 ? (
          <div className={styles.itineraryEmpty}>
            <p>Chưa có chặng nào</p>
            <p className={styles.itineraryEmptyHint}>Chia nhỏ hành trình thành các chặng để dễ quản lý</p>
          </div>
        ) : (
          plan.tracks.map((track, i) => {
            const start = track.startLocation ?? (i > 0 ? plan.tracks[i - 1].endLocation : plan.startLocation);
            const end = track.endLocation ?? (i < plan.tracks.length - 1 ? plan.tracks[i + 1].startLocation : plan.endLocation);
            let distStr = "";
            if (start?.lat && start?.lng && end?.lat && end?.lng) {
              const m = haversineMeters(start.lat, start.lng, end.lat, end.lng);
              distStr = m >= 1000 ? `${(m / 1000).toFixed(0)}km` : `${m.toFixed(0)}m`;
            }

            const color = TRACK_COLORS[i % TRACK_COLORS.length];

            return (
              <div
                key={track.id}
                className={`${styles.itineraryTrackCard} ${activeTrackId === track.id ? styles.itineraryTrackCardActive : ""}`}
                onClick={() => onEditTrack(track)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(i));
                  e.currentTarget.classList.add(styles.itineraryTrackDragging);
                }}
                onDragEnd={(e) => {
                  e.currentTarget.classList.remove(styles.itineraryTrackDragging);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add(styles.itineraryTrackDragOver);
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove(styles.itineraryTrackDragOver);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(styles.itineraryTrackDragOver);
                  const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                  if (!isNaN(fromIdx) && fromIdx !== i) {
                    onReorder?.(fromIdx, i);
                  }
                }}
              >
                <div className={styles.itineraryTrackLeft}>
                  <div className={styles.itineraryTrackColor} style={{ background: color }} />
                  <GripVertical size={16} className={styles.itineraryTrackGrip} />
                </div>
                <div className={styles.itineraryTrackBody}>
                  <div className={styles.itineraryTrackName}>{track.name}</div>
                  <div className={styles.itineraryTrackRoute}>
                    {start?.name ?? "?"} → {end?.name ?? "?"}
                  </div>
                  <div className={styles.itineraryTrackMeta}>
                    {distStr && <span>{distStr}</span>}
                    <span>{track.destinations.length} điểm dừng</span>
                  </div>
                </div>
                <button
                  className={styles.itineraryTrackDelete}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTrack?.(track.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.itineraryActions}>
        <button onClick={onAddTrack} className={styles.itineraryAddBtn}>
          <Plus size={16} /> Thêm chặng
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add itinerary card CSS**

Add to `drivo.module.css`:

```css
.itinerarySheet {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.itineraryHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.itineraryBackBtn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
}

.itineraryHeaderInfo {
  flex: 1;
  min-width: 0;
}

.itineraryTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.itineraryMeta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.itineraryMeta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.itineraryTrackList {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.itineraryEmpty {
  text-align: center;
  padding: 32px 16px;
  color: var(--color-text-secondary);
}

.itineraryEmptyHint {
  font-size: 13px;
  margin-top: 4px;
  opacity: 0.7;
}

.itineraryTrackCard {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.itineraryTrackCardActive {
  border-color: #FFC928;
  background: rgba(255, 201, 40, 0.04);
}

.itineraryTrackLeft {
  display: flex;
  align-items: center;
  gap: 6px;
}

.itineraryTrackColor {
  width: 10px;
  height: 40px;
  border-radius: 5px;
  flex-shrink: 0;
}

.itineraryTrackGrip {
  color: var(--color-text-secondary);
  opacity: 0.4;
  cursor: grab;
}

.itineraryTrackBody {
  flex: 1;
  min-width: 0;
}

.itineraryTrackName {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.itineraryTrackRoute {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.itineraryTrackMeta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.itineraryTrackDelete {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  opacity: 0;
  cursor: pointer;
  padding: 4px;
  transition: all var(--transition-fast);
}

.itineraryTrackCard:hover .itineraryTrackDelete {
  opacity: 0.6;
}

.itineraryTrackDelete:hover {
  opacity: 1 !important;
  color: #EF4444;
}

.itineraryActions {
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-border);
}

.itineraryAddBtn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 2px dashed var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.itineraryAddBtn:hover {
  border-color: #FFC928;
  color: #FFC928;
  background: rgba(255, 201, 40, 0.04);
}

.itineraryTrackDragging {
  opacity: 0.4;
}

.itineraryTrackDragOver {
  border-color: #FFC928;
  background: rgba(255, 201, 40, 0.06);
  transform: scale(1.02);
}
```

- [ ] **Step 4: Wire new props in DrivoApp**

Update the `<TripItineraryScreen` call in `DrivoApp.tsx`:

```tsx
<TripItineraryScreen
  plan={plan}
  onAddTrack={handleAddTrack}
  onEditTrack={handleEditTrack}
  onCancelTrip={handleCancelTrip}
  activeTrackId={activeTrackId}
  onDeleteTrack={(id) => {
    setPlan((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== id),
    }));
  }}
  onReorder={(fromIdx, toIdx) => {
    setPlan((prev) => {
      const tracks = [...prev.tracks];
      const [moved] = tracks.splice(fromIdx, 1);
      tracks.splice(toIdx, 0, moved);
      return { ...prev, tracks };
    });
  }}
/>
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/tracks/drivo/screens/TripItineraryScreen.tsx frontend/src/components/tracks/drivo/components/DrivoMapInner.tsx frontend/src/components/tracks/drivo/DrivoApp.tsx frontend/src/components/tracks/drivo/drivo.module.css
git commit -m "feat(drivo): upgrade TripItineraryScreen with timeline cards and track segment coloring"
```

---

### Task 6: Add map preview to CreateTripScreen

**Files:**
- Modify: `frontend/src/components/tracks/drivo/screens/CreateTripScreen.tsx`
- Modify: `frontend/src/components/tracks/drivo/drivo.module.css`

- [ ] **Step 1: Insert map preview above form in CreateTripScreen**

Replace the content of `CreateTripScreen.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { SmartLocationInput } from "../components/SmartLocationInput";
import { DrivoMap } from "../components/DrivoMap";
import { DrivoDestination } from "../types";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import styles from "../drivo.module.css";

interface Props {
  onPlanTrip: (start: DrivoDestination, end: DrivoDestination, time: Date) => void;
  initialStart?: DrivoDestination | null;
  initialEnd?: DrivoDestination | null;
}

export function CreateTripScreen({ onPlanTrip, initialStart = null, initialEnd = null }: Props) {
  const [start, setStart] = useState<DrivoDestination | null>(initialStart);
  const [end, setEnd] = useState<DrivoDestination | null>(initialEnd);
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return now;
  });

  return (
    <div className={styles.createScreen}>
      <div className={styles.createMapPreview}>
        <DrivoMap
          origin={start}
          destination={end}
          waypoints={[]}
          route={null}
        />
        {start && end && (
          <div className={styles.createMapOverlay}>
            <div className={styles.createRoutePreview}>
              <MapPin size={14} color="#3B82F6" /> {start.name}
              <ArrowRight size={14} />
              <MapPin size={14} color="#EF4444" /> {end.name}
            </div>
          </div>
        )}
      </div>

      <div className={styles.createForm}>
        <div className={styles.createHeader}>
          <Image
            src="/DrivoLogo.png"
            alt="Drivo"
            width={120}
            height={40}
            priority
          />
          <p className={styles.createTagline}>Plan the drive. Live the story.</p>
        </div>

        <div className={styles.formFields}>
          <div>
            <label className={styles.fieldLabel}>
              <MapPin size={14} color="#3B82F6" /> Điểm xuất phát
            </label>
            {start ? (
              <div className={styles.selectedLocation}>
                <span className={styles.selectedLocationName}>{start.name}</span>
                <button onClick={() => setStart(null)} className={styles.changeBtn}>Đổi</button>
              </div>
            ) : (
              <SmartLocationInput placeholder="Nhập điểm bắt đầu..." onSelect={setStart} />
            )}
          </div>

          <div>
            <label className={styles.fieldLabel}>
              <MapPin size={14} color="#EF4444" /> Điểm đến
            </label>
            {end ? (
              <div className={styles.selectedLocation}>
                <span className={styles.selectedLocationName}>{end.name}</span>
                <button onClick={() => setEnd(null)} className={styles.changeBtn}>Đổi</button>
              </div>
            ) : (
              <SmartLocationInput placeholder="Nhập điểm kết thúc..." onSelect={setEnd} />
            )}
          </div>

          <div>
            <label className={styles.fieldLabel}>
              <Calendar size={14} color="var(--color-success)" /> Thời gian bắt đầu
            </label>
            <input
              type="datetime-local"
              value={startTime.toISOString().slice(0, 16)}
              onChange={(e) => setStartTime(new Date(e.target.value))}
              className={styles.dateInput}
            />
          </div>
        </div>

        <button
          disabled={!start || !end}
          onClick={() => {
            if (start && end) onPlanTrip(start, end, startTime);
          }}
          className={`${styles.submitBtn} ${start && end ? styles.submitBtnActive : styles.submitBtnDisabled}`}
        >
          Lên kế hoạch
          <ArrowRight size={18} />
        </button>

        <div className={styles.footerMeta}>
          MVP Concept • Drivo Team
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add CreateTrip map preview CSS**

Replace the existing `.createScreen` and related styles in `drivo.module.css`:

```css
.createScreen {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg);
  overflow: hidden;
}

.createMapPreview {
  position: relative;
  flex: 0 0 40%;
  min-height: 0;
  overflow: hidden;
}

.createMapOverlay {
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  z-index: 5;
}

.createRoutePreview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 20px;
  background: rgba(17, 22, 28, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 201, 40, 0.2);
  font-size: 13px;
  color: var(--color-text);
}

.createForm {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px 24px;
  display: flex;
  flex-direction: column;
}

.createHeader {
  text-align: center;
  margin-bottom: 24px;
}

.createHeader img {
  display: block;
  margin: 0 auto 8px;
}

.createTagline {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-style: italic;
  margin: 0;
}
```

Remove the old `.createHeader`, `.createTitle` styles that conflict (the ones with large margins/padding — the ones at lines 91-100). The new compact header is sufficient.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/tracks/drivo/screens/CreateTripScreen.tsx frontend/src/components/tracks/drivo/drivo.module.css
git commit -m "feat(drivo): add map preview to CreateTripScreen with route overlay"
```

---

### Task 7: Final integration and polish

**Files:**
- Modify: `frontend/src/components/tracks/drivo/DrivoApp.tsx`
- Modify: `frontend/src/components/tracks/drivo/types.ts`
- Modify: `frontend/src/components/tracks/drivo/drivo.module.css`

- [ ] **Step 1: Remove old CSS rules that are no longer used**

Search `drivo.module.css` for `.bottomSheet`, `.bottomSheetTall`, `.detailHeader`, `.detailHeaderBtn`, `.detailHeaderTitle`, `.detailHeaderSave`, `.detailBody`, `.destItem`, `.destIndex`, `.destInfo`, `.destName`, `.destCategory`, `.destRemoveBtn`, `.addDestSearchBox`, `.addDestHeader`, `.addDestTitle`, `.addDestCancel`, `.addDestBtn`, `.trackNameInput`, `.trackList`, `.trackItem`, `.trackItemGrip`, `.trackItemBody`, `.trackItemName`, `.trackItemSub`, `.addTrackBtn`, `.emptyState`.

Remove all these (they belong to old TrackDetail/TripItinerary implementations). Keep only what's used by the new components.

- [ ] **Step 2: Export new types if needed**

In `types.ts`, ensure `TimelineWaypoint` type is not needed from `types.ts` (it's defined in the component file). No changes needed if imported locally.

- [ ] **Step 3: Verify localStorage persistence still works**

Test flow: create a trip → add tracks → refresh page → verify state restored. The existing `saveState`/`loadState` in `DrivoApp.tsx` handles this — no changes needed.

- [ ] **Step 4: Type-check and lint**

Run:
```bash
cd frontend && npx tsc --noEmit --project tsconfig.json
```

Fix any type errors. Then run:

```bash
cd frontend && npx eslint src/components/tracks/drivo/ --ext .ts,.tsx
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/tracks/drivo/
git commit -m "chore(drivo): clean up unused CSS, verify type safety and persistence"
```

---

### Task 8: Run dev server and manual verification

- [ ] **Step 1: Start dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Verify 3-screen flow**

1. Navigate to `/dashboard/tracks/drivo`
2. CreateTripScreen: map preview loads, search inputs work, datetime picker works
3. Select start/end → "Lên kế hoạch" enabled → tap → navigates to Itinerary
4. Itinerary: map shows route, track list shows empty state
5. "Thêm chặng" → navigates to TrackDetail
6. TrackDetail: full-screen map, timeline shows A→B with "+"
7. Tap map → crosshair appears → AI suggestions panel → add POI → timeline updates
8. Save → back to Itinerary → track card appears with correct data
9. Back → CreateTrip → data preserved

- [ ] **Step 3: Verify on mobile viewport**

Open Chrome DevTools → toggle device toolbar → iPhone 14 Pro (393×852).
Confirm all screens render correctly, no overflow, touch targets adequate (min 44px).

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(drivo): address issues found during manual verification"
```
