// src/app/components/list/WeekendList.tsx

"use client";

import { useMemo, useState } from "react";
import type { Event } from "@/types";
import EventListItem from "@/app/components/list/EventListItem";
import type { TimeScope } from "@/lib/nowDashboard";

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function inScope(e: any, scope: TimeScope, now: Date) {
  // 공통: scope별 범위 계산
  const base = startOfLocalDay(now);

  let scopeStart: Date;
  let scopeEnd: Date;

  switch (scope) {
    case "today":
      scopeStart = base;
      scopeEnd = new Date(base.getTime() + 86400000);
      break;

    case "tomorrow":
      scopeStart = new Date(base.getTime() + 86400000);
      scopeEnd = new Date(base.getTime() + 2 * 86400000);
      break;

    case "weekend": {
      const wk = nextWeekendRange(now);
      scopeStart = wk.start;
      scopeEnd = wk.end;
      break;
    }

    case "week":
    default:
      scopeStart = now;
      scopeEnd = new Date(base.getTime() + 7 * 86400000);
      break;
  }

  // ✅ SESSION EVENT (darts / tournaments / horse racing)
  if (e.kind === "session" && e.startDate) {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate ?? e.startDate);

    // 날짜만 있으면 하루 전체
    if (e.startDate.length === 10) {
      start.setHours(0, 0, 0, 0);
    }
    if ((e.endDate ?? e.startDate)?.length === 10) {
      end.setHours(23, 59, 59, 999);
    }

    // 🔥 핵심: overlap
    return start < scopeEnd && end > scopeStart;
  }

  // ✅ MATCH / POINT EVENT
  const start = getStartDate(e);
  if (!start) return false;

  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // 기본 지속시간

  return start < scopeEnd && end > scopeStart;
}

export default function WeekendList({
  title,
  subtitle,
  events,
  defaultScope,
}: {
  title: string;
  subtitle: string;
  events: Event[];
  defaultScope: TimeScope;
}) {
  const [scope, setScope] = useState<TimeScope>(defaultScope);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const now = new Date();

    return events
      .filter((e) => inScope(e, scope, now))
      .filter((e: any) => {
        if (!q) return true;
        const s = `${e.title ?? ""} ${e.sport ?? ""} ${e.city ?? ""}`.toLowerCase();
        return s.includes(q.toLowerCase());
      })
      .sort((a: any, b: any) => {
        const aStart = getStartDate(a)?.getTime() ?? 0;
        const bStart = getStartDate(b)?.getTime() ?? 0;
        return aStart - bStart;
      });
  }, [events, scope, q]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {subtitle}
          </p>
        </div>

        <a
          href="/app"
          className="shrink-0 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-black/90 transition"
        >
          Open map
        </a>
      </header>

      {/* Scope tabs */}
      <div className="flex items-center gap-2">
        {(["today", "tomorrow", "weekend", "week"] as TimeScope[]).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={[
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition",
              scope === s
                ? "bg-black text-white border-black"
                : "border-border/60 text-muted-foreground",
            ].join(" ")}
          >
            {s === "today"
              ? "Today"
              : s === "tomorrow"
              ? "Tomorrow"
              : s === "weekend"
              ? "This weekend"
              : "This week"}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search team / venue / sport"
        className="w-full h-11 rounded-xl bg-muted/40 px-4 text-sm outline-none"
      />

      {/* List */}
      <section className="divide-y">
        {filtered.map((e) => (
          <EventListItem key={e.id} event={e} />
        ))}

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nothing in this scope.
          </p>
        )}
      </section>
    </main>
  );
}
