// src/app/ops/components/home/useUserLocation.ts
"use client";

import { useEffect, useRef, useState } from "react";

export type LatLng = { lat: number; lng: number };

export function useUserLocation(options?: { enabled?: boolean }) {
  const [pos, setPos] = useState<LatLng | null>(null);
  const [denied, setDenied] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (options?.enabled === false) return;
    if (!navigator.geolocation) {
      setDenied(true);
      return;
    }

    // 1️⃣ 즉시 한 번 요청 (빠른 초기 값)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        });
      },
      () => setDenied(true),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    // 2️⃣ 이후 정확도 개선용 watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        setPos({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        });
      },
      () => setDenied(true),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );

    // cleanup
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
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
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
  return R * c;
}
