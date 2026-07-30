"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PostTripRoute } from "../types";

function shortLabel(name: string): string {
  return name.length > 12 ? name.slice(0, 10) + "…" : name;
}

function createLabelIcon(color: string, label: string): L.DivIcon {
  return L.divIcon({
    className: "map-label-marker",
    html: `<div class="map-label-wrap">
      <div class="map-label-dot" style="background:${color}"></div>
      <span class="map-label-text">${shortLabel(label)}</span>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

interface Props {
  route: PostTripRoute;
  mapId: string;
}

export function PostMapInner({ route, mapId }: Props) {
  useEffect(() => {
    const container = document.getElementById(`detail-map-${mapId}`);
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
      ...route.waypoints.map((w) => [w.lat, w.lng] as [number, number]),
      [route.end.lat, route.end.lng],
    ];

    if (allPoints.length > 1) {
      L.polyline(allPoints, {
        color: "#1a73e8",
        weight: 4,
        opacity: 0.9,
      }).addTo(map);
    }

    L.marker([route.start.lat, route.start.lng], {
      icon: createLabelIcon("#22C55E", route.start.name),
    }).addTo(map);

    route.waypoints.forEach((w) => {
      L.marker([w.lat, w.lng], {
        icon: createLabelIcon("#3B82F6", w.name),
      }).addTo(map);
    });

    L.marker([route.end.lat, route.end.lng], {
      icon: createLabelIcon("#EF4444", route.end.name),
    }).addTo(map);

    if (allPoints.length > 1) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
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
