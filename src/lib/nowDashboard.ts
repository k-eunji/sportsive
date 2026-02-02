// src/lib/nowDashboard.ts
import type { Event } from "@/types";
import { getEventTimeState } from "@/lib/eventTime";


/**
 * NowHero / City status calculator
 * 역할:
 * - 이벤트 정보를 "도시 상태(Pulse)"로 해석
 * - 숫자가 아니라 '결론 한 줄'을 만든다
 */

export type TimeScope = "today" | "tomorrow" | "weekend" | "week";

export type CityPulse =
  | "LIVE"
  | "WARMING_UP"
  | "QUIET";

export type NowStatus = {
  scope: TimeScope;
  kind: "live" | "next" | "empty";
  liveCount: number;
  nextAt: Date | null;
  count: number;

  pulse: CityPulse;   // ✅ 핵심
  text: string;       // ✅ 도시 상태 한 줄
};

/* ---------- helpers ---------- */

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function nextWeekendRange(now: Date) {
  const base = startOfLocalDay(now);
  const day = base.getDay();
  const toSat = day === 6 ? 0 : (6 - day + 7) % 7;
  const sat = new Date(base);
  sat.setDate(sat.getDate() + toSat);
  const mon = new Date(sat);
  mon.setDate(mon.getDate() + 2);
  return { start: sat, end: mon };
}

function formatTime(dt: Date) {
  return dt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function inScope(start: Date, scope: TimeScope, now: Date) {
  const base = startOfLocalDay(now);

  if (scope === "today") {
    return isSameLocalDay(start, now) && start >= now;
  }

  if (scope === "tomorrow") {
    const t0 = new Date(base);
    t0.setDate(t0.getDate() + 1);
    const t1 = new Date(t0);
    t1.setDate(t1.getDate() + 1);
    return start >= t0 && start < t1;
  }

  if (scope === "weekend") {
    const wk = nextWeekendRange(now);
    return start >= wk.start && start < wk.end;
  }

  const end = new Date(base);
  end.setDate(end.getDate() + 7);
  return start >= now && start < end;
}

/* ---------- NEW: 해석 레이어 ---------- */

function getCityPulse(
  liveCount: number,
  nextAt: Date | null,
  now: Date
): CityPulse {
  if (liveCount > 0) return "LIVE";

  if (nextAt) {
    const diffH =
      (nextAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffH <= 3) return "WARMING_UP";
  }

  return "QUIET";
}

function formatCityText(
  pulse: CityPulse,
  nextAt: Date | null
): string {
  if (pulse === "LIVE") {
    return "LIVE now · more happening later";
  }

  if (pulse === "WARMING_UP" && nextAt) {
    return `Starting soon · ${formatTime(nextAt)}`;
  }

  if (nextAt) {
    return `Quiet now · next event at ${formatTime(nextAt)}`;
  }

  return "Quiet today · nothing scheduled";
}

/* ---------- main ---------- */

export function buildNowStatus(
  events: Event[],
  scope: TimeScope,
  now = new Date()
): NowStatus {
  let liveCount = 0;
  let nextAt: Date | null = null;
  let count = 0;

  for (const e of events as any[]) {
    const start = getStartDate(e);
    if (!start) continue;
    if (!inScope(start, scope, now)) continue;

    count += 1;

    const status = (e.status ?? "").toUpperCase();
    if (status === "LIVE") liveCount += 1;

    if (start > now) {
      if (!nextAt || start < nextAt) nextAt = start;
    }
  }

  const pulse = getCityPulse(liveCount, nextAt, now);

  return {
    scope,
    kind:
      pulse === "LIVE"
        ? "live"
        : pulse === "WARMING_UP"
        ? "next"
        : "empty",
    liveCount,
    nextAt,
    count,
    pulse,
    text: formatCityText(pulse, nextAt),
  };
}
