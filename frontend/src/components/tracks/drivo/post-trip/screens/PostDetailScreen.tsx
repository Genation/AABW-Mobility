"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { PostTripPost } from "../types";
import { PostMap } from "../components/PostMap";

import { TripStatsPanel } from "../components/TripStatsPanel";
import { TimelineStopList } from "../components/TimelineStopList";
import { PhotoGallery } from "../components/PhotoGallery";
import { PhotoLightbox } from "../components/PhotoLightbox";
import { TagRow } from "../components/TagRow";
import { SocialBar } from "../components/SocialBar";
import styles from "../post-trip.module.css";

interface Props {
  post: PostTripPost;
  onBack: () => void;
}

export function PostDetailScreen({ post, onBack }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className={styles.detailContainer}>
      <div
        className={styles.backButton}
        onClick={onBack}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") onBack();
        }}
      >
        <ChevronLeft size={20} />
        Khám phá
      </div>

      <PostMap route={post.route} mapId={post.id} />

      <div className={styles.detailAuthor}>
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className={styles.detailAuthorAvatar}
        />
        <div className={styles.authorInfo}>
          <div className={styles.authorName}>{post.author.name}</div>
          <div className={styles.authorMeta}>
            <span className={styles.authorVehicle}>{post.author.vehicle}</span>
          </div>
        </div>
      </div>

      <div className={styles.detailTitle}>{post.title}</div>
      <div className={styles.detailDate}>Ngày đi: {post.tripDate}</div>

      <div className={styles.detailBody}>
        <TripStatsPanel stats={post.stats} />

        <div className={styles.detailDescription}>{post.description}</div>

        <div className={styles.sectionTitle}>Hành trình</div>
        <TimelineStopList stops={post.stops} />

        <div className={styles.sectionTitle}>Hình ảnh</div>
        <PhotoGallery
          photos={post.photos}
          onPhotoClick={(index) => setLightboxIndex(index)}
        />

        <TagRow tags={post.tags} />
        <SocialBar
          post={post}
          onToggleLike={() => setIsLiked((v) => !v)}
          isLiked={isLiked}
        />
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={post.photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
