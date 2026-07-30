"use client";

/* eslint-disable react-hooks/set-state-in-effect -- SSR-safe hydration: default start time depends on client clock, seeded only after mount */

import { useState, useEffect } from "react";
import Image from "next/image";
import { SmartLocationInput } from "../components/SmartLocationInput";
import { DrivoMap } from "../components/DrivoMap";
import { DrivoDestination } from "../types";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import styles from "../drivo.module.css";

const EMPTY_WAYPOINTS: DrivoDestination[] = [];

interface Props {
  onPlanTrip: (start: DrivoDestination, end: DrivoDestination, time: Date) => void;
  initialStart?: DrivoDestination | null;
  initialEnd?: DrivoDestination | null;
}

function getDefaultTime() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  return now;
}

export function CreateTripScreen({ onPlanTrip, initialStart = null, initialEnd = null }: Props) {
  const [start, setStart] = useState<DrivoDestination | null>(initialStart);
  const [end, setEnd] = useState<DrivoDestination | null>(initialEnd);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    setStartTime(getDefaultTime());
  }, []);

  return (
    <div className={styles.createScreen}>
      <div className={styles.createMapPreview}>
        <DrivoMap
          origin={start}
          destination={end}
          waypoints={EMPTY_WAYPOINTS}
          route={null}
        />
        {start && end && (
          <div className={styles.createMapOverlay}>
            <div className={styles.createRoutePreview}>
              <MapPin size={14} color="#3B82F6" /> {start.name}
              <ArrowRight size={14} />
              <MapPin size={14} color="#EF4444" /> {end.name}
            </div>
          </div>
        )}
      </div>

      <div className={styles.createForm}>
        <div className={styles.createHeader}>
          <Image
            src="/DrivoLogo.png"
            alt="Drivo"
            width={120}
            height={40}
            priority
          />
          <p className={styles.createTagline}>Plan the drive. Live the story.</p>
        </div>

        <div className={styles.formFields}>
          <div>
            <label className={styles.fieldLabel}>
              <MapPin size={14} color="#3B82F6" /> Điểm xuất phát
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
              <MapPin size={14} color="#EF4444" /> Điểm đến
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
              value={startTime ? startTime.toISOString().slice(0, 16) : ""}
              onChange={(e) => setStartTime(new Date(e.target.value))}
              className={styles.dateInput}
            />
          </div>
        </div>

        <button
          disabled={!start || !end}
          onClick={() => {
            if (start && end && startTime) onPlanTrip(start, end, startTime);
          }}
          className={`${styles.submitBtn} ${start && end ? styles.submitBtnActive : styles.submitBtnDisabled}`}
        >
          Lên kế hoạch
          <ArrowRight size={18} />
        </button>

        <div className={styles.footerMeta}>
          MVP Concept • Drivo Team
        </div>
      </div>
    </div>
  );
}
