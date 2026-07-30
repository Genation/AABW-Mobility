import type { PostTripAuthor } from "../types";
import { Car, Clock } from "lucide-react";
import styles from "../post-trip.module.css";

interface Props {
  author: PostTripAuthor;
  publishedAt: string;
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays < 1) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
}

export function AuthorHeader({ author, publishedAt }: Props) {
  return (
    <div className={styles.authorHeader}>
      <img
        src={author.avatar}
        alt={author.name}
        className={styles.authorAvatar}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className={styles.authorInfo}>
        <div className={styles.authorName}>{author.name}</div>
        <div className={styles.authorMeta}>
          <span className={styles.authorVehicle}>
            <Car size={12} />
            {author.vehicle}
          </span>
          <span className={styles.authorTime}>
            <Clock size={12} /> {getRelativeTime(publishedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
