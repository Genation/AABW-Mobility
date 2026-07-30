"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../post-trip.module.css";

interface Props {
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
      if (e.key === "ArrowRight" && currentIndex < photos.length - 1) {
        onNavigate(currentIndex + 1);
      }
    },
    [currentIndex, photos.length, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className={styles.lightbox}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <button
        className={styles.lightboxClose}
        onClick={onClose}
        type="button"
        aria-label="Đóng"
      >
        <X size={24} />
      </button>

      {currentIndex > 0 && (
        <button
          className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
          onClick={() => onNavigate(currentIndex - 1)}
          type="button"
          aria-label="Ảnh trước"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {currentIndex < photos.length - 1 && (
        <button
          className={`${styles.lightboxNav} ${styles.lightboxNext}`}
          onClick={() => onNavigate(currentIndex + 1)}
          type="button"
          aria-label="Ảnh sau"
        >
          <ChevronRight size={24} />
        </button>
      )}

      <img
        src={photos[currentIndex]}
        alt={`Ảnh ${currentIndex + 1}`}
        className={styles.lightboxImage}
        onClick={(e) => e.stopPropagation()}
      />

      <div className={styles.lightboxCounter}>
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  );
}
