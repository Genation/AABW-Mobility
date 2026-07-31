import { PlaceCandidate } from "@/lib/api";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DrivoDestination extends PlaceCandidate {
  // We extend PlaceCandidate to make sure we always have lat/lng
  id: string; // unique local ID
  lat: number;
  lng: number;
}

export interface DrivoTrack {
  id: string;
  name: string;
  startLocation: DrivoDestination | null;
  endLocation: DrivoDestination | null;
  destinations: DrivoDestination[];
}

export interface TripPlan {
  id: string;
  name: string;
  startLocation: DrivoDestination | null;
  endLocation: DrivoDestination | null;
  startTime: Date | null;
  tracks: DrivoTrack[];
}

export type DrivoScreen = "CREATE_TRIP" | "TRIP_ITINERARY" | "TRACK_DETAIL";

export interface TripAdvisorWarning {
  id: string;
  /** 1-based track position at analysis time; -1 = whole-trip message. */
  track_id: number;
  message: string;
  confidence?: number;
  createdAt: number;
}
