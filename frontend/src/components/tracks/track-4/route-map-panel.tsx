"use client";

/**
 * Route Map Panel — shows driving route from user location to destination.
 * Google Maps-style "From → To" route card with distance/duration.
 * Uses dynamic import to avoid Leaflet SSR issues.
 */

import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Car,
  Clock,
  MapPin,
  Navigation,
  X,
} from "lucide-react";
import type { LatLng, RouteInfo } from "@/hooks/use-route-map";
import styles from "./route-map-panel.module.css";

/** Dynamic import of Leaflet map — no SSR */
const LeafletMapInner = dynamic(
  () =>
    import("./leaflet-map-inner").then((mod) => mod.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading map…</span>
      </div>
    ),
  },
);

interface RouteMapPanelProps {
  userLocation: LatLng;
  destination: LatLng;
  destinationName: string;
  route: RouteInfo | null;
  isLoadingRoute: boolean;
  routeError: string | null;
  geoPermission: "granted" | "denied" | "pending";
  onClose: () => void;
}

/** Format meters → human-readable distance */
function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Format seconds → human-readable duration */
function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} phút`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs} giờ ${remainMins} phút` : `${hrs} giờ`;
}

export function RouteMapPanel({
  userLocation,
  destination,
  destinationName,
  route,
  isLoadingRoute,
  routeError,
  geoPermission,
  onClose,
}: RouteMapPanelProps) {
  const originLabel =
    geoPermission === "granted" ? "Vị trí hiện tại của bạn" : "TP. Hồ Chí Minh (mặc định)";

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Navigation size={16} className={styles.headerIcon} />
          <span className={styles.headerTitle}>Chỉ đường</span>
        </div>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Đóng bản đồ"
          type="button"
        >
          <X size={16} />
        </button>
      </div>

      {/* Route card — From → To with vertical connector */}
      <div className={styles.routeCard}>
        {/* Origin row */}
        <div className={styles.routeRow}>
          <div className={styles.routeDotWrap}>
            <div className={styles.routeDotOrigin} />
            <div className={styles.routeLine} />
          </div>
          <div className={styles.routeLabel}>
            <span className={styles.routeType}>Điểm đi</span>
            <span className={styles.routeName}>{originLabel}</span>
          </div>
        </div>

        {/* Destination row */}
        <div className={styles.routeRow}>
          <div className={styles.routeDotWrap}>
            <div className={styles.routeDotDest} />
          </div>
          <div className={styles.routeLabel}>
            <span className={styles.routeType}>Điểm đến</span>
            <span className={styles.routeNameDest}>{destinationName}</span>
          </div>
        </div>
      </div>

      {/* Route stats — distance & duration */}
      {route && !isLoadingRoute && (
        <div className={styles.routeStatsBar}>
          <div className={styles.statPill}>
            <Car size={14} className={styles.statPillIcon} />
            <span className={styles.statPillValue}>
              {formatDistance(route.distanceMeters)}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statPill}>
            <Clock size={14} className={styles.statPillIcon} />
            <span className={styles.statPillValue}>
              {formatDuration(route.durationSeconds)}
            </span>
          </div>
        </div>
      )}
      {isLoadingRoute && (
        <div className={styles.routeStatsBar}>
          <div className={styles.statPill}>
            <div className={styles.miniSpinner} />
            <span className={styles.statPillValue}>Đang tính đường đi…</span>
          </div>
        </div>
      )}

      {/* Map */}
      <div className={styles.mapWrap}>
        <LeafletMapInner
          userLocation={userLocation}
          destination={destination}
          destinationName={destinationName}
          route={route}
        />
      </div>

      {/* Route error warning */}
      {routeError && (
        <div className={styles.error}>
          <AlertTriangle size={12} />
          <span>{routeError}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Empty state panel — shown when no destination is selected.
 */
export function RouteMapEmpty() {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Navigation size={16} className={styles.headerIcon} />
          <span className={styles.headerTitle}>Bản đồ</span>
        </div>
      </div>
      <div className={styles.empty}>
        <MapPin size={32} className={styles.emptyIcon} />
        <span className={styles.emptyTitle}>Chưa chọn điểm đến</span>
        <span className={styles.emptyDesc}>
          Tìm kiếm và chọn một địa điểm để xem đường đi trên bản đồ
        </span>
      </div>
    </div>
  );
}
