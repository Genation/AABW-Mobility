"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { DrivoDestination } from "../types";
import styles from "../drivo.module.css";

export interface StopItem {
  id: string;
  label: string;
  kind: "start" | "end" | "waypoint";
  destination?: DrivoDestination;
  distanceFromPrev?: string;
  /** True when distanceFromPrev came from the haversine fallback while the route is degraded. */
  degraded?: boolean;
}

interface Props {
  waypoints: StopItem[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  onAddBetween: (afterId: string) => void;
  onRemove: (id: string) => void;
}

const REMOVE_CONFIRM_MS = 2000;

export function TrackStopsList({ waypoints, activeId, onSelect, onAddBetween, onRemove }: Props) {
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  const handleRemoveTap = useCallback((id: string) => {
    if (pendingRemoveId === id) {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      setPendingRemoveId(null);
      onRemove(id);
      return;
    }
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setPendingRemoveId(id);
    confirmTimerRef.current = setTimeout(() => setPendingRemoveId(null), REMOVE_CONFIRM_MS);
  }, [pendingRemoveId, onRemove]);

  return (
    <div className={styles.stopList}>
      {waypoints.map((wp, i) => (
        <div key={wp.id}>
          {i > 0 && (
            <button
              type="button"
              className={styles.stopAddBetweenBtn}
              onClick={() => onAddBetween(waypoints[i - 1].id)}
            >
              <Plus size={14} /> Thêm điểm dừng
            </button>
          )}
          <div
            data-stop-id={wp.id}
            role="button"
            tabIndex={0}
            className={[
              styles.stopRow,
              activeId === wp.id ? styles.stopRowActive : "",
              wp.kind === "start" ? styles.stopRowStart : "",
              wp.kind === "end" ? styles.stopRowEnd : "",
            ].filter(Boolean).join(" ")}
            onClick={() => onSelect(wp.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(wp.id);
            }}
          >
            <div className={styles.stopRowIcon}>
              {wp.kind === "start" ? "A" : wp.kind === "end" ? "B" : i}
            </div>
            <div className={styles.stopRowBody}>
              <div className={styles.stopRowName}>{wp.label}</div>
              {wp.distanceFromPrev && (
                <div className={styles.stopRowDist}>
                  {wp.distanceFromPrev}
                  {wp.degraded ? " (ước tính)" : ""}
                </div>
              )}
            </div>
            {wp.kind === "waypoint" && (
              <button
                type="button"
                className={[
                  styles.stopRowRemoveBtn,
                  pendingRemoveId === wp.id ? styles.stopRowRemovePending : "",
                ].filter(Boolean).join(" ")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTap(wp.id);
                }}
              >
                {pendingRemoveId === wp.id ? "Chắc chắn xoá?" : <X size={14} />}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
