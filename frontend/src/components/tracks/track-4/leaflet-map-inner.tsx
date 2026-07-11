"use client";

/**
 * Leaflet map inner component — rendered only on client-side.
 * Custom labeled markers (A=origin, B=destination) with route polyline.
 */

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { LatLng } from "@/hooks/use-route-map";
import type { RouteInfo } from "@/hooks/use-route-map";

/* Fix Leaflet default marker icon path issue in webpack/Next.js */
import "leaflet/dist/leaflet.css";

/**
 * Custom DivIcon markers — circular labels with letters A/B.
 * More visually distinct than default pin markers.
 */
const originIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 32px; height: 32px;
      background: #3B82F6;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(59,130,246,0.5), 0 0 0 2px rgba(59,130,246,0.3);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 14px; color: #fff;
      font-family: system-ui, sans-serif;
    ">A</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
});

const destIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 32px; height: 32px;
      background: #EF4444;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(239,68,68,0.5), 0 0 0 2px rgba(239,68,68,0.3);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 14px; color: #fff;
      font-family: system-ui, sans-serif;
    ">B</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
});

interface LeafletMapInnerProps {
  userLocation: LatLng;
  destination: LatLng;
  destinationName: string;
  route: RouteInfo | null;
}

/**
 * Auto-fit map bounds when route or destination changes.
 */
function MapAutoFit({
  userLocation,
  destination,
}: {
  userLocation: LatLng;
  destination: LatLng;
}) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(
      [userLocation.lat, userLocation.lng],
      [destination.lat, destination.lng],
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }, [map, userLocation, destination]);

  return null;
}

export function LeafletMapInner({
  userLocation,
  destination,
  destinationName,
  route,
}: LeafletMapInnerProps) {
  const mapRef = useRef<L.Map | null>(null);

  /** Convert GeoJSON [lng, lat] → Leaflet [lat, lng] for polyline */
  const routePositions = useMemo(() => {
    if (!route) return [];
    return route.coordinates.map(
      ([lng, lat]) => [lat, lng] as [number, number],
    );
  }, [route]);

  const center: [number, number] = [
    (userLocation.lat + destination.lat) / 2,
    (userLocation.lng + destination.lng) / 2,
  ];

  return (
    <MapContainer
      center={center}
      zoom={13}
      ref={mapRef}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Auto-fit to bounds */}
      <MapAutoFit userLocation={userLocation} destination={destination} />

      {/* Blue accuracy circle around user location */}
      <Circle
        center={[userLocation.lat, userLocation.lng]}
        radius={200}
        pathOptions={{
          color: "#3B82F6",
          fillColor: "#3B82F6",
          fillOpacity: 0.08,
          weight: 1,
          opacity: 0.3,
        }}
      />

      {/* Origin marker — A (blue) */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={originIcon}>
        <Popup>
          <div style={{ textAlign: "center", padding: "4px 0" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "2px" }}>
              📍 Vị trí của bạn
            </div>
            <div style={{ fontSize: "11px", color: "#666" }}>Điểm đi (A)</div>
          </div>
        </Popup>
      </Marker>

      {/* Destination marker — B (red) */}
      <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
        <Popup>
          <div style={{ textAlign: "center", padding: "4px 0" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "2px" }}>
              🏁 {destinationName}
            </div>
            <div style={{ fontSize: "11px", color: "#666" }}>Điểm đến (B)</div>
          </div>
        </Popup>
      </Marker>

      {/* Route outline (dark shadow for depth) */}
      {routePositions.length > 0 && (
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: "#1E40AF",
            weight: 7,
            opacity: 0.3,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      )}

      {/* Route polyline (main blue line) */}
      {routePositions.length > 0 && (
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: "#3B82F6",
            weight: 5,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      )}
    </MapContainer>
  );
}
