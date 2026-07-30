import type { TripStop } from "../types";
import styles from "../post-trip.module.css";

interface Props {
  stops: TripStop[];
}

export function TimelineStopList({ stops }: Props) {
  return (
    <div className={styles.timelineList}>
      {stops.map((stop) => (
        <div key={stop.id} className={styles.timelineItem}>
          <div className={styles.timelineDot} />
          <div className={styles.timelineContent}>
            <div className={styles.timelineStopName}>{stop.name}</div>
            <div className={styles.timelineStopTime}>
              Đến: {stop.arrivedAt} &middot; Ở lại: {stop.duration}
            </div>
            {stop.note && (
              <div className={styles.timelineStopNote}>{stop.note}</div>
            )}
            {stop.photo && (
              <img
                src={stop.photo}
                alt={stop.name}
                className={styles.timelineStopPhoto}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
