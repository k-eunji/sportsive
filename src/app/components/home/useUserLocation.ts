//src/app/components/home/useUserLocation.ts

"use client";

import { useEffect, useState } from "react";

export type LatLng = { lat: number; lng: number };

export function useUserLocation(options?: { enabled?: boolean }) {
  const [pos, setPos] = useState<LatLng | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (options?.enabled === false) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => setDenied(true),
      { enableHighAccuracy: false, timeout: 7000 }
    );
  }, [options?.enabled]);

  return { pos, denied };
}

export function haversineKm(a: LatLng, b: LatLng) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
  return R * c;
}
