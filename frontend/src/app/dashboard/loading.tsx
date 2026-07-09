import styles from "./loading.module.css";

/**
 * Dashboard loading state — skeleton screen for track cards.
 */
export default function DashboardLoading() {
  return (
    <div className={styles.container}>
      {/* Heading skeleton */}
      <div className={styles.headingSkeleton}>
        <div className={styles.titleBar} />
        <div className={styles.subtitleBar} />
      </div>

      {/* Stats skeleton */}
      <div className={styles.statsRow}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.statCard} />
        ))}
      </div>

      {/* Card grid skeleton */}
      <div className={styles.grid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardAccent} />
            <div className={styles.cardBody}>
              <div className={styles.cardIcon} />
              <div className={styles.cardTitle} />
              <div className={styles.cardDesc} />
              <div className={styles.cardBadge} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
