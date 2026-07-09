/**
 * Track data definitions for AABW Mobility dashboard.
 * Each track has a unique ID matching the backend naming convention.
 * Only track-4 is "active" — others are "coming-soon".
 */

export interface TrackDefinition {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  status: "active" | "coming-soon";
  gradient: string;
}

export const TRACKS: TrackDefinition[] = [
  {
    id: "track-1",
    number: 1,
    title: "AI Workspace",
    description: "Intelligent workspace powered by AI for seamless collaboration and productivity.",
    icon: "Search",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #F97316, #FB923C)",
  },
  {
    id: "track-2",
    number: 2,
    title: "Mobility Growth",
    description: "Data-driven strategies for scaling mobility services and user engagement.",
    icon: "TrendingUp",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
  },
  {
    id: "track-3",
    number: 3,
    title: "Mini App",
    description: "Lightweight embedded apps for on-the-go mobility micro-services.",
    icon: "Smartphone",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #EF4444, #F87171)",
  },
  {
    id: "track-4",
    number: 4,
    title: "AI Autocomplete",
    description: "Smart search suggestions with Vietnamese NLP, typo correction, and intent detection.",
    icon: "Sparkles",
    status: "active",
    gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
  },
  {
    id: "track-5",
    number: 5,
    title: "Gamification",
    description: "Engagement-driven gamification layers for mobility platform retention.",
    icon: "Gamepad2",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #06B6D4, #22D3EE)",
  },
  {
    id: "track-6",
    number: 6,
    title: "Vehicle Assistant",
    description: "AI-powered in-vehicle assistant for navigation, alerts, and diagnostics.",
    icon: "Car",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
  },
  {
    id: "track-7",
    number: 7,
    title: "Search Understanding",
    description: "Deep query understanding and location-aware search intelligence.",
    icon: "MapPin",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #EC4899, #F472B6)",
  },
  {
    id: "track-8",
    number: 8,
    title: "Semantic Search",
    description: "Natural language map search with contextual understanding and ranking.",
    icon: "Brain",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #14B8A6, #2DD4BF)",
  },
  {
    id: "track-9",
    number: 9,
    title: "Map Assistant",
    description: "Conversational map assistant for real-time navigation and place discovery.",
    icon: "MessageSquare",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #6366F1, #818CF8)",
  },
  {
    id: "track-10",
    number: 10,
    title: "Hotel POI",
    description: "AI-curated hotel points of interest with reviews and availability insights.",
    icon: "Hotel",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #22C55E, #4ADE80)",
  },
  {
    id: "track-11",
    number: 11,
    title: "Restaurant Intel",
    description: "Smart restaurant discovery with cuisine matching and crowd prediction.",
    icon: "UtensilsCrossed",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #A855F7, #C084FC)",
  },
  {
    id: "track-12",
    number: 12,
    title: "Group Drive",
    description: "Collaborative group driving with shared routes and real-time coordination.",
    icon: "Users",
    status: "coming-soon",
    gradient: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
  },
];

/** Route paths */
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  TRACK_DETAIL: (id: string) => `/dashboard/track/${id}`,
} as const;

/** Auth credentials (hardcoded for demo) */
export const AUTH = {
  USERNAME: "aabw-user",
  PASSWORD: "123456",
  STORAGE_KEY: "aabw-auth",
} as const;

/** API endpoints */
export const API = {
  TRACK4_SUGGEST: "/api/v1/track-4/suggest",
} as const;

/** Theme storage key */
export const THEME_STORAGE_KEY = "aabw-theme";
