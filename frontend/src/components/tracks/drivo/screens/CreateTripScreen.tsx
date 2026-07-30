"use client";

import { useState } from "react";
import Image from "next/image";
import { SmartLocationInput } from "../components/SmartLocationInput";
import { DrivoDestination } from "../types";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import styles from "../drivo.module.css";

interface Props {
  onPlanTrip: (start: DrivoDestination, end: DrivoDestination, time: Date) => void;
  initialStart?: DrivoDestination | null;
  initialEnd?: DrivoDestination | null;
}

export function CreateTripScreen({ onPlanTrip, initialStart = null, initialEnd = null }: Props) {
  const [start, setStart] = useState<DrivoDestination | null>(initialStart);
  const [end, setEnd] = useState<DrivoDestination | null>(initialEnd);

  return (
    <div className={styles.createScreen}>
      <div className={styles.createHeader}>
        <Image
          src="/DrivoLogo.png"
          alt="Drivo"
          width={160}
          height={54}
          priority
          style={{ margin: "0 auto", marginBottom: '12px', display: "block" }}
        />
        <p className={styles.createTagline}>Plan the drive. Live the story.</p>
      </div>

      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>Tạo chuyến đi mới</h2>

        <div className={styles.formFields}>
          <div>
            <label className={styles.fieldLabel}>
              <MapPin size={14} color="var(--color-primary)" /> Điểm xuất phát
            </label>
            {start ? (
              <div className={styles.selectedLocation}>
                <span className={styles.selectedLocationName}>{start.name}</span>
                <button onClick={() => setStart(null)} className={styles.changeBtn}>Đổi</button>
              </div>
            ) : (
              <SmartLocationInput placeholder="Nhập điểm bắt đầu..." onSelect={setStart} />
            )}
          </div>

          <div>
            <label className={styles.fieldLabel}>
              <MapPin size={14} color="var(--color-error)" /> Điểm đến
            </label>
            {end ? (
              <div className={styles.selectedLocation}>
                <span className={styles.selectedLocationName}>{end.name}</span>
                <button onClick={() => setEnd(null)} className={styles.changeBtn}>Đổi</button>
              </div>
            ) : (
              <SmartLocationInput placeholder="Nhập điểm kết thúc..." onSelect={setEnd} />
            )}
          </div>

          <div>
            <label className={styles.fieldLabel}>
              <Calendar size={14} color="var(--color-success)" /> Thời gian bắt đầu
            </label>
            <input
              type="datetime-local"
              defaultValue={new Date().toISOString().slice(0, 16)}
              className={styles.dateInput}
            />
          </div>
        </div>

        <button
          disabled={!start || !end}
          onClick={() => {
            if (start && end) {
              onPlanTrip(start, end, new Date());
            }
          }}
          className={`${styles.submitBtn} ${start && end ? styles.submitBtnActive : styles.submitBtnDisabled}`}
        >
          Bắt đầu lên kế hoạch
          <ArrowRight size={18} />
        </button>
      </div>

      <div className={styles.footerMeta}>
        MVP Concept • Drivo Team
      </div>
    </div>
  );
}
