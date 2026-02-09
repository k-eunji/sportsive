// src/lib/impact/explainImpact.ts

import { resolveImpactProfile } from "./resolveImpactProfile";

/**
 * 선택한 시간대(range) 안에서
 * 왜 Estimated crowd movement pressure가 발생했는지 설명
 */
export function explainImpact(
  events: any[],
  targetMinute: number // 🔥 hour ❌ → minute ⭕
): string[] {
  const reasons: string[] = [];

  for (const e of events) {
    const profile = resolveImpactProfile(e);

    // 🟫 block (경마)
    if (profile.type === "block" && profile.window) {
      const h = Math.floor(targetMinute / 60);
      if (
        h >= profile.window.startHour &&
        h <= profile.window.endHour
      ) {
        reasons.push(
          `${e.sport} events contributing to sustained movement`
        );
      }
      continue;
    }

    if (!profile.phases) continue;

    const start = new Date(e.date ?? e.startDate);
    if (isNaN(start.getTime())) continue;

    const baseMinute =
      start.getHours() * 60 + start.getMinutes();

    for (const phase of profile.phases) {
      const from = baseMinute + phase.offset;
      const to = from + phase.duration;

      if (targetMinute >= from && targetMinute <= to) {
        reasons.push(`${e.sport} mobility phase`);
        break;
      }
    }
  }

  return reasons.slice(0, 3);
}
