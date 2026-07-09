"use client";

import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import type { TrackDefinition } from "@/lib/constants";
import styles from "./track-card.module.css";

interface TrackCardProps {
  track: TrackDefinition;
  index: number; // For staggered animation
}

/**
 * Track card — gradient accent bar, icon, title, description, status badge.
 * Active tracks are clickable. Coming-soon tracks are dimmed.
 */
export function TrackCard({ track, index }: TrackCardProps) {
  const isActive = track.status === "active";
  // Dynamically resolve Lucide icon by name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as Record<string, any>;
  const IconComponent = (icons[track.icon] || LucideIcons.HelpCircle) as React.ComponentType<LucideIcons.LucideProps>;

  const cardContent = (
    <div
      className={`${styles.card} ${isActive ? styles.active : styles.disabled}`}
      style={{ animationDelay: `${index * 60}ms` }}
      id={`track-card-${track.id}`}
    >
      {/* Gradient accent bar */}
      <div className={styles.accentBar} style={{ background: track.gradient }} />

      <div className={styles.body}>
        {/* Icon + number */}
        <div className={styles.iconRow}>
          <div
            className={styles.iconWrap}
            style={{ background: track.gradient }}
          >
            <IconComponent size={20} color="#ffffff" />
          </div>
          <span className={styles.trackNumber}>#{track.number}</span>
        </div>

        {/* Title */}
        <h3 className={styles.title}>{track.title}</h3>

        {/* Description */}
        <p className={styles.description}>{track.description}</p>

        {/* Footer */}
        <div className={styles.footer}>
          <Badge variant={isActive ? "success" : "default"}>
            {isActive ? "Live" : "Coming Soon"}
          </Badge>
          {isActive && (
            <span className={styles.explore}>
              Explore →
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isActive) {
    return (
      <Link
        href={ROUTES.TRACK_DETAIL(track.id)}
        className={styles.link}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
