// src/app/components/home/MapStatusPill.tsx

"use client";

import type { Event } from "@/types";

/* ---------------- helpers ---------------- */

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function formatTime(dt: Date) {
  return dt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
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

  const now = new Date();

  let liveCount = 0;
  let nextAt: Date | null = null;

  for (const e of events as any[]) {
    const status = (e.status ?? "").toUpperCase();
    if (status === "LIVE") liveCount += 1;

    const start = getStartDate(e);
    if (start && start.getTime() > now.getTime()) {
      if (!nextAt || start < nextAt) nextAt = start;
    }
  }

  const where =
    scope === "global"
      ? "across the map"
      : scope === "observer"
      ? "in this city"
      : "nearby";

  let label = "";

  /* ---------------- LIVE ---------------- */

  if (liveCount > 0) {
    label =
      liveCount === 1
        ? `LIVE nearby`
        : `LIVE · ${liveCount} events ${where}`;
  }

  /* ---------------- UPCOMING ---------------- */

  else if (nextAt) {
    const t = formatTime(nextAt);
    const diffMin = Math.round(
      (nextAt.getTime() - now.getTime()) / 60000
    );

    if (diffMin <= 60) {
      label = `Starting in ${diffMin} min · ${where}`;
    } else {
      label = `Next up · ${t} · ${where}`;
    }
  }

  /* ---------------- QUIET ---------------- */

  else {
    label = `Quiet right now · ${where}`;
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
