"use client";

import { useState, useMemo, useCallback } from "react";
import { DrivoTrack, DrivoDestination } from "../types";
import { DrivoMap } from "../components/DrivoMap";
import { TrackStopsList, StopItem } from "../components/TrackStopsList";
import { SmartLocationInput } from "../components/SmartLocationInput";
import { AISuggestions } from "../components/AISuggestions";
import { TrackPointRange } from "../track-chain-utils";
import { PlaceCandidate } from "@/lib/api";
import { haversineMeters, sliceRouteRange, RouteInfo } from "@/lib/osrm";
import { ArrowLeft, Check } from "lucide-react";
import styles from "../drivo.module.css";

interface Props {
  track: DrivoTrack;
  onUpdateTrack: (track: DrivoTrack) => void;
  onDone: () => void;
  /** Effective start point (previous track's real end, or the trip's start for track 0) — never a stored copy. */
  effectiveStartLocation: DrivoDestination | null;
  route: RouteInfo | null;
  routePointCount: number | null;
  routeDegraded: boolean;
  trackPointRange: TrackPointRange | undefined;
  /** Current buildOrderedTripPoints(plan).length — staleness check against routePointCount. */
  currentPointCount: number;
}

function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(0)}km` : `${m.toFixed(0)}m`;
}

export function TrackDetailScreen({
  track,
  onUpdateTrack,
  onDone,
  effectiveStartLocation,
  route,
  routePointCount,
  routeDegraded,
  trackPointRange,
  currentPointCount,
}: Props) {
  const [crosshair, setCrosshair] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [addAfterId, setAddAfterId] = useState<string | null>(null);

  const isGated = track.endLocation == null;
  const isRouteFresh = route != null && routePointCount === currentPointCount;

  const addDestination = useCallback((dest: DrivoDestination) => {
    const newDests = [...track.destinations];
    if (addAfterId) {
      const idx = newDests.findIndex((d) => d.id === addAfterId);
      if (idx >= 0) newDests.splice(idx + 1, 0, dest);
      else newDests.push(dest);
    } else {
      newDests.push(dest);
    }
    onUpdateTrack({ ...track, destinations: newDests });
    setCrosshair(null);
    setAddAfterId(null);
  }, [track, addAfterId, onUpdateTrack]);

  const removeDestination = useCallback((id: string) => {
    onUpdateTrack({ ...track, destinations: track.destinations.filter((d) => d.id !== id) });
    if (selectedMarkerId === id) setSelectedMarkerId(null);
  }, [track, selectedMarkerId, onUpdateTrack]);

  const handleMarkerDrag = useCallback((id: string, lat: number, lng: number) => {
    if (track.endLocation?.id === id) {
      onUpdateTrack({ ...track, endLocation: { ...track.endLocation, lat, lng } });
      return;
    }
    onUpdateTrack({
      ...track,
      destinations: track.destinations.map((d) => (d.id === id ? { ...d, lat, lng } : d)),
    });
  }, [track, onUpdateTrack]);

  const handleMapClick = useCallback((latlng: { lat: number; lng: number }) => {
    setCrosshair(latlng);
    setAddAfterId(null);
    setPanelExpanded(true);
  }, []);

  const handleAddBetween = useCallback((afterId: string) => {
    setAddAfterId(afterId);
    setCrosshair(null);
    setPanelExpanded(true);
  }, []);

  const handleAddPOI = useCallback((poi: PlaceCandidate) => {
    if (poi.lat == null || poi.lng == null) return;
    addDestination({
      id: `dest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: poi.name,
      lat: poi.lat,
      lng: poi.lng,
      poi_id: poi.poi_id,
      category: poi.category,
      score: poi.score,
      reasons: poi.reasons,
    });
  }, [addDestination]);

  const handleSetEndLocation = useCallback((dest: DrivoDestination) => {
    onUpdateTrack({ ...track, endLocation: dest });
  }, [track, onUpdateTrack]);

  const stopItems: StopItem[] = useMemo(() => {
    function distanceFrom(pointIndex: number, prev: DrivoDestination | undefined, curr: DrivoDestination): { text?: string; degraded: boolean } {
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
      const { text, degraded } = distanceFrom(pointIndex, prev, d);
      items.push({ id: d.id, label: d.name, kind: "waypoint", destination: d, distanceFromPrev: text, degraded: !!text && degraded });
      pointIndex += 1;
      prev = d;
    }

    if (track.endLocation) {
      const { text, degraded } = distanceFrom(pointIndex, prev, track.endLocation);
      items.push({ id: track.endLocation.id, label: track.endLocation.name, kind: "end", destination: track.endLocation, distanceFromPrev: text, degraded: !!text && degraded });
    }

    return items;
  }, [track, trackPointRange, route, routeDegraded, isRouteFresh, effectiveStartLocation]);

  return (
    <div className={styles.trackDetailContainer}>
      <div className={styles.trackDetailMap}>
        <DrivoMap
          origin={effectiveStartLocation}
          destination={track.endLocation}
          waypoints={track.destinations}
          route={
            isRouteFresh && trackPointRange
              ? sliceRouteRange(route, trackPointRange.startIndex, trackPointRange.endIndex)
              : null
          }
          interactive
          onMapClick={isGated ? undefined : handleMapClick}
          onMarkerDrag={handleMarkerDrag}
          selectedMarkerId={selectedMarkerId}
          crosshairLatLng={crosshair}
        />
      </div>

      <div className={styles.trackDetailHeader}>
        <button onClick={onDone} className={styles.trackDetailBackBtn}>
          <ArrowLeft size={22} />
        </button>
        <div className={styles.trackDetailHeaderInfo}>
          <input
            value={track.name}
            onChange={(e) => onUpdateTrack({ ...track, name: e.target.value })}
            className={styles.trackDetailNameInput}
            placeholder="Tên chặng"
          />
        </div>
        <button onClick={onDone} className={styles.trackDetailSaveBtn}>
          <Check size={22} />
        </button>
      </div>

      {isGated ? (
        <div className={`${styles.trackDetailPanel} ${styles.trackDetailPanelExpanded}`}>
          <div className={styles.panelDragHandle}>
            <div className={styles.panelDragBar} />
          </div>
          <div className={styles.stopGate}>
            <div className={styles.stopGateTitle}>Chọn điểm cuối chặng</div>
            <div className={styles.stopGateHint}>Chọn nơi chặng này kết thúc trước khi thêm điểm dừng.</div>
            <SmartLocationInput
              placeholder="Tìm điểm đến cho chặng này..."
              onSelect={handleSetEndLocation}
            />
          </div>
        </div>
      ) : (
        <div className={`${styles.trackDetailPanel} ${panelExpanded ? styles.trackDetailPanelExpanded : ""}`}>
          <div
            className={styles.panelDragHandle}
            onClick={() => setPanelExpanded((p) => !p)}
          >
            <div className={styles.panelDragBar} />
          </div>

          <TrackStopsList
            waypoints={stopItems}
            activeId={selectedMarkerId}
            onSelect={setSelectedMarkerId}
            onAddBetween={handleAddBetween}
            onRemove={removeDestination}
          />

          {panelExpanded && (
            <AISuggestions
              routeLatLngs={route?.coordinates.map(([lng, lat]) => ({ lat, lng })) ?? []}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onAddPOI={handleAddPOI}
            />
          )}
        </div>
      )}
    </div>
  );
}
