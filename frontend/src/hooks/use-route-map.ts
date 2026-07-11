"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HCM_CENTER } from "@/lib/mock-coordinates";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteInfo {
  /** GeoJSON coordinates [[lng, lat], ...] */
  coordinates: [number, number][];
  /** Distance in meters */
  distanceMeters: number;
  /** Duration in seconds */
  durationSeconds: number;
}

interface UseRouteMapReturn {
  userLocation: LatLng;
  geoPermission: "granted" | "denied" | "pending";
  route: RouteInfo | null;
  isLoadingRoute: boolean;
  routeError: string | null;
  fetchRoute: (destination: LatLng) => void;
  clearRoute: () => void;
}

/**
 * Hook: manages user geolocation + OSRM route fetching.
 * Falls back to HCM center if geolocation is denied.
 */
export function useRouteMap(): UseRouteMapReturn {
  const [userLocation, setUserLocation] = useState<LatLng>(HCM_CENTER);
  const [geoPermission, setGeoPermission] = useState<
    "granted" | "denied" | "pending"
  >("pending");
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Request geolocation on mount */
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoPermission("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoPermission("granted");
      },
      () => {
        setGeoPermission("denied");
        // Keep HCM_CENTER as fallback
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
    );
  }, []);

  /** Fetch route from OSRM (free, no API key) */
  const fetchRoute = useCallback(
    (destination: LatLng) => {
      // Cancel previous request
      if (abortRef.current) abortRef.current.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoadingRoute(true);
      setRouteError(null);

      const { lng: lng1, lat: lat1 } = userLocation;
      const { lng: lng2, lat: lat2 } = destination;

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${lng1},${lat1};${lng2},${lat2}` +
        `?overview=full&geometries=geojson`;

      fetch(url, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.code !== "Ok" || !data.routes?.length) {
            throw new Error("No route found");
          }

          const r = data.routes[0];
          setRoute({
            coordinates: r.geometry.coordinates,
            distanceMeters: r.distance,
            durationSeconds: r.duration,
          });
          setIsLoadingRoute(false);
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setRouteError("Could not fetch route. Using straight line.");
          // Fallback: straight-line route
          setRoute({
            coordinates: [
              [lng1, lat1],
              [lng2, lat2],
            ],
            distanceMeters: haversineDistance(lat1, lng1, lat2, lng2),
            durationSeconds:
              (haversineDistance(lat1, lng1, lat2, lng2) / 1000 / 40) * 3600, // ~40km/h avg
          });
          setIsLoadingRoute(false);
        });
    },
    [userLocation],
  );

  const clearRoute = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setRoute(null);
    setRouteError(null);
  }, []);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return {
    userLocation,
    geoPermission,
    route,
    isLoadingRoute,
    routeError,
    fetchRoute,
    clearRoute,
  };
}

/**
 * Haversine distance in meters between two lat/lng points.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
