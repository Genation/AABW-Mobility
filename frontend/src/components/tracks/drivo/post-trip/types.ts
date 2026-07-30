export interface PostTripAuthor {
  id: string;
  name: string;
  avatar: string;
  vehicle: string;
}

export interface TripStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  arrivedAt: string;
  duration: string;
  note?: string;
  photo?: string;
}

export interface PostTripStats {
  totalKm: number;
  movingTime: string;
  avgSpeed: number;
  fuelUsed: number;
  totalStops: number;
}

export interface PostTripRoute {
  start: { name: string; lat: number; lng: number };
  end: { name: string; lat: number; lng: number };
  waypoints: { name: string; lat: number; lng: number }[];
}

export interface PostTripPost {
  id: string;
  author: PostTripAuthor;
  title: string;
  description: string;
  route: PostTripRoute;
  stats: PostTripStats;
  stops: TripStop[];
  photos: string[];
  coverPhoto: string;
  tags: string[];
  mood: string;
  socialCounts: {
    likes: number;
    comments: number;
    shares: number;
  };
  publishedAt: string;
  tripDate: string;
}

export type PostTripScreen = "FEED" | "DETAIL" | "CREATE";
