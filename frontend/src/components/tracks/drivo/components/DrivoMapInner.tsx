"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RouteInfo } from "@/lib/osrm";
import { DrivoDestination } from "../types";
import { MapTapHandler } from "./MapTapHandler";

/** `label` is restricted (not `string`) so untrusted place names can never reach this `L.divIcon` innerHTML sink. */
const badgeIconCache = new Map<string, L.DivIcon>();

function badgeIcon(label: "A" | "B" | number, color: string, size: number): L.DivIcon {
  const text = String(label);
  const cacheKey = `${text}|${color}|${size}`;
  const cached = badgeIconCache.get(cacheKey);
  if (cached) return cached;

  const fontSize = text.length > 1 ? Math.max(size <= 18 ? 9 : 10, 8) : (size <= 18 ? 10 : 11);
  const icon = L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${fontSize}px;color:#fff;font-family:system-ui,sans-serif;">${text}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
  badgeIconCache.set(cacheKey, icon);
  return icon;
}

const originIcon = badgeIcon("A", "#3B82F6", 22);
const destIcon = badgeIcon("B", "#EF4444", 22);
const crosshairIconFactory = () => L.divIcon({
  className: "",
  html: `<div style="width:32px;height:32px;border:3px solid #FFC928;border-radius:50%;background:rgba(255,201,40,0.2);box-shadow:0 0 12px rgba(255,201,40,0.5);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;background:#FFC928;border-radius:50%;"></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
const crosshairIcon = crosshairIconFactory();

/** Narrower shape accepted by `route` — only coordinates are ever read here. */
type RouteLike = Pick<RouteInfo, "coordinates" | "distanceMeters" | "durationSeconds">;

interface Props {
  origin: DrivoDestination | null;
  destination: DrivoDestination | null;
  waypoints: DrivoDestination[];
  route: RouteLike | null;
  interactive?: boolean;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  onMarkerDrag?: (id: string, lat: number, lng: number) => void;
  selectedMarkerId?: string | null;
  crosshairLatLng?: { lat: number; lng: number } | null;
}

function toPositions(coordinates: [number, number][]): [number, number][] {
  return coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
}

function MapAutoFit({
  origin,
  destination,
  waypoints,
}: {
  origin: DrivoDestination | null;
  destination: DrivoDestination | null;
  waypoints: DrivoDestination[];
}) {
  const map = useMap();
  const key = useMemo(
    () =>
      `${origin?.lat},${origin?.lng}|${destination?.lat},${destination?.lng}|${waypoints.map(w => w.id).join(",")}`,
    [origin, destination, waypoints],
  );
  
  useEffect(() => {
    const points: [number, number][] = [];
    if (origin) points.push([origin.lat, origin.lng]);
    if (destination) points.push([destination.lat, destination.lng]);
    for (const w of waypoints) points.push([w.lat, w.lng]);
    
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 15 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  
  return null;
}

export function DrivoMapInner({
  origin,
  destination,
  waypoints,
  route,
  interactive,
  onMapClick,
  onMarkerDrag,
  selectedMarkerId,
  crosshairLatLng,
}: Props) {
  const routePositions = useMemo(
    () => (route ? toPositions(route.coordinates) : []),
    [route],
  );

  // Default center if nothing is provided (Vietnam)
  const defaultCenter: [number, number] = [16.047079, 108.206230];

  return (
    <MapContainer
      center={origin ? [origin.lat, origin.lng] : defaultCenter}
      zoom={6}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapAutoFit origin={origin} destination={destination} waypoints={waypoints} />

      {interactive && onMapClick && (
        <MapTapHandler onTap={onMapClick} enabled={interactive} />
      )}

      {crosshairLatLng && (
        <Marker
          position={[crosshairLatLng.lat, crosshairLatLng.lng]}
          icon={crosshairIcon}
        >
          <Popup>Thêm điểm dừng tại đây?</Popup>
        </Marker>
      )}

      {routePositions.length > 0 && (
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: "#3B82F6",
            weight: 5,
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round"
          }}
        />
      )}

      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
          <Popup>Điểm đi (A): {origin.name}</Popup>
        </Marker>
      )}

      {waypoints.map((wp, index) => (
        <Marker
          key={wp.id}
          position={[wp.lat, wp.lng]}
          icon={badgeIcon(index + 1, selectedMarkerId === wp.id ? "#FFC928" : "#10B981", 18)}
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
        </Marker>
      ))}

      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
          <Popup>Điểm đến (B): {destination.name}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
