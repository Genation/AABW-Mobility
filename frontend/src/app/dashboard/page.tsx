import type { Metadata } from "next";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { TrackCard } from "@/components/dashboard/track-card";
import { TRACKS } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dashboard — AABW Mobility",
  description: "Explore 12 AI-powered urban mobility tracks. View active projects and upcoming innovations.",
};

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Mobility Tracks</h1>
        <p className={styles.subtitle}>
          Explore 12 AI-powered urban mobility tracks. Click on active tracks to dive deeper.
        </p>
      </div>

      <StatsBar />

      <div className={styles.grid}>
        {TRACKS.map((track, index) => (
          <TrackCard key={track.id} track={track} index={index} />
        ))}
      </div>
    </div>
  );
}
