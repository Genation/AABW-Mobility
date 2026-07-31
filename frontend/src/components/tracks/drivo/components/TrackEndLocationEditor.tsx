"use client";

import { SmartLocationInput } from "./SmartLocationInput";
import { DrivoDestination } from "../types";
import styles from "../drivo.module.css";

interface Props {
  currentName: string;
  hasNextTrack: boolean;
  onSelect: (dest: DrivoDestination) => void;
  onCancel: () => void;
}

export function TrackEndLocationEditor({ currentName, hasNextTrack, onSelect, onCancel }: Props) {
  return (
    <div className={styles.trackEndEditBox}>
      <div className={styles.selectedLocation}>
        <span className={styles.selectedLocationName}>{currentName}</span>
        <button type="button" onClick={onCancel} className={styles.changeBtn}>Huỷ</button>
      </div>
      <SmartLocationInput placeholder="Chọn điểm cuối mới cho chặng..." onSelect={onSelect} />
      {hasNextTrack && (
        <div className={styles.trackEndEditHint}>
          Điểm bắt đầu chặng kế tiếp sẽ tự cập nhật theo điểm cuối mới.
        </div>
      )}
    </div>
  );
}
