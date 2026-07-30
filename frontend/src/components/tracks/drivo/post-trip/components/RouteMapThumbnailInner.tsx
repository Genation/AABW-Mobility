"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PostTripRoute } from "../types";

const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  route: PostTripRoute;
  mapId: string;
}

export function RouteMapThumbnailInner({ route, mapId }: Props) {
  useEffect(() => {
    const container = document.getElementById(
      `thumb-map-${mapId}`
    );
    if (!container) return;

    const map = L.map(container, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      attributionControl: false,
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
        weight: 3,
        opacity: 0.8,
      }).addTo(map);
    }

    L.marker([route.start.lat, route.start.lng], { icon: defaultIcon })
      .addTo(map)
      .bindPopup(route.start.name);
    L.marker([route.end.lat, route.end.lng], { icon: defaultIcon })
      .addTo(map)
      .bindPopup(route.end.name);

    if (allPoints.length > 1) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      map.setView([route.start.lat, route.start.lng], 10);
    }

    return () => {
      map.remove();
    };
  }, [route, mapId]);

  return (
    <div
      id={`thumb-map-${mapId}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
