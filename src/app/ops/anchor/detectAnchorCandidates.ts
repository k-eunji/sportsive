// src/app/ops/anchor/detectAnchorCandidates.ts
import type { AreaIndex } from "@/types/area";

export function detectAnchorArea(
  pos: { lat: number; lng: number } | null,
  areas: AreaIndex[]
): string | null {
  if (!pos) return null;

  const nearby = areas.find(
    (a) =>
      a.center &&
      Math.abs(a.center.lat - pos.lat) < 0.5 &&
      Math.abs(a.center.lng - pos.lng) < 0.5
  );

  if (!nearby) return null;

  return nearby.city
    ? `${nearby.city} area detected`
    : nearby.region
    ? `${nearby.region} region detected`
    : null;
}
