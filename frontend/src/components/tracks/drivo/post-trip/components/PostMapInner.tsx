"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PostTripRoute } from "../types";

const startIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const endIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const waypointIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  route: PostTripRoute;
  mapId: string;
}

export function PostMapInner({ route, mapId }: Props) {
  useEffect(() => {
    const container = document.getElementById(
      `detail-map-${mapId}`
    );
    if (!container) return;

    const map = L.map(container, {
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const allPoints: [number, number][] = [
      [route.start.lat, route.start.lng],
      ...route.waypoints.map(
        (w) => [w.lat, w.lng] as [number, number]
      ),
      [route.end.lat, route.end.lng],
    ];

    if (allPoints.length > 1) {
      L.polyline(allPoints, {
        color: "#3B82F6",
        weight: 4,
        opacity: 0.8,
      }).addTo(map);
    }

    L.marker([route.start.lat, route.start.lng], { icon: startIcon })
      .addTo(map)
      .bindPopup(`<b>Bắt đầu:</b> ${route.start.name}`);

    route.waypoints.forEach((w) => {
      L.marker([w.lat, w.lng], { icon: waypointIcon })
        .addTo(map)
        .bindPopup(w.name);
    });

    L.marker([route.end.lat, route.end.lng], { icon: endIcon })
      .addTo(map)
      .bindPopup(`<b>Kết thúc:</b> ${route.end.name}`);

    if (allPoints.length > 1) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      map.setView([route.start.lat, route.start.lng], 13);
    }

    return () => {
      map.remove();
    };
  }, [route, mapId]);

  return (
    <div
      id={`detail-map-${mapId}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
