// src/lib/nowDashboard.ts
import type { Event } from "@/types";

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export type NowDashboard = {
  liveCount: number;
  soonCount: number;
  todayCount: number; // <- "focusDay 기준" dayCount로 사용
  nextAt: Date | null;

  peakLabel: string | null;
  sportCounts: Record<string, number>;
};

export function buildNowDashboard(
  events: Event[],
  now = new Date(),
  soonMinutes = 120,
  focusDay: Date = now // ✅ 추가: WeekStrip 선택 날짜를 여기로 넣는다
): NowDashboard {
  const soonMs = soonMinutes * 60 * 1000;

  let liveCount = 0;
  let soonCount = 0;
  let todayCount = 0;
  let nextAt: Date | null = null;

  const sportCounts: Record<string, number> = {};
  const focusHours: number[] = [];

  for (const e of events as any[]) {
    const start = getStartDate(e);
    if (!start) continue;

    const sport = (e.sport ?? "sport").toString().toLowerCase();
    sportCounts[sport] = (sportCounts[sport] ?? 0) + 1;

    const status = (e.status ?? "").toString().toUpperCase();
    if (status === "LIVE") liveCount += 1;

    // soon/next는 "진짜 지금(now)" 기준
    if (start > now && start.getTime() - now.getTime() <= soonMs) {
      soonCount += 1;
    }
    if (start > now) {
      if (!nextAt || start < nextAt) nextAt = start;
    }

    // ✅ dayCount/peak는 focusDay 기준 (WeekStrip 선택 반영)
    if (isSameLocalDay(start, focusDay)) {
      todayCount += 1;
      focusHours.push(start.getHours());
    }
  }

  // 피크(가장 붐비는 2시간대) 계산
  let peakLabel: string | null = null;
  if (focusHours.length) {
    const hist = new Array(24).fill(0);
    for (const h of focusHours) hist[h] += 1;

    let bestStart = 0;
    let bestScore = -1;
    for (let h = 0; h < 24; h++) {
      const score = hist[h] + hist[(h + 1) % 24];
      if (score > bestScore) {
        bestScore = score;
        bestStart = h;
      }
    }

    const fmt = (h: number) => {
      const hour = h % 24;
      const suffix = hour >= 12 ? "pm" : "am";
      const h12 = ((hour + 11) % 12) + 1;
      return `${h12}${suffix}`;
    };

    peakLabel = bestScore > 0 ? `${fmt(bestStart)}–${fmt(bestStart + 2)}` : null;
  }

  return { liveCount, soonCount, todayCount, nextAt, peakLabel, sportCounts };
}
