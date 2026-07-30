"use client";

/* eslint-disable react-hooks/set-state-in-effect -- SSR-safe hydration: state is intentionally seeded from localStorage only after mount */

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { TripPlan, DrivoScreen, DrivoTrack, DrivoDestination } from "./types";
import { CreateTripScreen } from "./screens/CreateTripScreen";
import { TripItineraryScreen } from "./screens/TripItineraryScreen";
import { TrackDetailScreen } from "./screens/TrackDetailScreen";
import { DrivoMap } from "./components/DrivoMap";
import { fetchOsrmRoute, sliceRouteRange, RouteInfo, LatLng } from "@/lib/osrm";
import { buildOrderedTripPoints, getTrackPointRanges, getEffectiveTrackStart } from "./track-chain-utils";
import { TRACK_COLORS } from "./track-colors";
import styles from "./drivo.module.css";

const STORAGE_KEY = "drivo-app-state";
const STORAGE_VERSION_KEY = "drivo-app-version";
const CURRENT_VERSION = 3;
const ROUTE_FETCH_DEBOUNCE_MS = 300;
const ROUTE_FAILURE_BACKOFF_MS = 30000;
const ROUTE_FAILURE_THRESHOLD = 2;

const DEFAULT_PLAN: TripPlan = {
  id: "1",
  name: "New Trip",
  startLocation: null,
  endLocation: null,
  startTime: null,
  tracks: [],
};

function serializeDate(key: string, value: unknown) {
  if (value instanceof Date) return `__DATE__${value.toISOString()}`;
  return value;
}

function deserializeDate(key: string, value: unknown) {
  if (typeof value === "string" && value.startsWith("__DATE__")) {
    return new Date(value.slice(8));
  }
  return value;
}

function sanitizePlan(plan: TripPlan): TripPlan {
  if (plan.startTime && typeof plan.startTime === "string") {
    const d = new Date(plan.startTime);
    plan.startTime = isNaN(d.getTime()) ? null : d;
  }
  if (plan.startTime && !(plan.startTime instanceof Date)) {
    plan.startTime = null;
  }
  return plan;
}

interface PersistedState {
  screen: DrivoScreen;
  plan: TripPlan;
}

function loadPersistedState(): PersistedState | null {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    if (version !== String(CURRENT_VERSION)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw, deserializeDate) as PersistedState;
    state.plan = sanitizePlan(state.plan);
    return state;
  } catch {
    return null;
  }
}

function savePersistedState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state, serializeDate));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function DrivoApp() {
  const [mounted, setMounted] = useState(false);
  const [stateLoaded, setStateLoaded] = useState(false);
  const persistedRef = useRef<PersistedState | null>(null);

  const [screen, setScreen] = useState<DrivoScreen>("CREATE_TRIP");
  const [plan, setPlan] = useState<TripPlan>(DEFAULT_PLAN);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routePointCount, setRoutePointCount] = useState<number | null>(null);
  const [routeDegraded, setRouteDegraded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeFetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeFailureCountRef = useRef(0);
  const routeBackoffUntilRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    const persisted = loadPersistedState();
    if (persisted) {
      persistedRef.current = persisted;
      setScreen(persisted.screen);
      setPlan(persisted.plan);
      if (persisted.screen === "TRACK_DETAIL" && persisted.plan.tracks.length > 0) {
        setActiveTrackId(persisted.plan.tracks[persisted.plan.tracks.length - 1].id);
      }
    }
    setStateLoaded(true);
  }, []);

  const debouncedSave = useCallback((s: DrivoScreen, p: TripPlan) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      savePersistedState({ screen: s, plan: p });
    }, 300);
  }, []);

  useEffect(() => {
    if (!stateLoaded) return;
    debouncedSave(screen, plan);
  }, [screen, plan, stateLoaded, debouncedSave]);

  const handlePlanTrip = (start: DrivoDestination, end: DrivoDestination, time: Date) => {
    setPlan(prev => ({
      ...prev,
      startLocation: start,
      endLocation: end,
      startTime: time
    }));
    setScreen("TRIP_ITINERARY");
  };

  const handleAddTrack = () => {
    const newTrack: DrivoTrack = {
      id: Math.random().toString(36).substring(7),
      name: `Chặng ${plan.tracks.length + 1}`,
      startLocation: null,
      endLocation: null,
      destinations: []
    };
    setPlan(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));
    setActiveTrackId(newTrack.id);
    setScreen("TRACK_DETAIL");
  };

  const handleEditTrack = (track: DrivoTrack) => {
    setActiveTrackId(track.id);
    setScreen("TRACK_DETAIL");
  };

  const handleUpdateTrack = useCallback((track: DrivoTrack) => {
    setPlan(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === track.id ? track : t)
    }));
  }, []);

  const handleDoneTrack = useCallback(() => {
    setActiveTrackId(null);
    setScreen("TRIP_ITINERARY");
  }, []);

  const handleCancelTrip = () => {
    setScreen("CREATE_TRIP");
  };

  // Display-only markers for the overview map: intermediate stops + each track's
  // end point. Excludes plan.startLocation/endLocation (rendered separately as
  // the A/B markers) and track.startLocation (always null for chained tracks —
  // the previous track's real endLocation already occupies that slot).
  const mapWaypoints = useMemo(() => {
    return plan.tracks.flatMap(t => {
      const points = [...t.destinations];
      if (t.endLocation) points.push(t.endLocation);
      return points;
    });
  }, [plan.tracks]);

  const orderedPoints = useMemo(() => buildOrderedTripPoints(plan), [plan]);
  const trackPointRanges = useMemo(() => getTrackPointRanges(plan), [plan]);
  const coordinateKey = useMemo(
    () => orderedPoints.map(p => `${p.lat},${p.lng}`).join("|"),
    [orderedPoints],
  );

  const calculateRoute = useCallback(async (points: LatLng[]) => {
    if (Date.now() < routeBackoffUntilRef.current) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const r = await fetchOsrmRoute(points, ac.signal);
      setRoute(r);
      setRoutePointCount(points.length);
      routeFailureCountRef.current = 0;
      setRouteDegraded(false);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      console.error("Failed to fetch route", e);
      routeFailureCountRef.current += 1;
      if (routeFailureCountRef.current >= ROUTE_FAILURE_THRESHOLD) {
        routeBackoffUntilRef.current = Date.now() + ROUTE_FAILURE_BACKOFF_MS;
        setRouteDegraded(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!plan.startLocation || !plan.endLocation) return;

    if (routeFetchTimerRef.current) clearTimeout(routeFetchTimerRef.current);
    routeFetchTimerRef.current = setTimeout(() => {
      calculateRoute(orderedPoints.map(p => ({ lat: p.lat, lng: p.lng })));
    }, ROUTE_FETCH_DEBOUNCE_MS);

    return () => {
      if (routeFetchTimerRef.current) clearTimeout(routeFetchTimerRef.current);
    };
    // orderedPoints is captured fresh whenever coordinateKey actually changes
    // (its dependency below) — see track-chain-utils.ts for why coordinate
    // values, not plan.tracks reference identity, drive this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinateKey, plan.startLocation, plan.endLocation, calculateRoute]);

  const isRouteFresh = route != null && routePointCount === orderedPoints.length;

  const trackSegments = useMemo(() => {
    if (!isRouteFresh || !route) return [];
    return plan.tracks.map((t, i) => ({
      trackId: t.id,
      coordinates: sliceRouteRange(route, trackPointRanges[i].startIndex, trackPointRanges[i].endIndex).coordinates,
      color: TRACK_COLORS[i % TRACK_COLORS.length],
    }));
  }, [isRouteFresh, route, plan.tracks, trackPointRanges]);

  const activeTrackIndex = useMemo(() => {
    return plan.tracks.findIndex(t => t.id === activeTrackId);
  }, [plan.tracks, activeTrackId]);
  const activeTrack = activeTrackIndex >= 0 ? plan.tracks[activeTrackIndex] : undefined;
  const [mapExpanded, setMapExpanded] = useState(false);

  const mapClassName = [
    styles.mapSection,
    mapExpanded ? styles.mapExpanded : '',
  ].filter(Boolean).join(' ');

  const toggleMapSize = () => {
    setMapExpanded(prev => !prev);
  };

  if (!mounted) {
    return <div className={styles.container} />;
  }

  return (
    <div className={styles.container}>
      {screen === "CREATE_TRIP" && (
        <CreateTripScreen
          onPlanTrip={handlePlanTrip}
          initialStart={plan.startLocation}
          initialEnd={plan.endLocation}
        />
      )}

      {screen !== "CREATE_TRIP" && screen !== "TRACK_DETAIL" && (
        <div className={styles.splitLayout}>
          <div className={mapClassName}>
            <DrivoMap
              origin={plan.startLocation}
              destination={plan.endLocation}
              waypoints={mapWaypoints}
              route={null}
              trackSegments={trackSegments}
            />
            <button
              onClick={toggleMapSize}
              className={styles.mapToggleBtn}
              title={mapExpanded ? "Thu nhỏ bản đồ" : "Mở rộng bản đồ"}
            >
              {mapExpanded ? "▼" : "▲"}
            </button>
          </div>

          <div className={styles.panelSection}>
            {screen === "TRIP_ITINERARY" && (
              <TripItineraryScreen
                plan={plan}
                onAddTrack={handleAddTrack}
                onEditTrack={handleEditTrack}
                onCancelTrip={handleCancelTrip}
                activeTrackId={activeTrackId}
                route={route}
                routePointCount={routePointCount}
                routeDegraded={routeDegraded}
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
            )}
          </div>
        </div>
      )}

      {screen === "TRACK_DETAIL" && activeTrack && (
        <TrackDetailScreen
          track={activeTrack}
          onUpdateTrack={handleUpdateTrack}
          onDone={handleDoneTrack}
          effectiveStartLocation={getEffectiveTrackStart(plan, activeTrackIndex)}
          route={route}
          routePointCount={routePointCount}
          routeDegraded={routeDegraded}
          trackPointRange={trackPointRanges.find(r => r.trackId === activeTrack.id)}
          currentPointCount={orderedPoints.length}
        />
      )}
    </div>
  );
}
