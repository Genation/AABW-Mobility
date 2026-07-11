/** Visual identity per RouteMate need bucket (shared by map + panel). */
export interface NeedStyle {
  color: string;
  emoji: string;
}

export const NEED_STYLE: Record<string, NeedStyle> = {
  cafe: { color: "#8B5CF6", emoji: "☕" },
  food: { color: "#EF4444", emoji: "🍜" },
  charge: { color: "#22C55E", emoji: "⚡" },
  fuel: { color: "#F59E0B", emoji: "⛽" },
  rest: { color: "#8B5CF6", emoji: "☕" },
  hotel: { color: "#0EA5E9", emoji: "🏨" },
  custom: { color: "#6366F1", emoji: "📍" },
};

export function needStyle(key: string): NeedStyle {
  return NEED_STYLE[key] ?? NEED_STYLE.custom;
}
