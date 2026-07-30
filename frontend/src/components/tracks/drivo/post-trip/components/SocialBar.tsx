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
      >
        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        <span className={styles.socialCount}>
          {post.socialCounts.likes + (isLiked ? 1 : 0)}
        </span>
      </button>
      <div className={styles.socialAction}>
        <MessageCircle size={18} />
        <span className={styles.socialCount}>
          {post.socialCounts.comments}
        </span>
      </div>
      <div className={styles.socialAction}>
        <Share2 size={18} />
        <span className={styles.socialCount}>
          {post.socialCounts.shares}
        </span>
      </div>
    </div>
  );
}
