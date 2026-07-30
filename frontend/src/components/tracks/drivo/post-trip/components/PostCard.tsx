import type { PostTripPost } from "../types";
import { Heart } from "lucide-react";
import styles from "../post-trip.module.css";

interface Props {
  post: PostTripPost;
  index: number;
  onClick: () => void;
}

export function PostCard({ post, index, onClick }: Props) {
  return (
    <div
      className={`${styles.postCard} ${styles.fadeInUp}`}
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      <img
        src={post.coverPhoto}
        alt={post.title}
        className={styles.postCardCover}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className={styles.postCardBody}>
        <div className={styles.postCardTitle}>{post.title}</div>
        <div className={styles.postCardDesc}>
          {post.stats.totalKm} km &middot; {post.stats.movingTime}
        </div>
      </div>
      <div className={styles.postCardFooter}>
        <div className={styles.postCardAuthor}>
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className={styles.postCardAvatar}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className={styles.postCardAuthorName}>
            {post.author.name}
          </span>
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
          <Heart size={12} />
          {post.socialCounts.likes}
        </span>
      </div>
    </div>
  );
}
