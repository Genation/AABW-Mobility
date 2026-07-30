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
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onBack();
          }
        }}
        aria-label="Quay lại khám phá"
      >
        <ChevronLeft size={20} />
        Khám phá
      </div>

      <img
        src={post.coverPhoto}
        alt={post.title}
        className={styles.detailCover}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />

      <div className={styles.detailAuthor}>
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className={styles.detailAuthorAvatar}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className={styles.authorInfo}>
          <div className={styles.authorName}>{post.author.name}</div>
          <div className={styles.authorMeta}>
            <span className={styles.authorVehicle}>{post.author.vehicle}</span>
            <span className={styles.authorTime}>Ngày đi: {post.tripDate}</span>
          </div>
        </div>
      </div>

      <div className={styles.detailTitle}>{post.title}</div>

      <div className={styles.detailBody}>
        <TripStatsPanel stats={post.stats} />

        <TagRow tags={post.tags} interactive={false} />

        <div className={styles.detailDescription}>{post.description}</div>

        <PostMap route={post.route} mapId={post.id} />

        <div className={styles.sectionTitle}>Hành trình</div>
        <TimelineStopList stops={post.stops} />

        <div className={styles.sectionTitle}>Hình ảnh</div>
        <PhotoGallery
          photos={post.photos}
          onPhotoClick={(index) => setLightboxIndex(index)}
        />

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
