import { DrivoApp } from "@/components/tracks/drivo/DrivoApp";

export const metadata = {
  title: "Drivo - Tasco Mobility",
};

export default function DrivoPage() {
  return (
    <div style={{
      width: "100%",
      height: "calc(100dvh - var(--header-height) - var(--bottom-nav-height))",
      position: "relative",
      overflow: "hidden",
    }}>
      <DrivoApp />
    </div>
  );
}
