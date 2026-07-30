"use client";

import { useMapEvents } from "react-leaflet";

interface Props {
  onTap: (latlng: { lat: number; lng: number }) => void;
  enabled: boolean;
}

export function MapTapHandler({ onTap, enabled }: Props) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onTap({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}
