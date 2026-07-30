# Drivo Pre-Trip UI/UX Redesign

## Summary

Redesign all 3 pre-trip screens of Drivo (Track #14) with a map-first,
mobile-first approach. The current implementation is form-heavy and lacks visual
connection between map, itinerary, and destinations. This redesign makes the map
the primary interaction surface while preserving the existing 3-screen
navigation architecture.

**Tagline:** "Plan the drive. Live the story."

## Goals

- **Screen 1 — CreateTrip**: Add map preview that auto-pans when user selects
  start/end locations. Show route preview + road coloring. Polish the form card.
- **Screen 2 — TripItinerary**: Map with per-track color-coded route segments.
  Timeline-based track list with drag-to-reorder, distance/time estimates, and
  AI track-splitting suggestion.
- **Screen 3 — TrackDetail (map-first)**: Full-screen map as primary interaction
  surface. Tap map to add waypoints. Horizontal timeline strip + AI POI
  suggestions along route in an expandable overlay panel.

## Non-Goals

- Drive (in-trip simulation) or Memory (post-trip recap) screens.
- Community, Discovery, or sharing features.
- Drivo Link OBD2 integration.
- Backend API or database schema changes.
- Actual turn-by-turn navigation.
- Photo/media upload or gallery.
- User authentication (reuses existing track auth).

## Visual System

Adopted from the pitch deck visual system:

| Token         | Value        | Usage                        |
| ------------- | ------------ | ---------------------------- |
| Road yellow   | `#FFC928`    | Primary accent, CTA, routes  |
| Asphalt bg    | `#11161C`    | Dark backgrounds, map base   |
| Midnight navy | `#0D1B2A`    | Card backgrounds, overlays   |
| Warm white    | `#F6F3ED`    | Primary text                 |
| Secondary gray| `#AAB4BE`    | Secondary text, inactive     |
| Teal          | `#00A9A5`    | Data/platform accents        |
| Marker A      | `#3B82F6`    | Start/origin marker (blue)   |
| Marker B      | `#EF4444`    | End/destination marker (red) |
| Track colors  | Spectrum     | One distinct color per track |

Typography: Sans-serif, 2-3 levels. Mobile-first 320-428px.

## Screen Designs

### Screen 1: CreateTripScreen

```
┌─────────────────────────────┐
│      Drivo Logo (nhỏ)       │
│  Plan the drive. Live the   │
│         story.              │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │     MAP PREVIEW         │ │
│ │  auto-pan on selection  │ │
│ │  route preview dashed   │ │
│ │  road coloring active   │ │
│ │  user location pin      │ │
│ └─────────────────────────┘ │
│                             │
│ ● Điểm xuất phát            │
│ ┌ SmartLocationInput ─────┐ │
│ │ 🔍 Nhập điểm bắt đầu... │ │
│ └──────────────────────────┘ │
│                             │
│ ● Điểm đến                  │
│ ┌ SmartLocationInput ─────┐ │
│ │ 🔍 Nhập điểm kết thúc...│ │
│ └──────────────────────────┘ │
│                             │
│ ● Thời gian bắt đầu         │
│ ┌─────────────────────────┐ │
│ │ 📅 30/07/2026 · 08:00   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │  ▶ LÊN KẾ HOẠCH        │ │
│ │    (glow road-yellow)   │ │
│ └─────────────────────────┘ │
│       MVP · Drivo Team      │
└─────────────────────────────┘
```

**States:**
- `EMPTY`: Map shows user location (from `useRouteMap`). Both inputs empty.
- `START_SELECTED`: Map auto-pans to start location. One pin on map.
- `BOTH_SELECTED`: Map fits bounds to show both points. Dashed route preview
  line. CTA button enabled.
- `SUBMITTING`: Brief loading state before navigating to Screen 2.

**Key interactions:**
- SmartLocationInput reuses existing P9 autocomplete (clone from routemate,
  already done).
- Selected location shows as chip with "Đổi" button to re-select.
- Datetime picker defaults to now, uses native `datetime-local`.
- Map preview uses the same Leaflet/OSRM infra as other screens.

### Screen 2: TripItineraryScreen

```
┌─────────────────────────────┐
│ ← HCM → Đà Lạt    3/5 trk  │
│   📅 01/08 · 320km         │
├─────────────────────────────┤
│ ┌── MAP (40% height) ────┐ │
│ │ ██ Trk1 (orange)       │ │
│ │ ▓▓ Trk2 (green)        │ │
│ │ ░░ Trk3 selected       │ │
│ │ ░░ Trk4 dim            │ │
│ │ ░░ Trk5 dim            │ │
│ │ A ●───●───●───● B     │ │
│ └─────────────────────────┘ │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│ ┌ TIMELINE (60%, scroll)─┐ │
│ │ ●── Trk1: HCM→Long Khánh│ │
│ │ │   85km · ~2h · 0 stops│ │
│ │ │        ⋮⋮             │ │
│ │ ●── Trk2: Long Khánh→BL│ │
│ │ │   110km · ~3h · 2 stops│ │
│ │ │        ⋮⋮             │ │
│ │ ●── Trk3: Bảo Lộc→Đà Lạt│ │ ← selected
│ │ │   125km · ~3.5h       │ │
│ │ │        ⋮⋮             │ │
│ │ ── + Thêm chặng ──      │ │
│ │ [✨ AI gợi ý chia chặng]│ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**States:**
- `LOADING`: Route being calculated via OSRM. Skeleton cards in timeline.
- `EMPTY`: No tracks yet. Map shows start→end preview. Timeline shows "Chưa có
  chặng nào" with primary CTA "Thêm chặng đầu tiên".
- `WITH_TRACKS`: Map renders color-coded segments. Timeline lists each track as
  a card with distance/time/destination count.
- `REORDERING`: Drag active — other cards shift with spring animation.
  `onDragEnd` re-indexes `plan.tracks[]` and re-calculates route.

**Key interactions:**
- **Tap track card** → navigate to Screen 3 (TrackDetail) for editing.
- **Drag handle** (⋮⋮) → reorder tracks. Route recalculates on drop.
- **Swipe left** on track card → reveal red "Xóa" button with confirmation.
- **"Thêm chặng"** → creates new track auto-named "Chặng N", defaults
  startLocation to previous track's endLocation.
- **"AI gợi ý chia chặng"** → future hook (no backend endpoint yet). Button
  renders but shows "Tính năng sắp ra mắt" toast on tap. UI placeholder only in
  this spec.
- **Map tap on segment** → highlights that track in timeline, scrolls to it.
- **Map expand/collapse** toggle preserved from current implementation.

**Data displayed per track card:**
- Track number + name
- Start → End (if both set)
- Estimated distance (from OSRM)
- Estimated drive time
- Destination count badge
- Road-coloring status (planned vs partially explored)

### Screen 3: TrackDetailScreen (Map-First)

```
┌─────────────────────────────┐
│ ← Hủy  Chặng 2: Bảo Lộc  ✓ │
│         125km · ~3.5h       │
├─────────────────────────────┤
│                             │
│     FULL-SCREEN MAP         │
│                             │
│  🅰 ─── ① ─── ② ─── 🅱    │
│   │      │      │      │    │
│   │      │  tap anywhere   │
│   ▼      ▼  to add stop    ▼
│                             │
│  "Chạm vào tuyến đường      │
│   để thêm điểm dừng"        │
│                             │
├ ─ ─ ─ ─ ─ OVERLAY PANEL ─ ─┤
│ ┌ HORIZONTAL TIMELINE ───┐ │
│ │ [A] →45km→ [①Cafe] ... │ │ ← collapsed (35%)
│ │  +           +      [B] │ │
│ └─────────────────────────┘ │
│   ▲ kéo lên xem gợi ý ▲    │
│                             │
│ ┌ AI GỢI Ý DỌC ĐƯỜNG ───┐ │
│ │ [🍜] [☕] [⛽] [📸] [🏨]│ │ ← expanded (70%)
│ │                         │ │
│ │ ☕ Highland Coffee       │ │
│ │   Cách route 200m    [+]│ │
│ │                         │ │
│ │ 📸 Đồi chè Bảo Lộc      │ │
│ │   Cách route 1.2km   [+]│ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**States:**
- `LOADING`: Route calculating. Timeline skeleton.
- `VIEWING`: Map + collapsed timeline (default). User explores route visually.
- `ADDING_STOP`: User tapped map → crosshair appears at tap point → search
  radius activates → nearby POIs load. Or user tapped "+" between two stops.
- `EXPANDED`: Panel pulled up to 70% height. AI suggestions visible with active
  category filter.
- `DRAGGING`: User dragging a waypoint marker on map. Route polyline updates in
  real-time.
- `SAVING`: Brief loading → navigate back to Screen 2.

**Key interactions:**
- **Tap on map** (not on existing marker): Place crosshair, search nearby POIs
  (radius ~500m from tap point). Results appear in panel.
- **Tap on route polyline**: Same as tap on map at that coordinate.
- **Drag existing marker**: Move waypoint to new position. Route recalculates.
  Timeline updates distance values.
- **Tap "+" in timeline**: Opens add-stop mode between two adjacent stops. Map
  zooms to that segment.
- **Tap timeline card**: Map pans to that waypoint, card highlights.
- **Pull up panel**: Reveals AI POI suggestions section. Uses existing
  `searchPlaces` API with category filter.
- **Category filter chips**: Toggle Ăn uống/Cafe/Trạm xăng/Check-in/Nghỉ
  dưỡng. Single-select (tap one replaces previous).
- **Tap [+] on POI card**: Adds destination to track, inserts at optimal
  position in route order. Timeline updates. Map adds numbered marker.
- **Tap waypoint in timeline**: Opens edit mode (name, notes — MVP may defer
  notes).
- **Swipe waypoint card left**: Remove from track with undo toast.
- **Header "✓" save**: Persist track changes, navigate back to Screen 2.

**Timeline strip details:**
- Horizontal scrollable, snap-to-card.
- Each card: icon (category if POI, letter if start/end), name (truncated),
  distance from previous, estimated time from previous.
- "+" buttons between cards.
- Active card (selected/map-focused) has road-yellow border.
- Empty state: just A and B with one "+" between them.

**AI POI suggestions:**
- Source: `POST /api/routemate/searchPlaces` with `nearbyLat/nearbyLng` set to
  route midpoints.
- Computed per segment: for each pair of consecutive waypoints, sample 3-5
  points along the route polyline and search nearby.
- Results deduplicated by place ID.
- Sorted by distance from route (closest first).
- Each card shows: name, category badge, distance from route, star rating if
  available, "+" add button.

## Component Tree

```
DrivoApp
├── CreateTripScreen
│   ├── DrivoLogo (Image)
│   ├── DrivoMapPreview (new)
│   │   └── DrivoMapInner (reuse, with preview mode)
│   ├── SmartLocationInput ×2 (reuse)
│   └── DateTimePicker (native)
│
├── TripItineraryScreen
│   ├── ItineraryHeader
│   ├── DrivoMap (reuse, with segment coloring)
│   │   └── DrivoMapInner
│   │       ├── TrackSegmentPolyline ×N
│   │       └── WaypointMarker ×N
│   └── TrackTimeline
│       ├── TrackCard ×N (draggable)
│       │   ├── TrackInfo (distance, time, stops)
│       │   └── DragHandle
│       ├── AddTrackButton
│       └── AISplitButton
│
└── TrackDetailScreen
    ├── DetailHeader
    ├── DrivoMap (full-screen, interactive)
    │   └── DrivoMapInner
    │       ├── TrackRoutePolyline
    │       ├── WaypointMarker ×N (draggable)
    │       ├── CrosshairOverlay (when adding)
    │       └── TapHandler (map click → add stop)
    └── OverlayPanel (expandable)
        ├── HorizontalTimeline
        │   ├── TimelineCard ×N
        │   └── AddStopButton ×(N+1)
        └── AISuggestions
            ├── CategoryChips
            └── POICard ×N
```

## Data Flow

```
CreateTripScreen
  user selects start/end → SmartLocationInput → onSelect(DrivoDestination)
  map auto-pans via bounds calculation
  submit → DrivoApp.handlePlanTrip(start, end, time)
         → setPlan(...), setScreen("TRIP_ITINERARY")

TripItineraryScreen
  DrivoApp passes plan + route (from OSRM useEffect)
  track list renders from plan.tracks[]
  add track → DrivoApp.handleAddTrack()
  edit track → DrivoApp.handleEditTrack(track)
  reorder → local state update → DrivoApp route recalculates

TrackDetailScreen
  DrivoApp passes activeTrack (from plan.tracks[])
  local state: track (mutable copy), addingDest (boolean)
  add destination → update local track state
  save → DrivoApp.handleSaveTrack(track) → setScreen("TRIP_ITINERARY")
  cancel → DrivoApp.handleCancelTrack()
  route recalculates in DrivoApp useEffect when waypoints change
```

**State persistence:** `localStorage` via `STORAGE_KEY = "drivo-app-state"`.
Screen + plan serialized on every change. Date serialization preserved.

## Error Handling

- **OSRM route fetch failure:** Show toast "Không thể tính toán tuyến đường.
  Thử lại." Map shows straight-line preview instead.
- **AI suggestions failure:** Hide AI suggestions section. Timeline-only mode
  still functional.
- **Empty track name:** Auto-fallback to "Chặng N" where N is index+1.
- **No start/end location:** "Thêm chặng" disabled if previous track has no
  endLocation.
- **Duplicate destination:** Prevent adding same place ID twice to same track.
  Show toast "Điểm này đã có trong chặng."

## Performance Considerations

- DrivoMap lazy-loaded (already implemented via `dynamic()`).
- OSRM route debounced (300ms) to avoid rapid recalculations during drag.
- AI POI suggestions fetched on panel expand, not on every map click.
- Track segment colors computed once per render cycle (useMemo).
- SmartLocationInput debounces API calls (already implemented via existing
  hook).

## Delivery Strategy

Implement in this order:

1. **TrackDetailScreen** — highest impact, biggest gap. Full-screen map +
   interactive markers + timeline strip + AI suggestions panel.
2. **TripItineraryScreen** — track color segments on map + timeline cards +
   drag-to-reorder.
3. **CreateTripScreen** — map preview + polished form + route preview.

Each screen should be independently testable via existing DrivoApp state machine
(just swap in new screen component).

### Dependencies

- Existing `DrivoMap` / `DrivoMapInner` components (extend, don't replace).
- Existing `SmartLocationInput` (reuse as-is).
- Existing `fetchOsrmRoute` from `@/lib/osrm`.
- Existing `searchPlaces`, `fetchSuggestions` from `@/lib/api`.
- Existing `useRouteMap` hook for user location.
- Leaflet + OpenStreetMap tiles (no change).

### What stays unchanged

- `types.ts` — DrivoDestination, DrivoTrack, TripPlan, DrivoScreen (all
  adequate for pre-trip).
- `DrivoApp.tsx` — state machine, OSRM fetching, localStorage (minor additions
  for new props only).
- `SmartLocationInput` — already cloned from routemate.
- `drivo.module.css` — extensive rewrite for new layouts, but keep existing
  design tokens.
- `constants.ts` — Track #14 definition unchanged.
- `page.tsx` — unchanged wrapper.
- `header.tsx` — Drivo logo swap unchanged.

## Success Metrics

- TrackDetail: user can add a waypoint via map tap in under 3 taps total.
- TrackDetail: AI suggestions load within 1.5s of panel expand.
- Itinerary: user can reorder tracks via drag-and-drop.
- CreateTrip: map preview appears within 500ms of location selection.
- Zero regressions: existing localStorage persistence, search, routing still
  work.
