"use client";

import { useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { DrivoDestination } from "../types";
import styles from "../drivo.module.css";

export interface TimelineWaypoint {
  id: string;
  label: string;
  kind: "start" | "end" | "waypoint";
  destination?: DrivoDestination;
  distanceFromPrev?: string;
  timeFromPrev?: string;
}

interface Props {
  waypoints: TimelineWaypoint[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  onAddBetween: (afterId: string) => void;
  onRemove?: (id: string) => void;
}

export function HorizontalTimeline({
  waypoints,
  activeId,
  onSelect,
  onAddBetween,
  onRemove,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-wp-id="${activeId}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <div className={styles.timelineStrip} ref={scrollRef}>
      {waypoints.map((wp, i) => (
        <div key={wp.id} className={styles.timelineGroup}>
          {i > 0 && (
            <button
              className={styles.timelineAddBtn}
              onClick={() => onAddBetween(waypoints[i - 1].id)}
              title="Thêm điểm dừng"
            >
              <Plus size={14} />
            </button>
          )}
          <div
            data-wp-id={wp.id}
            role="button"
            tabIndex={0}
            className={`${styles.timelineCard} ${activeId === wp.id ? styles.timelineCardActive : ""} ${wp.kind === "start" ? styles.timelineCardStart : ""} ${wp.kind === "end" ? styles.timelineCardEnd : ""}`}
            onClick={() => onSelect(wp.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(wp.id);
            }}
          >
            <div className={styles.timelineCardIcon}>
              {wp.kind === "start" ? "A" : wp.kind === "end" ? "B" : i}
            </div>
            <div className={styles.timelineCardContent}>
              <div className={styles.timelineCardName}>{wp.label}</div>
              {wp.distanceFromPrev && (
                <div className={styles.timelineCardDist}>
                  {wp.distanceFromPrev}
                  {wp.timeFromPrev ? ` · ${wp.timeFromPrev}` : ""}
                </div>
              )}
            </div>
            {onRemove && wp.kind === "waypoint" && (
              <button
                className={styles.timelineRemoveBtn}
                onClick={(e) => { e.stopPropagation(); onRemove(wp.id); }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
