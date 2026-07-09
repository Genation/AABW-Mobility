"use client";

import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { TRACKS, ROUTES } from "@/lib/constants";
import { AutocompleteDemo } from "@/components/tracks/track-4/autocomplete-demo";
import { Badge } from "@/components/ui/badge";
import { use } from "react";
import styles from "./track-detail.module.css";

/**
 * Dynamic track detail page.
 * - track-4 → full AutocompleteDemo
 * - other tracks → coming-soon placeholder
 */
export default function TrackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const track = TRACKS.find((t) => t.id === id);

  if (!track) {
    return (
      <div className={styles.notFound}>
        <h1>Track Not Found</h1>
        <p>No track with ID &quot;{id}&quot; exists.</p>
        <Link href={ROUTES.DASHBOARD} className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const isActive = track.status === "active";

  return (
    <div className={styles.page}>
      {/* Back nav */}
      <Link href={ROUTES.DASHBOARD} className={styles.backLink}>
        <ArrowLeft size={16} /> Dashboard
      </Link>

      {/* Render track content */}
      {isActive && track.id === "track-4" ? (
        <AutocompleteDemo />
      ) : (
        <div className={styles.comingSoon}>
          <div
            className={styles.comingSoonIcon}
            style={{ background: track.gradient }}
          >
            <Clock size={32} color="#ffffff" />
          </div>
          <h1 className={styles.comingSoonTitle}>{track.title}</h1>
          <p className={styles.comingSoonDesc}>{track.description}</p>
          <Badge variant="warning">Coming Soon</Badge>
        </div>
      )}
    </div>
  );
}
