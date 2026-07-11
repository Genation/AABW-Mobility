/**
 * Mock coordinate generator for demo purposes.
 * Generates deterministic lat/lng based on suggestion text,
 * clustered around HCM City for realistic map rendering.
 *
 * TODO: Replace with real coordinates from backend API once
 * engine returns lat/lng from POI data.
 */

/** HCM City center — default user location & cluster base */
export const HCM_CENTER = { lat: 10.7769, lng: 106.7009 };

/**
 * Simple deterministic hash → number between 0-1.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

/**
 * Generate mock coordinates for a suggestion text.
 * Points scattered within ~10km radius of HCM center.
 */
export function getMockCoordinates(text: string): {
  lat: number;
  lng: number;
} {
  const h1 = hashString(text);
  const h2 = hashString(text + "_lng");

  // Offset: ~0.01 degree ≈ 1.1km, range ±0.05 ≈ ±5.5km
  const latOffset = (h1 - 0.5) * 0.1;
  const lngOffset = (h2 - 0.5) * 0.1;

  return {
    lat: HCM_CENTER.lat + latOffset,
    lng: HCM_CENTER.lng + lngOffset,
  };
}
