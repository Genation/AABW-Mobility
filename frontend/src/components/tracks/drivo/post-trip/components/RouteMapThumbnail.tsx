"use client";

import dynamic from "next/dynamic";
import type { PostTripRoute } from "../types";
import styles from "../post-trip.module.css";

const RouteMapThumbnailInner = dynamic(
  () =>
    import("./RouteMapThumbnailInner").then((m) => m.RouteMapThumbnailInner),
  {
    ssr: false,
    loading: () => (
      <div className={styles.mapThumbnailLoading}>Đang tải bản đồ...</div>
    ),
  }
);

interface Props {
  route: PostTripRoute;
  mapId: string;
}

export function RouteMapThumbnail({ route, mapId }: Props) {
  return (
    <div className={styles.mapThumbnail}>
      <RouteMapThumbnailInner route={route} mapId={mapId} />
    </div>
  );
}
