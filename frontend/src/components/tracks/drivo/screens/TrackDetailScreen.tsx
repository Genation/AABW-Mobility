"use client";

import { useState, useMemo, useCallback } from "react";
import { DrivoTrack, DrivoDestination } from "../types";
import { DrivoMap } from "../components/DrivoMap";
import { TrackStopsList } from "../components/TrackStopsList";
import { SmartLocationInput } from "../components/SmartLocationInput";
import { AISuggestions } from "../components/AISuggestions";
import { RouteSummaryHeader } from "../components/RouteSummaryHeader";
import { TrackPointRange } from "../track-chain-utils";
import { buildStopItems, formatDistance } from "../stop-items-utils";
import { PlaceCandidate } from "@/lib/api";
import { sliceRouteRange, haversineMeters, RouteInfo } from "@/lib/osrm";
import { ArrowLeft, Check } from "lucide-react";
import styles from "../drivo.module.css";

interface Props {
  track: DrivoTrack;
  onUpdateTrack: (track: DrivoTrack) => void;
  onDone: () => void;
  /** Effective start point (previous track's real end, or the trip's start for track 0) — never a stored copy. */
  effectiveStartLocation: DrivoDestination | null;
  route: RouteInfo | null;
  /** Coordinate-value key the current route.legs was actually fetched for. */
  routeCoordinateKey: string | null;
  routeDegraded: boolean;
  trackPointRange: TrackPointRange | undefined;
  /** Current buildOrderedTripPointsKey(plan) — staleness check against routeCoordinateKey. */
  currentCoordinateKey: string;
  /** Fires after a stop is added via POI search (AI advisor trigger). */
  onStopAdded?: (dest: DrivoDestination) => void;
  /** Fires before a stop is removed, so callers can drop anything keyed to its id (AI advisor trigger). */
  onStopRemoved?: (id: string) => void;
}

export function TrackDetailScreen({
  track,
  onUpdateTrack,
  onDone,
  effectiveStartLocation,
  route,
  routeCoordinateKey,
  routeDegraded,
  trackPointRange,
  currentCoordinateKey,
  onStopAdded,
  onStopRemoved,
}: Props) {
  const [crosshair, setCrosshair] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [addAfterId, setAddAfterId] = useState<string | null>(null);
  const [gateSearchActive, setGateSearchActive] = useState(false);

  const isGated = track.endLocation == null;
  const isRouteFresh = route != null && routeCoordinateKey === currentCoordinateKey;

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
    onStopAdded?.(dest);
  }, [track, addAfterId, onUpdateTrack, onStopAdded]);

  const removeDestination = useCallback((id: string) => {
    onStopRemoved?.(id);
    onUpdateTrack({ ...track, destinations: track.destinations.filter((d) => d.id !== id) });
    if (selectedMarkerId === id) setSelectedMarkerId(null);
  }, [track, selectedMarkerId, onUpdateTrack, onStopRemoved]);

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

  const stopItems = useMemo(
    () => buildStopItems({ track, effectiveStartLocation, trackPointRange, route, routeDegraded, isRouteFresh }),
    [track, trackPointRange, route, routeDegraded, isRouteFresh, effectiveStartLocation],
  );

  const trackDistanceText = useMemo(() => {
    if (isRouteFresh && trackPointRange && route) {
      return formatDistance(
        sliceRouteRange(route, trackPointRange.startIndex, trackPointRange.endIndex).distanceMeters,
      );
    }
    if (routeDegraded && effectiveStartLocation && track.endLocation) {
      const estimated = haversineMeters(
        effectiveStartLocation.lat, effectiveStartLocation.lng,
        track.endLocation.lat, track.endLocation.lng,
      );
      return `${formatDistance(estimated)} (ước tính)`;
    }
    return null;
  }, [isRouteFresh, trackPointRange, route, routeDegraded, effectiveStartLocation, track.endLocation]);

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
        <div className={styles.trackDetailHeaderRow}>
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
        {!isGated && (
          <RouteSummaryHeader
            variant="overlay"
            startName={effectiveStartLocation?.name ?? "?"}
            endName={track.endLocation?.name ?? "?"}
            meta={
              <>
                {trackDistanceText && <span>{trackDistanceText}</span>}
                <span>{track.destinations.length} điểm dừng</span>
              </>
            }
          />
        )}
      </div>

      {isGated ? (
        <div className={`${styles.trackDetailPanel} ${gateSearchActive ? styles.trackDetailPanelSearching : styles.trackDetailPanelExpanded}`}>
          <div className={styles.panelDragHandle}>
            <div className={styles.panelDragBar} />
          </div>
          <div className={styles.stopGate}>
            <div className={styles.stopGateTitle}>Chọn điểm cuối chặng</div>
            <div className={styles.stopGateHint}>Chọn nơi chặng này kết thúc trước khi thêm điểm dừng.</div>
            <SmartLocationInput
              placeholder="Tìm điểm đến cho chặng này..."
              onSelect={handleSetEndLocation}
              onFocus={() => setGateSearchActive(true)}
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
