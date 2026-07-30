"use client";

import { useMemo } from "react";
import { TripPlan, DrivoTrack } from "../types";
import { haversineMeters } from "@/lib/osrm";
import { Plus, Navigation, Clock, ArrowLeft, GripVertical, Trash2, PlusCircle } from "lucide-react";
import styles from "../drivo.module.css";

function formatDate(d: Date | null): string {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return "Chưa định";
  return d.toLocaleDateString("vi-VN");
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
}

const TRACK_COLORS = [
  "#FFC928", "#F97316", "#10B981", "#3B82F6", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F59E0B", "#6366F1",
];

export function TripItineraryScreen({
  plan,
  onAddTrack,
  onEditTrack,
  onCancelTrip,
  activeTrackId,
  onDeleteTrack,
  onReorder,
}: Props) {
  const totalDistance = useMemo(() => {
    let total = 0;
    for (let i = 0; i < plan.tracks.length; i++) {
      const t = plan.tracks[i];
      const start = t.startLocation ?? (i > 0 ? plan.tracks[i - 1].endLocation : plan.startLocation);
      const end = t.endLocation ?? (i < plan.tracks.length - 1 ? plan.tracks[i + 1].startLocation : plan.endLocation);
      if (start?.lat != null && start?.lng != null && end?.lat != null && end?.lng != null) {
        total += haversineMeters(start.lat, start.lng, end.lat, end.lng);
      }
    }
    return total;
  }, [plan.tracks, plan.startLocation, plan.endLocation]);

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
              <span>{totalDistance >= 1000 ? `${(totalDistance / 1000).toFixed(0)}km` : `${totalDistance.toFixed(0)}m`}</span>
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
            const start = track.startLocation ?? (i > 0 ? plan.tracks[i - 1].endLocation : plan.startLocation);
            const end = track.endLocation ?? (i < plan.tracks.length - 1 ? plan.tracks[i + 1].startLocation : plan.endLocation);
            let distStr = "";
            if (start?.lat && start?.lng && end?.lat && end?.lng) {
              const m = haversineMeters(start.lat, start.lng, end.lat, end.lng);
              distStr = m >= 1000 ? `${(m / 1000).toFixed(0)}km` : `${m.toFixed(0)}m`;
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
                    {distStr && <span>{distStr}</span>}
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
