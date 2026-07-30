"use client";

import { useMemo } from "react";
import { TripPlan, DrivoTrack } from "../types";
import { haversineMeters, sliceRouteRange, RouteInfo } from "@/lib/osrm";
import { getTrackPointRanges, buildOrderedTripPointsKey, getEffectiveTrackStart, getEffectiveTrackEnd } from "../track-chain-utils";
import { TRACK_COLORS } from "../track-colors";
import { Plus, Navigation, Clock, ArrowLeft, GripVertical, Trash2, PlusCircle } from "lucide-react";
import styles from "../drivo.module.css";

function formatDate(d: Date | null): string {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return "Chưa định";
  return d.toLocaleDateString("vi-VN");
}

function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(0)}km` : `${m.toFixed(0)}m`;
}

interface Props {
  plan: TripPlan;
  onAddTrack: () => void;
  onEditTrack: (track: DrivoTrack) => void;
  onCancelTrip: () => void;
  activeTrackId?: string | null;
  onSelectTrack?: (id: string) => void;
  onDeleteTrack?: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  route: RouteInfo | null;
  routeCoordinateKey: string | null;
  routeDegraded: boolean;
}

export function TripItineraryScreen({
  plan,
  onAddTrack,
  onEditTrack,
  onCancelTrip,
  activeTrackId,
  onDeleteTrack,
  onReorder,
  route,
  routeCoordinateKey,
  routeDegraded,
}: Props) {
  const trackPointRanges = useMemo(() => getTrackPointRanges(plan), [plan]);
  const currentCoordinateKey = useMemo(() => buildOrderedTripPointsKey(plan), [plan]);
  const isRouteFresh = route != null && routeCoordinateKey === currentCoordinateKey;

  const totalDistance = useMemo(() => {
    if (isRouteFresh && route) return route.distanceMeters;
    let total = 0;
    for (let i = 0; i < plan.tracks.length; i++) {
      const start = getEffectiveTrackStart(plan, i);
      const end = getEffectiveTrackEnd(plan, i);
      if (start?.lat != null && start?.lng != null && end?.lat != null && end?.lng != null) {
        total += haversineMeters(start.lat, start.lng, end.lat, end.lng);
      }
    }
    return total;
  }, [isRouteFresh, route, plan]);
  const totalDistanceDegraded = !isRouteFresh && routeDegraded && totalDistance > 0;

  return (
    <div className={styles.itinerarySheet}>
      <div className={styles.itineraryHeader}>
        <button onClick={onCancelTrip} className={styles.itineraryBackBtn}>
          <ArrowLeft size={18} />
        </button>
        <div className={styles.itineraryHeaderInfo}>
          <h2 className={styles.itineraryTitle}>
            {plan.startLocation?.name ?? "?"} → {plan.endLocation?.name ?? "?"}
          </h2>
          <div className={styles.itineraryMeta}>
            <span><Navigation size={12} /> {plan.tracks.length} chặng</span>
            <span><Clock size={12} /> {formatDate(plan.startTime)}</span>
            {totalDistance > 0 && (
              <span>{formatDistance(totalDistance)}{totalDistanceDegraded ? " (ước tính)" : ""}</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.itineraryTrackList}>
        {plan.tracks.length === 0 && !plan.startLocation && !plan.endLocation ? (
          <div className={styles.itineraryEmpty}>
            <p>Chưa có chuyến đi nào</p>
            <p className={styles.itineraryEmptyHint}>Tạo chuyến đi mới để bắt đầu</p>
            <button onClick={onCancelTrip} className={styles.itineraryNewTripBtn}>
              <PlusCircle size={18} /> Tạo chuyến đi mới
            </button>
          </div>
        ) : plan.tracks.length === 0 ? (
          <div className={styles.itineraryEmpty}>
            <p>Chưa có chặng nào</p>
            <p className={styles.itineraryEmptyHint}>Chia nhỏ hành trình thành các chặng để dễ quản lý</p>
          </div>
        ) : (
          plan.tracks.map((track, i) => {
            const start = getEffectiveTrackStart(plan, i);
            const end = getEffectiveTrackEnd(plan, i);
            let distStr = "";
            let distDegraded = false;
            const range = trackPointRanges[i];
            if (isRouteFresh && route && range) {
              const m = sliceRouteRange(route, range.startIndex, range.endIndex).distanceMeters;
              distStr = formatDistance(m);
            } else if (start?.lat && start?.lng && end?.lat && end?.lng) {
              const m = haversineMeters(start.lat, start.lng, end.lat, end.lng);
              distStr = formatDistance(m);
              distDegraded = routeDegraded;
            }

            const color = TRACK_COLORS[i % TRACK_COLORS.length];

            return (
              <div
                key={track.id}
                className={`${styles.itineraryTrackCard} ${activeTrackId === track.id ? styles.itineraryTrackCardActive : ""}`}
                onClick={() => onEditTrack(track)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(i));
                  e.currentTarget.classList.add(styles.itineraryTrackDragging);
                }}
                onDragEnd={(e) => {
                  e.currentTarget.classList.remove(styles.itineraryTrackDragging);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add(styles.itineraryTrackDragOver);
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove(styles.itineraryTrackDragOver);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(styles.itineraryTrackDragOver);
                  const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                  if (!isNaN(fromIdx) && fromIdx !== i) {
                    onReorder?.(fromIdx, i);
                  }
                }}
              >
                <div className={styles.itineraryTrackLeft}>
                  <div className={styles.itineraryTrackColor} style={{ background: color }} />
                  <GripVertical size={16} className={styles.itineraryTrackGrip} />
                </div>
                <div className={styles.itineraryTrackBody}>
                  <div className={styles.itineraryTrackName}>{track.name}</div>
                  <div className={styles.itineraryTrackRoute}>
                    {start?.name ?? "?"} → {end?.name ?? "?"}
                  </div>
                  <div className={styles.itineraryTrackMeta}>
                    {distStr && <span>{distStr}{distDegraded ? " (ước tính)" : ""}</span>}
                    <span>{track.destinations.length} điểm dừng</span>
                  </div>
                </div>
                <button
                  className={styles.itineraryTrackDelete}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTrack?.(track.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.itineraryActions}>
        <button onClick={onAddTrack} className={styles.itineraryAddBtn}>
          <Plus size={16} /> Thêm chặng
        </button>
      </div>
    </div>
  );
}
