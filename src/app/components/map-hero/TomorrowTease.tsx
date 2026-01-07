// src/app/components/map-hero/TomorrowTease.tsx
"use client";

import { useMemo } from "react";
import type { Event } from "@/types";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function TomorrowTease({ events }: { events: Event[] }) {
  const tease = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowEvents = events.filter((e: any) => {
      const dt = new Date(e.date ?? e.utcDate);
      return isSameDay(dt, tomorrow);
    });

    return {
      tomorrowCount: tomorrowEvents.length,
      dateLabel: tomorrow.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
  }, [events]);

  if (tease.tomorrowCount <= 0) return null;

  return (
    <div
      className="
        rounded-2xl
        border border-border/60
        bg-background/60
        backdrop-blur
        shadow-sm shadow-black/5
        px-4 py-3
      "
    >
      <p className="text-[11px] uppercase tracking-widest text-gray-500">
        Tomorrow near you · {tease.dateLabel}
      </p>

      <div className="mt-1 flex items-end justify-between gap-4">
        <p className="text-sm text-gray-900 dark:text-gray-100">
          A different snapshot is forming.
        </p>

        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 shrink-0">
          {tease.tomorrowCount} matches
        </p>
      </div>
    </div>
  );
}
