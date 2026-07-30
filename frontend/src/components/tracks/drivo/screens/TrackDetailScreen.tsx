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
  const [addAfterId, setAddAfterId] = useState<string | null>(null);

  const addDestination = useCallback((dest: DrivoDestination) => {
    setTrack((prev) => {
      const newDests = [...prev.destinations];
      if (addAfterId) {
        const idx = newDests.findIndex((d) => d.id === addAfterId);
        if (idx >= 0) {
          newDests.splice(idx + 1, 0, dest);
        } else {
          newDests.push(dest);
        }
      } else {
        newDests.push(dest);
      }
      return { ...prev, destinations: newDests };
    });
    setCrosshair(null);
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
