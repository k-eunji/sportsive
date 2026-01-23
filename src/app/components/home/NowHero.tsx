// src/app/components/home/NowHero.tsx
"use client";

import type { Event } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { buildNowDashboard } from "@/lib/nowDashboard";
import { shouldShowPwaHint, markPwaHintSeen } from "@/lib/pwaHint";

function formatTime(dt: Date) {
  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
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

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function nextWeekendRange(now: Date) {
  // Weekend = upcoming Sat+Sun (local). If today is Sat/Sun, weekend starts today.
  const base = startOfLocalDay(now);
  const day = base.getDay(); // 0 Sun ... 6 Sat
  const toSat = day === 6 ? 0 : (6 - day + 7) % 7; // days until Sat
  const sat = new Date(base);
  sat.setDate(sat.getDate() + toSat);

  const mon = new Date(sat);
  mon.setDate(mon.getDate() + 2); // exclusive end (Mon 00:00)

  return { start: sat, end: mon };
}

export type TimeScope =
  | "today"
  | "tomorrow"
  | "weekend"
  | "week"
  | "all";   // ✅ 추가

export type NowHeroMode = "live" | "next" | "today" | "quiet";

export default function NowHero({
  events,
  activeIso,
  scope: controlledScope,
  onScopeChange,
}: {
  events: Event[];
  activeIso: string | null;

  // ✅ NEW (optional): parent can control scope
  scope?: TimeScope;
  onScopeChange?: (scope: TimeScope) => void;
}) {
  const now = new Date();

  // Focus day: WeekStrip 등에서 날짜를 선택하면 그 날짜를 "todayCount/peak" 기준으로 쓰고 있었음
  // 이제는 scope에 따라 focusDay를 자동으로 바꿔서 "지도는 언제의 지도인가"를 고정시킴.
  const [uncontrolledScope, setUncontrolledScope] = useState<TimeScope>("today");
  const scope = controlledScope ?? uncontrolledScope;

  const setScope = (s: TimeScope) => {
    if (!controlledScope) setUncontrolledScope(s);
    onScopeChange?.(s);
  };

  const focusDay = useMemo(() => {
    // activeIso가 있으면 우선시 (기존 로직 호환)
    if (activeIso) return new Date(activeIso);

    if (scope === "today") return now;

    if (scope === "tomorrow") {
      const t = startOfLocalDay(now);
      t.setDate(t.getDate() + 1);
      return t;
    }

    if (scope === "weekend") {
      return nextWeekendRange(now).start;
    }

    // week: today 기준
    return now;
  }, [activeIso, scope]);

  const dash = useMemo(() => buildNowDashboard(events, now, 120, focusDay), [events, now, focusDay]);

  // minute tick (live/soon/next label freshness)
  const [, forceTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceTick((v) => v + 1), 60000);
    return () => clearInterval(t);
  }, []);

  // scope별 "표면" 통계 계산 (지도/마커가 바뀌었다는 걸 UI에서 즉시 납득시키는 역할)
  const scopeStats = useMemo(() => {
    const cleaned = (events as any[])
      .map((e) => {
        const dt = getStartDate(e);
        if (!dt) return null;
        return { e, dt };
      })
      .filter(Boolean) as { e: any; dt: Date }[];

    const base = startOfLocalDay(now);
    const tomorrowStart = new Date(base);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const weekEnd = new Date(base);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekend = nextWeekendRange(now);

    const inScope = (dt: Date) => {
      if (scope === "today") return isSameLocalDay(dt, now) && dt >= now;
      if (scope === "tomorrow") return dt >= tomorrowStart && dt < tomorrowEnd;
      if (scope === "weekend") return dt >= weekend.start && dt < weekend.end;
      return dt >= now && dt < weekEnd; // week
    };

    let count = 0;
    let live = 0;
    let soon = 0;
    let nextAt: Date | null = null;

    const soonMs = 120 * 60 * 1000;

    for (const { e, dt } of cleaned) {
      if (!inScope(dt)) continue;

      count += 1;

      const status = (e.status ?? "").toString().toUpperCase();
      if (status === "LIVE") live += 1;

      if (dt > now && dt.getTime() - now.getTime() <= soonMs) soon += 1;
      if (dt > now && (!nextAt || dt < nextAt)) nextAt = dt;
    }

    return { count, live, soon, nextAt };
  }, [events, now, scope]);

  const headline = useMemo(() => {
    // Today는 기존 "LIVE / NEXT / LATER TODAY / QUIET" 느낌 유지 (핵심 확인 도구 정체성)
    if (scope === "today") {
      if (dash.liveCount > 0) return { kind: "live" as const, text: `${dash.liveCount} LIVE` };
      if (!dash.nextAt) return { kind: "quiet" as const, text: "NO EVENTS TODAY" };

      const diffHours = (dash.nextAt.getTime() - Date.now()) / (1000 * 60 * 60);
      const isSameDay = isSameLocalDay(dash.nextAt, new Date());

      if (isSameDay && diffHours <= 3) return { kind: "next" as const, text: `NEXT ${formatTime(dash.nextAt)}` };
      if (isSameDay) return { kind: "laterToday" as const, text: "LATER TODAY" };
      return { kind: "quiet" as const, text: "NO EVENTS TODAY" };
    }

    // Tomorrow / Weekend / Week는 "탐색" 모드로: count를 중심에 둬서 사용자가 바로 이해하게
    const label =
      scope === "tomorrow" ? "TOMORROW" : scope === "weekend" ? "WEEKEND" : "THIS WEEK";

    if (scopeStats.count === 0) return { kind: "quiet" as const, text: `NO EVENTS ${label}` };
    if (scopeStats.live > 0) return { kind: "live" as const, text: `${scopeStats.live} LIVE · ${label}` };
    if (scopeStats.nextAt) return { kind: "next" as const, text: `${scopeStats.count} EVENTS · NEXT ${formatTime(scopeStats.nextAt)}` };
    return { kind: "today" as const, text: `${scopeStats.count} EVENTS · ${label}` };
  }, [scope, dash.liveCount, dash.nextAt, scopeStats.count, scopeStats.live, scopeStats.nextAt]);

  const mode: NowHeroMode =
    headline.kind === "live" ? "live" : headline.kind === "next" ? "next" : headline.kind === "laterToday" ? "today" : "quiet";

  const topLabel = useMemo(() => {
    if (activeIso) {
      // 기존 동작 유지 (WeekStrip 등과 연결 시)
      return new Date(activeIso).toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
    }
    return scope === "today" ? "TODAY" : scope === "tomorrow" ? "TOMORROW" : scope === "weekend" ? "WEEKEND" : "THIS WEEK";
  }, [activeIso, scope]);

  const subLabel = useMemo(() => {
    // 설명을 늘어놓지 않고, “지금 지도는 무엇을 보고 있나”만 짧게 박는다.
    if (scope === "today") return "Quick check";
    if (scope === "tomorrow") return "Plan ahead";
    if (scope === "weekend") return "City trip mode";
    return "Browse the next 7 days";
  }, [scope]);

  const [showPwaHint, setShowPwaHint] = useState(false);
  useEffect(() => {
    if (shouldShowPwaHint()) {
      const t = setTimeout(() => {
        setShowPwaHint(true);
        markPwaHintSeen();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <section className="w-full">
      <div
        className="
          w-full
          rounded-2xl
          bg-background/70
          backdrop-blur
          shadow-sm
          ring-1 ring-border/40
          overflow-hidden
        "
      >
        {/* Top bar: label + scope switch */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs tracking-[0.22em] font-semibold text-muted-foreground">{topLabel}</p>

              {headline.kind === "live" && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-border/40 bg-background/60">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-breathe" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{subLabel}</p>
          </div>

          {/* 2026-style segmented control */}
          <div className="shrink-0">
            <div
              className="
                inline-flex items-center
                rounded-full
                bg-background/60
                ring-1 ring-border/40
                p-1
              "
              role="tablist"
              aria-label="Time scope"
            >
              <ScopeTab label="Today" active={scope === "today"} onClick={() => setScope("today")} />
              <ScopeTab label="Tomorrow" active={scope === "tomorrow"} onClick={() => setScope("tomorrow")} />
              <ScopeTab label="Weekend" active={scope === "weekend"} onClick={() => setScope("weekend")} />
              <ScopeTab label="Week" active={scope === "week"} onClick={() => setScope("week")} />
            </div>
          </div>
        </div>

        {/* Main status */}
        <div className="w-full px-4 pb-4">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-3xl font-semibold tabular-nums tracking-tight leading-tight">
                {headline.text}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {scopeStats.count > 0 && (
                  <span className="rounded-full px-2 py-1 ring-1 ring-border/40 bg-background/60">
                    {scopeStats.count} pins
                  </span>
                )}
                {scopeStats.soon > 0 && (
                  <span className="rounded-full px-2 py-1 ring-1 ring-border/40 bg-background/60">
                    {scopeStats.soon} soon
                  </span>
                )}
                {scopeStats.live > 0 && (
                  <span className="rounded-full px-2 py-1 ring-1 ring-border/40 bg-background/60">
                    {scopeStats.live} live
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Peak</p>
              <p className="text-sm font-semibold tabular-nums">
                {dash.peakLabel ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics row (compact, modern) */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Metric label={topLabel} value={dash.todayCount} />
        <Metric label="SOON" value={dash.soonCount} />
        <Metric label="LIVE" value={dash.liveCount} />
        <Metric
          label="IN VIEW"
          value={scopeStats.count}
          emphasis
        />
      </div>

      {showPwaHint && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Add Sportsive to your home screen for quick checks.
        </p>
      )}
  
    </section>
  );
}

function ScopeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();      // ✅ 추가
        e.stopPropagation();     // ✅ 추가
        onClick();
      }}
      role="tab"
      aria-selected={active}
      className={[
        "px-2.5 py-1.5 text-[12px] font-semibold rounded-full transition",
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Metric({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 ring-1 ring-border/40 bg-background/60",
        emphasis ? "text-foreground" : "text-muted-foreground",
      ].join(" ")}
    >
      <span className="mr-1">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  );
}
