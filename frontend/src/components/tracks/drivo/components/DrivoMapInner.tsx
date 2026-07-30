"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RouteInfo } from "@/lib/osrm";
import { DrivoDestination } from "../types";
import { MapTapHandler } from "./MapTapHandler";

function letterIcon(letter: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;font-family:system-ui,sans-serif;">${letter}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

function dotIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

const originIcon = letterIcon("A", "#3B82F6");
const destIcon = letterIcon("B", "#EF4444");
const waypointIcon = dotIcon("#10B981");
const waypointIconSelected = dotIcon("#FFC928");
const crosshairIconFactory = () => L.divIcon({
  className: "",
  html: `<div style="width:32px;height:32px;border:3px solid #FFC928;border-radius:50%;background:rgba(255,201,40,0.2);box-shadow:0 0 12px rgba(255,201,40,0.5);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;background:#FFC928;border-radius:50%;"></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
const crosshairIcon = crosshairIconFactory();

interface Props {
  origin: DrivoDestination | null;
  destination: DrivoDestination | null;
  waypoints: DrivoDestination[];
  route: RouteInfo | null;
  interactive?: boolean;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  onMarkerDrag?: (id: string, lat: number, lng: number) => void;
  selectedMarkerId?: string | null;
  crosshairLatLng?: { lat: number; lng: number } | null;
}

function toPositions(route: RouteInfo | null): [number, number][] {
  if (!route) return [];
  return route.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
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
  const routePositions = useMemo(() => toPositions(route), [route]);

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
          <Tooltip permanent direction="top" offset={[0, -20]}>
            {origin.name}
          </Tooltip>
        </Marker>
      )}

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

      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
          <Popup>Điểm đến (B): {destination.name}</Popup>
          <Tooltip permanent direction="top" offset={[0, -20]}>
            {destination.name}
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}
