"use client";

import dynamic from "next/dynamic";
import type { PostTripRoute } from "../types";
import styles from "../post-trip.module.css";

const PostMapInner = dynamic(
  () => import("./PostMapInner").then((m) => m.PostMapInner),
  {
    ssr: false,
    loading: () => (
      <div className={styles.detailMapLoading}>Đang tải bản đồ...</div>
    ),
  }
);

interface Props {
  route: PostTripRoute;
  mapId: string;
}

export function PostMap({ route, mapId }: Props) {
  return (
    <div className={styles.detailMap}>
      <PostMapInner route={route} mapId={mapId} />
    </div>
  );
}
