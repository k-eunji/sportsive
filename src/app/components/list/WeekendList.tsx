// src/app/components/list/WeekendList.tsx

"use client";

import { useMemo, useState } from "react";
import type { Event } from "@/types";
import type { TimeScope } from "@/lib/nowDashboard";
import { getEventTimeState } from "@/lib/eventTime";


/* =========================
   DATE HELPERS
========================= */

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isHorseRacing(e: any) {
  if (typeof e.sport !== "string") return false;
  return e.sport
    .toLowerCase()
    .replace(/[\s_]/g, "-") === "horse-racing";
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

/* =========================
   SCOPE FILTER
========================= */

function inScope(e: any, scope: TimeScope, now: Date) {
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

  // SESSION EVENT
  if (e.kind === "session" && e.startDate) {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate ?? e.startDate);

    if (e.startDate.length === 10) start.setHours(0, 0, 0, 0);
    if ((e.endDate ?? e.startDate)?.length === 10)
      end.setHours(23, 59, 59, 999);

    return start < scopeEnd && end > scopeStart;
  }

  // MATCH
  const start = getStartDate(e);
  if (!start) return false;

  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  return start < scopeEnd && end > scopeStart;
}

/* =========================
   DISPLAY HELPERS
========================= */

function formatTime(e: any) {
  // 🐎 horse racing → 무조건 session label
  if (isHorseRacing(e)) {
    return (
      e.payload?.sessionTime ??
      e.sessionTime ??
      "Session"
    );
  }

  // 🟣 generic session (tennis / darts tournaments)
  if (e.kind === "session") {
    return "All day";
  }

  // ⚽️ normal match
  const d = getStartDate(e);
  if (!d) return "—";

  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function titleOf(e: any) {
  if (e.sport === "horse-racing") {
    if (e.title && e.code) return `${e.title} · ${e.code}`;
    return e.title ?? "Horse racing";
  }
  if (e.sport === "tennis" || e.sport === "darts") {
    return e.title ?? "Event";
  }
  if (e.homeTeam && e.awayTeam) {
    return `${e.homeTeam} vs ${e.awayTeam}`;
  }
  return e.title ?? "Event";
}

function metaOf(e: any) {
  const parts = [];
  if (e.venue) parts.push(e.venue);
  if (e.city) parts.push(e.city);
  return parts.join(" · ");
}

/* =========================
   TIMETABLE ROW
========================= */

function TimetableRow({
  time,
  title,
  meta,
  status,
}: {
  time: string;
  title: string;
  meta: string;
  status: "LIVE" | "SOON" | "UPCOMING" | "ENDED";
}) {
  return (
    <div className="px-2 py-3 flex gap-4 hover:bg-muted/40 transition">
      <div className="w-14 text-xs font-semibold text-muted-foreground">
        {time}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{meta}</p>
      </div>
      <div
        className={[
          "text-xs font-semibold",
          status === "LIVE"
            ? "text-red-600"
            : status === "SOON"
            ? "text-amber-600"
            : "text-muted-foreground",
        ].join(" ")}
      >
        {status}
      </div>
    </div>
  );
}

/* =========================
   MAIN
========================= */

export default function WeekendList({
  title,
  subtitle,
  events,
  defaultScope,
  statusText,
}: {
  title: string;
  subtitle: string;
  events: Event[];
  defaultScope: TimeScope;
  statusText?: string;
}) {
  const [scope, setScope] = useState<TimeScope>(defaultScope);
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const now = new Date();

    const filtered = events
      .filter((e) => inScope(e, scope, now))
      .filter((e: any) => {
        if (!q) return true;
        const s = `${titleOf(e)} ${e.sport ?? ""} ${e.city ?? ""}`.toLowerCase();
        return s.includes(q.toLowerCase());
      })
      .sort((a: any, b: any) => {
        const aStart = getStartDate(a)?.getTime() ?? 0;
        const bStart = getStartDate(b)?.getTime() ?? 0;
        return aStart - bStart;
      });

    return filtered.reduce<Record<string, Event[]>>((acc, e) => {
      const key = e.sport ?? "other";
      acc[key] ||= [];
      acc[key].push(e);
      return acc;
    }, {});
  }, [events, scope, q]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{title}</h1>
          {statusText && (
            <p className="mt-1 text-sm font-medium text-foreground">
              {statusText}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>

        <a
          href="/app"
          className="shrink-0 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-black/90 transition"
        >
          Open map
        </a>
      </header>

      {/* SCOPE */}
      <div className="flex gap-2">
        {(["today", "tomorrow", "weekend", "week"] as TimeScope[]).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={[
              "px-3 py-1.5 rounded-full text-xs font-semibold border",
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

      {/* SEARCH */}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search team / venue / sport"
        className="w-full h-11 rounded-xl bg-muted/40 px-4 text-sm outline-none"
      />

      {/* LIST */}
      <section className="divide-y">
        {Object.entries(grouped).map(([sport, list]) => (
          <div key={sport}>
            <h3 className="mt-6 mb-2 text-sm font-semibold">
              {sport}
            </h3>

            {list.map((e) => (
              <TimetableRow
                key={e.id}
                time={formatTime(e)}
                title={titleOf(e)}
                meta={metaOf(e)}
                status={getEventTimeState(e)}
              />
            ))}
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nothing in this scope.
          </p>
        )}
      </section>
    </main>
  );
}
