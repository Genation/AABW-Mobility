import { MapPin, Clock, Gauge, Flag } from "lucide-react";
import type { PostTripStats } from "../types";
import styles from "../post-trip.module.css";

interface Props {
  stats: PostTripStats;
}

export function TripStatsBar({ stats }: Props) {
  return (
    <div className={styles.statsBar}>
      <div className={styles.statItem}>
        <MapPin className={styles.statIcon} />
        <span className={styles.statValue}>{stats.totalKm} km</span>
        <span className={styles.statLabel}>Tổng</span>
      </div>
      <div className={styles.statItem}>
        <Clock className={styles.statIcon} />
        <span className={styles.statValue}>{stats.movingTime}</span>
        <span className={styles.statLabel}>Thời gian</span>
      </div>
      <div className={styles.statItem}>
        <Gauge className={styles.statIcon} />
        <span className={styles.statValue}>{stats.avgSpeed} km/h</span>
        <span className={styles.statLabel}>Tốc độ</span>
      </div>
      <div className={styles.statItem}>
        <Flag className={styles.statIcon} />
        <span className={styles.statValue}>{stats.totalStops}</span>
        <span className={styles.statLabel}>Điểm dừng</span>
      </div>
    </div>
  );
}
