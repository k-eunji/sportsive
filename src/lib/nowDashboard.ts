// src/lib/nowDashboard.ts
import type { Event } from "@/types";

/**
 * ✅ MVP용으로 NowHero를 "checking tool"에 맞게 최소화한 상태 계산기
 * - TimeScope별 "LIVE 있냐 / NEXT가 언제냐 / 없냐"만 만든다
 * - peak, sportCounts, dayCount 등은 제거 (지금 UI에서 안 씀)
 */

export type TimeScope = "today" | "tomorrow" | "weekend" | "week";

export type NowStatus = {
  scope: TimeScope;
  kind: "live" | "next" | "empty";
  liveCount: number;
  nextAt: Date | null;
  count: number; // scope 안의 전체 이벤트 수 (UI에서 안 쓰면 그냥 둬도 됨)
  text: string;  // NowHero 메인 1줄
};

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
  const day = base.getDay(); // 0 Sun ... 6 Sat
  const toSat = day === 6 ? 0 : (6 - day + 7) % 7;
  const sat = new Date(base);
  sat.setDate(sat.getDate() + toSat);

  const mon = new Date(sat);
  mon.setDate(mon.getDate() + 2); // exclusive
  return { start: sat, end: mon };
}

function formatTime(dt: Date) {
  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function inScope(start: Date, scope: TimeScope, now: Date) {
  const base = startOfLocalDay(now);

  if (scope === "today") {
    // "지금 나갈까" 체크이므로 과거 시작은 제외 (토너먼트 예외는 events 필터에서 이미 처리하는 게 더 안전)
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

  // week: next 7 days from start of today
  const end = new Date(base);
  end.setDate(end.getDate() + 7);
  return start >= now && start < end;
}

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

    const status = (e.status ?? "").toString().toUpperCase();
    if (status === "LIVE") liveCount += 1;

    if (start > now) {
      if (!nextAt || start < nextAt) nextAt = start;
    }
  }

  if (liveCount > 0) {
    return {
      scope,
      kind: "live",
      liveCount,
      nextAt,
      count,
      text: `${liveCount} LIVE`,
    };
  }

  if (nextAt) {
    return {
      scope,
      kind: "next",
      liveCount,
      nextAt,
      count,
      text: `NEXT ${formatTime(nextAt)}`,
    };
  }

  const label =
    scope === "today"
      ? "TODAY"
      : scope === "tomorrow"
      ? "TOMORROW"
      : scope === "weekend"
      ? "THIS WEEKEND"
      : "THIS WEEK";

  return {
    scope,
    kind: "empty",
    liveCount,
    nextAt: null,
    count,
    text: `NO EVENTS ${label}`,
  };
}
