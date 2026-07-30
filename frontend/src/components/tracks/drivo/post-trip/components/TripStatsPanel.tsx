import { MapPin, Clock, Gauge, Fuel } from "lucide-react";
import type { PostTripStats } from "../types";
import styles from "../post-trip.module.css";

interface Props {
  stats: PostTripStats;
}

export function TripStatsPanel({ stats }: Props) {
  return (
    <div className={styles.statsPanel}>
      <div className={styles.statsPanelItem}>
        <MapPin className={styles.statsPanelIcon} />
        <span className={styles.statsPanelValue}>{stats.totalKm} km</span>
        <span className={styles.statsPanelLabel}>Tổng quãng đường</span>
      </div>
      <div className={styles.statsPanelItem}>
        <Clock className={styles.statsPanelIcon} />
        <span className={styles.statsPanelValue}>{stats.movingTime}</span>
        <span className={styles.statsPanelLabel}>Thời gian di chuyển</span>
      </div>
      <div className={styles.statsPanelItem}>
        <Gauge className={styles.statsPanelIcon} />
        <span className={styles.statsPanelValue}>{stats.avgSpeed} km/h</span>
        <span className={styles.statsPanelLabel}>Tốc độ trung bình</span>
      </div>
      <div className={styles.statsPanelItem}>
        <Fuel className={styles.statsPanelIcon} />
        <span className={styles.statsPanelValue}>{stats.fuelUsed}L</span>
        <span className={styles.statsPanelLabel}>Nhiên liệu</span>
      </div>
    </div>
  );
}
