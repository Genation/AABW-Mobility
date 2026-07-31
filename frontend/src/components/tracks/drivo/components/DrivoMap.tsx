"use client";

import dynamic from "next/dynamic";
import { RouteInfo } from "@/lib/osrm";
import { DrivoDestination } from "../types";
import styles from "../drivo.module.css";

const DrivoMapInner = dynamic(
  () => import("./DrivoMapInner").then((m) => m.DrivoMapInner),
  {
    ssr: false,
    loading: () => (
      <div className={styles.mapLoading}>
        Đang tải bản đồ Drivo…
      </div>
    ),
  },
);

interface Props {
  origin: DrivoDestination | null;
  destination: DrivoDestination | null;
  waypoints: DrivoDestination[];
  route: Pick<RouteInfo, "coordinates" | "distanceMeters" | "durationSeconds"> | null;
  interactive?: boolean;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  onMarkerDrag?: (id: string, lat: number, lng: number) => void;
  selectedMarkerId?: string | null;
  crosshairLatLng?: { lat: number; lng: number } | null;
}

export function DrivoMap(props: Props) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <DrivoMapInner {...props} />
    </div>
  );
}
