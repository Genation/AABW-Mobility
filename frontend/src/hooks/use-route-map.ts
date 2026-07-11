"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HCM_CENTER } from "@/lib/mock-coordinates";
import { fetchOsrmRoute } from "@/lib/osrm";
import type { LatLng, RouteInfo } from "@/lib/osrm";

// Re-exported so existing importers (`@/hooks/use-route-map`) keep working.
export type { LatLng, RouteInfo } from "@/lib/osrm";

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
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoadingRoute(true);
      setRouteError(null);

      fetchOsrmRoute([userLocation, destination], controller.signal)
        .then((r) => {
          setRoute(r);
          setIsLoadingRoute(false);
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setRouteError("Could not fetch route.");
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
