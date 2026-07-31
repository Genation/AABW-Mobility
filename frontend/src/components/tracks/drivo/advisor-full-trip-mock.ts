import { TripPlan, DrivoTrack, DrivoDestination, TripAdvisorWarning } from "./types";
import { buildOrderedTripPoints, getEffectiveTrackStart, getEffectiveTrackEnd } from "./track-chain-utils";
import { haversineMeters } from "@/lib/osrm";

// Deterministic mock standing in for a future LLM full-trip analysis call.
// Signature/return type are kept stable so swapping in a real endpoint later
// only needs to make this function async.

const AVG_SPEED_KMH = 40; // matches the haversine fallback speed in osrm.ts
// Haversine-chain distance runs ~30% under real road distance (curves, detours),
// so usecase 1's ~330km/~8.5h real trip only estimates to ~5.9h here — set below
// that so it still reliably triggers, while short trips (usecase 2: ~3.8h) don't.
const LONG_TRIP_HOURS = 5.5;
const OUTDOOR_HINTS = ["tham quan", "check-in", "thác", "đồi", "bãi biển", "hồ"];
const FUEL_HINTS = ["xăng", "petrolimex"];

function estimateTotalHours(plan: TripPlan): number {
  const points = buildOrderedTripPoints(plan);
  let meters = 0;
  for (let i = 0; i < points.length - 1; i++) {
    meters += haversineMeters(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
  }
  return meters / 1000 / AVG_SPEED_KMH;
}

function findStopMatching(track: DrivoTrack, hints: string[]): DrivoDestination | undefined {
  return track.destinations.find((d) =>
    hints.some((h) => `${d.category ?? ""} ${d.name}`.toLowerCase().includes(h)),
  );
}

export function analyzeFullTrip(plan: TripPlan): TripAdvisorWarning[] {
  if (plan.tracks.length === 0) return [];

  const now = Date.now();
  const warnings: TripAdvisorWarning[] = [];

  // R1 — track 0 exists
  if (plan.tracks.length >= 1) {
    warnings.push({
      id: "adv-1-r1",
      track_id: 1,
      message: "Chặng 1 đi qua QL1 đông xe tải buổi sáng — nên khởi hành trước 6h00 để tránh giờ cao điểm hàng hoá",
      confidence: 0.72,
      createdAt: now,
    });
  }

  // R2 — track 1 exists
  if (plan.tracks.length >= 2) {
    const track2 = plan.tracks[1];
    const startName = getEffectiveTrackStart(plan, 1)?.name ?? "?";
    const endName = getEffectiveTrackEnd(plan, 1)?.name ?? "?";
    const fuelName = findStopMatching(track2, FUEL_HINTS)?.name ?? "trạm xăng gần nhất";
    warnings.push({
      id: "adv-2-r2",
      track_id: 2,
      message: `Chặng 2 (${startName} → ${endName}) có đèo dốc dài — nên đổ đầy bình tại ${fuelName} trước khi vào đèo`,
      confidence: 0.8,
      createdAt: now,
    });
  }

  // R3 — track 2 exists and has >=1 outdoor POI
  if (plan.tracks.length >= 3) {
    const track3 = plan.tracks[2];
    const outdoorStops = track3.destinations.filter((d) =>
      OUTDOOR_HINTS.some((h) => `${d.category ?? ""} ${d.name}`.toLowerCase().includes(h)),
    );
    if (outdoorStops.length > 0) {
      const names = outdoorStops.slice(0, 2).map((d) => d.name).join(", ");
      const endCity = getEffectiveTrackEnd(plan, 2)?.city ?? getEffectiveTrackEnd(plan, 2)?.name ?? "khu vực điểm đến";
      warnings.push({
        id: "adv-3-r3",
        track_id: 3,
        message: `${names} là điểm ngoài trời — ${endCity} hay mưa giông buổi chiều, nên ghé trước 15h00`,
        confidence: 0.7,
        createdAt: now,
      });
    }
  }

  // R4 — total estimated duration exceeds threshold
  const totalHours = estimateTotalHours(plan);
  if (totalHours > LONG_TRIP_HOURS) {
    const nightStopName = getEffectiveTrackEnd(plan, plan.tracks.length - 2)?.name;
    const finalEndName = getEffectiveTrackEnd(plan, plan.tracks.length - 1)?.name ?? "điểm đến";
    const nightClause = nightStopName
      ? ` — cân nhắc nghỉ đêm tại ${nightStopName} thay vì đi thẳng ${finalEndName}`
      : "";
    warnings.push({
      id: "adv--1-r4",
      track_id: -1,
      message: `Tổng thời gian lái ~${totalHours.toFixed(1)} giờ trong 1 ngày khá dài${nightClause}`,
      confidence: 0.6,
      createdAt: now,
    });
  }

  // R5 — plan has a start time
  if (plan.startTime instanceof Date && !isNaN(plan.startTime.getTime())) {
    const hh = String(plan.startTime.getHours()).padStart(2, "0");
    const mm = String(plan.startTime.getMinutes()).padStart(2, "0");
    const dd = String(plan.startTime.getDate()).padStart(2, "0");
    const mo = String(plan.startTime.getMonth() + 1).padStart(2, "0");
    warnings.push({
      id: "adv--1-r5",
      track_id: -1,
      message: `Khởi hành ${hh}h${mm} ngày ${dd}/${mo} — kiểm tra thời tiết khu vực đèo và điểm đến trước khi đi`,
      createdAt: now,
    });
  }

  return warnings;
}
