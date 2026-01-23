// src/app/components/home/NowHero.tsx
"use client";

import type { Event } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { buildNowStatus, type TimeScope } from "@/lib/nowDashboard";
import { shouldShowPwaHint, markPwaHintSeen } from "@/lib/pwaHint";

export default function NowHero({
  events,
  scope: controlledScope,
  onScopeChange,
}: {
  events: Event[];
  scope?: TimeScope;
  onScopeChange?: (scope: TimeScope) => void;
}) {
  const now = new Date();

  const [uncontrolledScope, setUncontrolledScope] = useState<TimeScope>("today");
  const scope = controlledScope ?? uncontrolledScope;

  const setScope = (s: TimeScope) => {
    if (!controlledScope) setUncontrolledScope(s);
    onScopeChange?.(s);
  };

  // ✅ 1줄 상태만 계산
  const status = useMemo(() => buildNowStatus(events, scope, now), [events, scope, now]);

  // ✅ minute tick (NEXT 시각 갱신 정도만)
  const [, forceTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceTick((v) => v + 1), 60000);
    return () => clearInterval(t);
  }, []);

  // ✅ PWA hint는 유지하되, 존재감 최소화
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

  const topLabel =
    scope === "today"
      ? "TODAY"
      : scope === "tomorrow"
      ? "TOMORROW"
      : scope === "weekend"
      ? "WEEKEND"
      : "THIS WEEK";

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
              <p className="text-xs tracking-[0.22em] font-semibold text-muted-foreground">
                {topLabel}
              </p>

              {status.kind === "live" && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-border/40 bg-background/60">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-breathe" />
                  LIVE
                </span>
              )}
            </div>

            {/* ✅ 부제는 “확인 도구” 느낌만 */}
            <p className="text-[11px] text-muted-foreground mt-1">
              {scope === "today"
                ? "Quick check"
                : scope === "tomorrow"
                ? "Plan ahead"
                : scope === "weekend"
                ? "Weekend mode"
                : "Browse 7 days"}
            </p>
          </div>

          {/* segmented control */}
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
              <ScopeTab
                label="Tomorrow"
                active={scope === "tomorrow"}
                onClick={() => setScope("tomorrow")}
              />
              <ScopeTab
                label="Weekend"
                active={scope === "weekend"}
                onClick={() => setScope("weekend")}
              />
              <ScopeTab label="Week" active={scope === "week"} onClick={() => setScope("week")} />
            </div>
          </div>
        </div>

        {/* Main status (✅ 딱 1줄) */}
        <div className="w-full px-4 pb-4">
          <p className="text-3xl font-semibold tabular-nums tracking-tight leading-tight">
            {status.text}
          </p>
        </div>
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
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      role="tab"
      aria-selected={active}
      className={[
        "px-2.5 py-1.5 text-[12px] font-semibold rounded-full transition",
        active ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
