import { Activity, Clock, Layers } from "lucide-react";
import { TRACKS } from "@/lib/constants";
import styles from "./stats-bar.module.css";

/**
 * Stats bar — Total, Active, Coming Soon counts.
 */
export function StatsBar() {
  const total = TRACKS.length;
  const active = TRACKS.filter((t) => t.status === "active").length;
  const comingSoon = total - active;

  return (
    <div className={styles.bar}>
      <div className={styles.stat}>
        <div className={`${styles.iconWrap} ${styles.iconTotal}`}>
          <Layers size={16} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{total}</span>
          <span className={styles.statLabel}>Total Tracks</span>
        </div>
      </div>
      <div className={styles.stat}>
        <div className={`${styles.iconWrap} ${styles.iconActive}`}>
          <Activity size={16} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{active}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
      </div>
      <div className={styles.stat}>
        <div className={`${styles.iconWrap} ${styles.iconSoon}`}>
          <Clock size={16} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{comingSoon}</span>
          <span className={styles.statLabel}>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
