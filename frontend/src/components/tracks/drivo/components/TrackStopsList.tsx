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
  globalIndex?: number;
  /** True only for the very first and very last point of the entire trip. */
  isTripEndpoint?: boolean;
  /** "Dự kiến đến: HH:mm" or "+X từ lúc khởi hành", set only when a route is available. */
  etaText?: string;
}

interface Props {
  waypoints: StopItem[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  onAddBetween?: (afterId: string) => void;
  onRemove?: (id: string) => void;
  /** No add-between / remove affordances — used for the itinerary accordion preview. */
  readOnly?: boolean;
  /** Tighter row spacing — used for the itinerary accordion preview. */
  compact?: boolean;
}

const REMOVE_CONFIRM_MS = 2000;

export function TrackStopsList({ waypoints, activeId, onSelect, onAddBetween, onRemove, readOnly, compact }: Props) {
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
      onRemove?.(id);
      return;
    }
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setPendingRemoveId(id);
    confirmTimerRef.current = setTimeout(() => setPendingRemoveId(null), REMOVE_CONFIRM_MS);
  }, [pendingRemoveId, onRemove]);

  const showAddBetween = !readOnly && !!onAddBetween;
  const showRemove = !readOnly && !!onRemove;

  return (
    <div className={[styles.stopList, compact ? styles.stopListCompact : ""].filter(Boolean).join(" ")}>
      <div className={styles.stopTimelineLine} />
      {waypoints.map((wp, i) => (
        <div key={wp.id} className={styles.stopItemWrap}>
          {i > 0 && showAddBetween && (
            <button
              type="button"
              className={styles.stopAddBetweenBtn}
              onClick={() => onAddBetween?.(waypoints[i - 1].id)}
            >
              <Plus size={14} /> Thêm điểm dừng
            </button>
          )}
          <div
            data-stop-id={wp.id}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            className={[
              styles.stopRow,
              !onSelect ? styles.stopRowStatic : "",
              activeId === wp.id ? styles.stopRowActive : "",
              wp.isTripEndpoint ? styles.stopRowTripEndpoint : "",
            ].filter(Boolean).join(" ")}
            onClick={onSelect ? () => onSelect(wp.id) : undefined}
            onKeyDown={onSelect ? (e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(wp.id);
            } : undefined}
          >
            <div className={styles.stopRowIcon}>
              {wp.globalIndex ?? i}
            </div>
            <div className={styles.stopRowBody}>
              <div className={styles.stopRowName}>{wp.label}</div>
              {wp.distanceFromPrev && (
                <div className={styles.stopRowDist}>
                  {wp.distanceFromPrev}
                  {wp.degraded ? " (ước tính)" : ""}
                </div>
              )}
              {wp.etaText && <div className={styles.stopRowEta}>{wp.etaText}</div>}
            </div>
            {wp.kind === "waypoint" && showRemove && (
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
