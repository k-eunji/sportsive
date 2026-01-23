// src/lib/calcCityCenter.ts
import type { Event } from "@/types";

export function calcCityCenter(events: Event[], city: string) {
  const pts = events
    .filter(e => e.city === city && e.location?.lat && e.location?.lng)
    .map(e => e.location!);

  if (pts.length === 0) return null;

  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;

  return { lat, lng };
}
