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
import type { LatLng, RouteInfo } from "@/lib/osrm";
import type { PlaceCandidate } from "@/lib/api";
import { needStyle } from "./needs-style";
import type { FlatRecommendation } from "./types";

const CANDIDATE_COLOR = "#7C3AED"; // violet — P7 discovery pins

function letterIcon(letter: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;font-family:system-ui,sans-serif;">${letter}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

function recIcon(color: string, emoji: string, selected: boolean) {
  const size = selected ? 36 : 26;
  const ring = selected
    ? `0 0 0 4px ${color}66, 0 2px 6px rgba(0,0,0,0.35)`
    : "0 2px 6px rgba(0,0,0,0.3)";
  const check = selected
    ? `<div style="position:absolute;top:-6px;right:-6px;width:16px;height:16px;background:${color};border:2px solid #fff;border-radius:50%;color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;">✓</div>`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${size}px;height:${size}px;background:#fff;border:2px solid ${color};border-radius:50%;box-shadow:${ring};display:flex;align-items:center;justify-content:center;font-size:${selected ? 18 : 13}px;">${emoji}${check}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/** Numbered teardrop pin for a ranked P7 candidate. */
function candidateIcon(rank: number, active: boolean) {
  const size = active ? 34 : 28;
  const ring = active
    ? `0 0 0 4px ${CANDIDATE_COLOR}55, 0 3px 8px rgba(0,0,0,0.4)`
    : "0 2px 6px rgba(0,0,0,0.35)";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${CANDIDATE_COLOR};border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:${ring};display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#fff;font-weight:800;font-size:${active ? 14 : 12}px;font-family:system-ui,sans-serif;">${rank}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const originIcon = letterIcon("A", "#3B82F6");
const destIcon = letterIcon("B", "#EF4444");

interface Props {
  origin: LatLng;
  destination: LatLng | null;
  destinationName: string;
  baseRoute: RouteInfo | null;
  displayRoute: RouteInfo | null;
  markers: FlatRecommendation[];
  selectedIds: Set<string>;
  onToggle: (rec: FlatRecommendation) => void;
  /** Ranked P7 discovery candidates (violet numbered pins). */
  candidates: PlaceCandidate[];
  onPickCandidate: (c: PlaceCandidate) => void;
}

/** Keep only candidates with usable coordinates, preserving rank order. */
function withCoords(candidates: PlaceCandidate[]): (PlaceCandidate & { lat: number; lng: number })[] {
  const out: (PlaceCandidate & { lat: number; lng: number })[] = [];
  for (const c of candidates) {
    if (typeof c.lat === "number" && typeof c.lng === "number" &&
        Number.isFinite(c.lat) && Number.isFinite(c.lng)) {
      out.push(c as PlaceCandidate & { lat: number; lng: number });
    }
  }
  return out;
}

function toPositions(route: RouteInfo | null): [number, number][] {
  if (!route) return [];
  return route.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
}

/** Fit the map to everything relevant whenever the inputs change. */
function MapAutoFit({
  origin,
  destination,
  markers,
  candidates,
}: {
  origin: LatLng;
  destination: LatLng | null;
  markers: FlatRecommendation[];
  candidates: (PlaceCandidate & { lat: number; lng: number })[];
}) {
  const map = useMap();
  const key = useMemo(
    () =>
      `${origin.lat},${origin.lng}|${destination?.lat},${destination?.lng}|${markers
        .map((m) => m.poi_id)
        .join(",")}|${candidates.map((c) => c.poi_id).join(",")}`,
    [origin, destination, markers, candidates],
  );
  useEffect(() => {
    const points: [number, number][] = [[origin.lat, origin.lng]];
    if (destination) points.push([destination.lat, destination.lng]);
    for (const m of markers) points.push([m.lat, m.lng]);
    for (const c of candidates) points.push([c.lat, c.lng]);
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export function RouteMateMapInner({
  origin,
  destination,
  destinationName,
  baseRoute,
  displayRoute,
  markers,
  selectedIds,
  onToggle,
  candidates,
  onPickCandidate,
}: Props) {
  const basePositions = useMemo(() => toPositions(baseRoute), [baseRoute]);
  const displayPositions = useMemo(
    () => toPositions(displayRoute),
    [displayRoute],
  );
  const hasRedraw = displayPositions.length > 0;
  const mappableCandidates = useMemo(() => withCoords(candidates), [candidates]);

  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={12}
      style={{ width: "100%", height: "100%" }}
      zoomControl
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapAutoFit
        origin={origin}
        destination={destination}
        markers={markers}
        candidates={mappableCandidates}
      />

      {/* Base route (blue) — dimmed once a re-routed path is shown */}
      {basePositions.length > 0 && (
        <Polyline
          positions={basePositions}
          pathOptions={{
            color: "#3B82F6",
            weight: hasRedraw ? 4 : 5,
            opacity: hasRedraw ? 0.35 : 0.85,
          }}
        />
      )}

      {/* Re-routed path via the selected stop(s) (green, highlighted) */}
      {hasRedraw && (
        <Polyline
          positions={displayPositions}
          pathOptions={{ color: "#16A34A", weight: 6, opacity: 0.95, lineCap: "round" }}
        />
      )}

      <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
        <Popup>Điểm đi (A)</Popup>
      </Marker>

      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
          <Popup>{destinationName || "Điểm đến (B)"}</Popup>
        </Marker>
      )}

      {markers.map((rec) => {
        const style = needStyle(rec.need_key);
        const selected = selectedIds.has(rec.poi_id);
        return (
          <Marker
            key={rec.poi_id}
            position={[rec.lat, rec.lng]}
            icon={recIcon(style.color, style.emoji, selected)}
            eventHandlers={{ click: () => onToggle(rec) }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{rec.name}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                  {rec.category}
                  {rec.rating != null ? ` · ★${rec.rating}` : ""}
                </div>
                <div style={{ fontSize: 11, marginTop: 4, color: style.color }}>
                  cách điểm đi ~{Math.round(rec.progress_km ?? 0)} km · +{rec.detour_min} phút đi vòng
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(rec)}
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: `1px solid ${style.color}`,
                    background: selected ? style.color : "transparent",
                    color: selected ? "#fff" : style.color,
                    cursor: "pointer",
                  }}
                >
                  {selected ? "✓ Đã chọn" : "Chọn điểm dừng"}
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* P7 discovery candidates — numbered violet pins; click sets destination */}
      {mappableCandidates.map((c, i) => (
        <Marker
          key={`cand-${c.poi_id}-${i}`}
          position={[c.lat, c.lng]}
          icon={candidateIcon(i + 1, false)}
          eventHandlers={{ click: () => onPickCandidate(c) }}
        >
          <Popup>
            <div style={{ minWidth: 170 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                {i + 1}. {c.display_name || c.name}
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                {c.category}
                {c.district || c.city ? ` · ${c.district || c.city}` : ""}
                {c.rating != null ? ` · ★${c.rating}` : ""}
              </div>
              {c.reasons?.length > 0 && (
                <div style={{ fontSize: 11, marginTop: 4, color: CANDIDATE_COLOR }}>
                  {c.reasons.slice(0, 2).join(" · ")}
                </div>
              )}
              <button
                type="button"
                onClick={() => onPickCandidate(c)}
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: `1px solid ${CANDIDATE_COLOR}`,
                  background: CANDIDATE_COLOR,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Đặt làm điểm đến →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
