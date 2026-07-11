import type { Metadata } from "next";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { TrackCard } from "@/components/dashboard/track-card";
import { ACTIVE_TRACKS } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dashboard — Tasco",
  description: "Explore our live AI-powered urban mobility services: RouteMate and AI Search.",
};

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Mobility Services</h1>
        <p className={styles.subtitle}>
          Explore our live AI-powered urban mobility services. Click a card to dive deeper.
        </p>
      </div>

      <StatsBar />

      <div className={styles.grid}>
        {ACTIVE_TRACKS.map((track, index) => (
          <TrackCard key={track.id} track={track} index={index} />
        ))}
      </div>
    </div>
  );
}
