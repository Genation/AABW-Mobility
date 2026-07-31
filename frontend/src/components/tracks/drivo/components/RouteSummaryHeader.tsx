"use client";

import { ReactNode } from "react";
import { ArrowLeft, MapPin, Flag } from "lucide-react";
import styles from "../drivo.module.css";

interface Props {
  onBack?: () => void;
  startName: string;
  endName: string;
  meta?: ReactNode;
  rightSlot?: ReactNode;
  variant?: "panel" | "overlay";
}

export function RouteSummaryHeader({ onBack, startName, endName, meta, rightSlot, variant = "panel" }: Props) {
  const rootClassName = variant === "overlay"
    ? `${styles.routeSummaryHeader} ${styles.routeSummaryHeaderOverlay}`
    : styles.routeSummaryHeader;
  return (
    <div className={rootClassName}>
      {onBack && (
        <button onClick={onBack} className={styles.routeSummaryHeaderBackBtn} aria-label="Quay lại">
          <ArrowLeft size={18} />
        </button>
      )}
      <div className={styles.routeSummaryHeaderInfo}>
        <div className={styles.routeSummaryHeaderLine} title={startName}>
          <MapPin size={12} className={styles.routeSummaryHeaderIconStart} />
          <span className={styles.routeSummaryHeaderText}>{startName}</span>
        </div>
        <div className={styles.routeSummaryHeaderLine} title={endName}>
          <Flag size={12} className={styles.routeSummaryHeaderIconEnd} />
          <span className={styles.routeSummaryHeaderText}>{endName}</span>
        </div>
        {meta && <div className={styles.routeSummaryHeaderMeta}>{meta}</div>}
      </div>
      {rightSlot && <div className={styles.routeSummaryHeaderRight}>{rightSlot}</div>}
    </div>
  );
}
