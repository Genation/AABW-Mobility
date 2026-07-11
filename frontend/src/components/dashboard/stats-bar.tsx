import { Activity, Clock, Layers } from "lucide-react";
import { ACTIVE_TRACKS } from "@/lib/constants";
import styles from "./stats-bar.module.css";

/**
 * Stats bar — Total, Active, Coming Soon counts for the live services.
 */
export function StatsBar() {
  const total = ACTIVE_TRACKS.length;
  const active = ACTIVE_TRACKS.filter((t) => t.status === "active").length;
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
