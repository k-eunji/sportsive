// src/app/components/home/MapStatusPill.tsx
"use client";

import type { Event } from "@/types";

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export default function MapStatusPill({ events }: { events: Event[] }) {
  const now = Date.now();

  let live = 0;
  let nextAt: Date | null = null;

  for (const e of events as any[]) {
    const status = (e.status ?? "").toUpperCase();
    if (status === "LIVE") live += 1;

    const start = getStartDate(e);
    if (start && start.getTime() > now) {
      if (!nextAt || start < nextAt) nextAt = start;
    }
  }

  if (events.length === 0) return null;

  let label: string;

  if (live > 0) {
    label = "LIVE around you";
  } else if (nextAt) {
    const t = nextAt.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    label = `Next starts at ${t}`;
  } else {
    label = "Quiet right now";
  }

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
