import type { PostTripPost } from "../types";
import { AuthorHeader } from "./AuthorHeader";
import { RouteMapThumbnail } from "./RouteMapThumbnail";
import { TripStatsBar } from "./TripStatsBar";
import { TagRow } from "./TagRow";
import { SocialBar } from "./SocialBar";
import styles from "../post-trip.module.css";

interface Props {
  post: PostTripPost;
  onClick: () => void;
  onToggleLike: () => void;
  isLiked: boolean;
}

export function PostCard({ post, onClick, onToggleLike, isLiked }: Props) {
  return (
    <div
      className={`${styles.postCard} ${styles.fadeInUp}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      <AuthorHeader author={post.author} publishedAt={post.publishedAt} />
      <RouteMapThumbnail route={post.route} mapId={post.id} />
      <div className={styles.postCardBody}>
        <div className={styles.postCardTitle}>{post.title}</div>
        <div className={styles.postCardDesc}>{post.description}</div>
        <TripStatsBar stats={post.stats} />
        <TagRow tags={post.tags} />
        <SocialBar post={post} onToggleLike={onToggleLike} isLiked={isLiked} />
      </div>
    </div>
  );
}
