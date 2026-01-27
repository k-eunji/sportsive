"use client";

import type { Event } from "@/types";

/* ---------------- helpers ---------------- */

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export type MapScope = "user" | "global" | "observer";

/* ---------------- component ---------------- */

export default function MapStatusPill({
  events,
  scope,
}: {
  events: Event[];
  scope: MapScope;
}) {
  if (events.length === 0) return null;

  const now = Date.now();

  let liveCount = 0;
  let nextAt: Date | null = null;

  for (const e of events as any[]) {
    const status = (e.status ?? "").toUpperCase();
    if (status === "LIVE") liveCount += 1;

    const start = getStartDate(e);
    if (start && start.getTime() > now) {
      if (!nextAt || start < nextAt) nextAt = start;
    }
  }

  /* ---------------- where label ---------------- */

  const where =
    scope === "global"
      ? "across the map"
      : scope === "observer"
      ? "in this city"
      : "around you";

  let label: string;

  /* ---------------- LIVE ---------------- */

  if (liveCount > 0) {
    label =
      liveCount === 1
        ? `LIVE · 1 event ${where}`
        : `LIVE · ${liveCount} events ${where}`;
  }

  /* ---------------- UPCOMING (today only) ---------------- */

  else if (nextAt) {
    const t = nextAt.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    // 🔧 핵심 수정:
    // "전체 개수"가 아니라
    // "같은 시간대(±2h)에 몰린 경기 수"만 센다
    const WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours
    const nextTs = nextAt.getTime();

    const clusteredCount = events.filter((e: any) => {
      const s = getStartDate(e);
      if (!s) return false;
      return Math.abs(s.getTime() - nextTs) <= WINDOW_MS;
    }).length;

    if (clusteredCount <= 2) {
      label = `Starting soon · ${t} · ${where}`;
    } else if (clusteredCount <= 4) {
      label = `Warming up · ${t} · a few ${where}`;
    } else {
      label = `Busy later · ${t} · ${where}`;
    }
  }

  /* ---------------- QUIET ---------------- */

  else {
    label =
      events.length > 5
        ? `Quiet now · more later · ${where}`
        : `Quiet right now · ${where}`;
  }

  /* ---------------- render ---------------- */

  return (
    <div
      className="
        pointer-events-none
        fixed
        left-1/2 -translate-x-1/2
        bottom-[calc(env(safe-area-inset-bottom)+96px)]
        z-50
      "
    >
      <div
        className="
          rounded-full
          bg-black/85
          text-white
          text-xs
          font-semibold
          px-4
          py-2
          shadow-lg
          tracking-wide
          whitespace-nowrap
        "
      >
        {label}
      </div>
    </div>
  );
}
