import { Heart, MessageCircle, Share2 } from "lucide-react";
import type { PostTripPost } from "../types";
import styles from "../post-trip.module.css";

interface Props {
  post: PostTripPost;
  onToggleLike: () => void;
  isLiked: boolean;
}

export function SocialBar({ post, onToggleLike, isLiked }: Props) {
  return (
    <div className={styles.socialBar}>
      <button
        className={[
          styles.socialAction,
          isLiked ? styles.socialActionLiked : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike();
        }}
        type="button"
        aria-label={isLiked ? "Bỏ thích" : "Thích"}
        aria-pressed={isLiked}
      >
        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        <span className={styles.socialCount}>
          {post.socialCounts.likes + (isLiked ? 1 : 0)}
        </span>
      </button>
      <button
        className={styles.socialAction}
        type="button"
        aria-label="Bình luận"
      >
        <MessageCircle size={18} />
        <span className={styles.socialCount}>
          {post.socialCounts.comments}
        </span>
      </button>
      <button
        className={styles.socialAction}
        type="button"
        aria-label="Chia sẻ"
      >
        <Share2 size={18} />
        <span className={styles.socialCount}>
          {post.socialCounts.shares}
        </span>
      </button>
    </div>
  );
}
