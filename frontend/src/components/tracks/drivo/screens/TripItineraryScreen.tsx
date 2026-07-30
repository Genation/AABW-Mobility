"use client";

import { TripPlan, DrivoTrack } from "../types";
import { Plus, Navigation, Clock, GripVertical, ArrowLeft } from "lucide-react";
import styles from "../drivo.module.css";

interface Props {
  plan: TripPlan;
  onAddTrack: () => void;
  onEditTrack: (track: DrivoTrack) => void;
  onCancelTrip: () => void;
}

export function TripItineraryScreen({ plan, onAddTrack, onEditTrack, onCancelTrip }: Props) {
  return (
    <div className={styles.bottomSheet}>
      <div className={styles.sheetHeader}>
        <div className={styles.sheetHandle} />

        <div className={styles.sheetTitleRow}>
          <button onClick={onCancelTrip} className={styles.backBtn} title="Quay lại">
            <ArrowLeft size={18} />
          </button>
          <div className={styles.sheetTitleGroup}>
            <h2 className={styles.sheetTitle}>
              {plan.startLocation?.name} → {plan.endLocation?.name}
            </h2>
            <div className={styles.sheetMeta}>
              <span className={styles.sheetMetaItem}>
                <Navigation size={12} /> {(plan.tracks.length > 0 ? plan.tracks.length : 0)} Track(s)
              </span>
              <span className={styles.sheetMetaItem}>
                <Clock size={12} /> {plan.startTime ? plan.startTime.toLocaleDateString() : "Chưa định"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sheetBody}>
        <div className={styles.trackList}>
          {plan.tracks.length === 0 ? (
            <div className={styles.emptyState}>
              Chưa có chặng nào. Hãy bắt đầu chia nhỏ chuyến đi của bạn.
            </div>
          ) : (
            plan.tracks.map((track, i) => (
              <div
                key={track.id}
                role="button"
                tabIndex={0}
                onClick={() => onEditTrack(track)}
                onKeyDown={(e) => e.key === "Enter" && onEditTrack(track)}
                className={styles.trackItem}
              >
                <div className={styles.trackItemGrip}>
                  <GripVertical size={16} />
                </div>
                <div className={styles.trackItemBody}>
                  <div className={styles.trackItemName}>Track {i + 1}: {track.name}</div>
                  <div className={styles.trackItemSub}>
                    {track.destinations.length} điểm dừng
                  </div>
                </div>
              </div>
            ))
          )}

          <button onClick={onAddTrack} className={styles.addTrackBtn}>
            <Plus size={16} /> Thêm chặng (Track)
          </button>
        </div>
      </div>
    </div>
  );
}
