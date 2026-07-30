"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { TripPlan, DrivoScreen, DrivoTrack, DrivoDestination } from "./types";
import { CreateTripScreen } from "./screens/CreateTripScreen";
import { TripItineraryScreen } from "./screens/TripItineraryScreen";
import { TrackDetailScreen } from "./screens/TrackDetailScreen";
import { DrivoMap } from "./components/DrivoMap";
import { fetchOsrmRoute, RouteInfo, LatLng } from "@/lib/osrm";
import styles from "./drivo.module.css";

const STORAGE_KEY = "drivo-app-state";

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

interface PersistedState {
  screen: DrivoScreen;
  plan: TripPlan;
}

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw, deserializeDate) as PersistedState;
  } catch {
    return null;
  }
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state, serializeDate));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function DrivoApp() {
  const [screen, setScreen] = useState<DrivoScreen>(() => {
    return loadState()?.screen ?? "CREATE_TRIP";
  });
  const [plan, setPlan] = useState<TripPlan>(() => {
    return loadState()?.plan ?? {
      id: "1",
      name: "New Trip",
      startLocation: null,
      endLocation: null,
      startTime: null,
      tracks: []
    };
  });
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [mapCollapsed, setMapCollapsed] = useState(false);

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
    let defaultStart = plan.startLocation;
    if (plan.tracks.length > 0) {
      const prev = plan.tracks[plan.tracks.length - 1];
      defaultStart = prev.endLocation || (prev.destinations.length > 0 ? prev.destinations[prev.destinations.length - 1] : prev.startLocation) || plan.startLocation;
    }

    const newTrack: DrivoTrack = {
      id: Math.random().toString(36).substring(7),
      name: `Chặng ${plan.tracks.length + 1}`,
      startLocation: defaultStart,
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

  const handleSaveTrack = (track: DrivoTrack) => {
    setPlan(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === track.id ? track : t)
    }));
    setActiveTrackId(null);
    setScreen("TRIP_ITINERARY");
  };

  const handleCancelTrack = () => {
    setActiveTrackId(null);
    setScreen("TRIP_ITINERARY");
  };

  const handleCancelTrip = () => {
    setScreen("CREATE_TRIP");
  };

  const allWaypoints = useMemo(() => {
    return plan.tracks.flatMap(t => {
      const points = [];
      if (t.startLocation) points.push(t.startLocation);
      points.push(...t.destinations);
      if (t.endLocation) points.push(t.endLocation);
      return points;
    });
  }, [plan.tracks]);

  useEffect(() => {
    if (!plan.startLocation || !plan.endLocation) return;

    const calculateRoute = async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const rawPoints: LatLng[] = [
          { lat: plan.startLocation!.lat, lng: plan.startLocation!.lng },
          ...allWaypoints.map(w => ({ lat: w.lat, lng: w.lng })),
          { lat: plan.endLocation!.lat, lng: plan.endLocation!.lng }
        ];

        const points = rawPoints.filter((p, i, arr) => {
          if (i === 0) return true;
          return p.lat !== arr[i - 1].lat || p.lng !== arr[i - 1].lng;
        });

        const r = await fetchOsrmRoute(points, ac.signal);
        setRoute(r);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("Failed to fetch route", e);
      }
    };

    calculateRoute();
  }, [plan.startLocation, plan.endLocation, allWaypoints]);

  const activeTrack = useMemo(() => {
    return plan.tracks.find(t => t.id === activeTrackId);
  }, [plan.tracks, activeTrackId]);
  const [mapExpanded, setMapExpanded] = useState(false);

  const mapClassName = [
    styles.mapSection,
    mapCollapsed ? styles.mapCollapsed : '',
    mapExpanded && !mapCollapsed ? styles.mapExpanded : '',
  ].filter(Boolean).join(' ');

  const toggleMapSize = () => {
    setMapExpanded(prev => !prev);
  };

  return (
    <div className={styles.container}>
      {screen === "CREATE_TRIP" && (
        <CreateTripScreen
          onPlanTrip={handlePlanTrip}
          initialStart={plan.startLocation}
          initialEnd={plan.endLocation}
        />
      )}

      {screen !== "CREATE_TRIP" && (
        <div className={styles.splitLayout}>
          <div className={mapClassName}>
            <DrivoMap
              origin={screen === "TRACK_DETAIL" && activeTrack ? activeTrack.startLocation : plan.startLocation}
              destination={screen === "TRACK_DETAIL" && activeTrack ? activeTrack.endLocation : plan.endLocation}
              waypoints={screen === "TRACK_DETAIL" && activeTrack ? activeTrack.destinations : allWaypoints}
              route={route}
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
              />
            )}

            {screen === "TRACK_DETAIL" && activeTrack && (
              <TrackDetailScreen
                track={activeTrack}
                onSave={handleSaveTrack}
                onCancel={handleCancelTrack}
                onSearchFocus={() => setMapCollapsed(true)}
                onSearchBlur={() => setMapCollapsed(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
