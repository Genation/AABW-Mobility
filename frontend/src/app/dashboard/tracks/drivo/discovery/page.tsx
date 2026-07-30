import { PostTripApp } from "@/components/tracks/drivo/post-trip/PostTripApp";

export const metadata = {
  title: "Discovery - Drivo",
};

export default function DiscoveryPage() {
  return (
    <div
      style={{
        width: "100%",
        height: "calc(100dvh - var(--bottom-nav-height) - var(--safe-area-bottom, 0px))",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <PostTripApp />
    </div>
  );
}
