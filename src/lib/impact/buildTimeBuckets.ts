// src/lib/impact/buildTimeBuckets.ts

import { resolveImpactProfile } from "./resolveImpactProfile";
import { confidenceWeight } from "./confidenceWeight";

export type MobilityBucket = {
  minute: number; // 분 단위 (예: 780 = 13:00)
  value: number;
};

export function buildTimeBuckets(
  events: any[],
  startHour = 9,
  endHour = 22,
  resolution = 10 // 🔥 10분 단위 계산
): MobilityBucket[] {
  const startMinute = startHour * 60;
  const endMinute = endHour * 60;

  const buckets: MobilityBucket[] = [];

  for (let m = startMinute; m <= endMinute; m += resolution) {
    buckets.push({ minute: m, value: 0 });
  }

  for (const e of events) {
    const profile = resolveImpactProfile(e);
    const c = confidenceWeight(profile.confidence);

    // 🟫 block (경마)
    if (profile.type === "block" && profile.window) {
      for (const b of buckets) {
        const h = Math.floor(b.minute / 60);
        if (
          h >= profile.window.startHour &&
          h <= profile.window.endHour
        ) {
          b.value += 0.4 * c;
        }
      }
      continue;
    }

    // fixed / session
    if (!profile.phases) continue;

    const start = new Date(e.date ?? e.startDate);
    if (isNaN(start.getTime())) continue;

    const baseMinute =
      start.getHours() * 60 + start.getMinutes();

    for (const phase of profile.phases) {
      const from = baseMinute + phase.offset;
      const to = from + phase.duration;

      for (const b of buckets) {
        if (b.minute >= from && b.minute <= to) {
          b.value += phase.weight * c;
        }
      }
    }
  }

  return buckets;
}
