//src/app/ops/components/home/useLocationMode.ts

"use client";

import { useUserLocation } from "./useUserLocation";

export type LocationMode =
  | "observer"   // 위치 없음 (기본)
  | "located";   // 위치 있음

export function useLocationMode(): {
  mode: LocationMode;
  hasLocation: boolean;
} {
  const { pos } = useUserLocation();

  if (pos) {
    return { mode: "located", hasLocation: true };
  }

  return { mode: "observer", hasLocation: false };
}
