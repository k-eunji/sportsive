//src/app/components/map-hero/TomorrowTease.tsx

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

function hour(d: Date) {
  return d.getHours();
}

export default function TomorrowTease({ events }: { events: Event[] }) {
  const tease = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEvents = events.filter((e: any) => {
      const dt = new Date(e.date ?? e.utcDate);
      return isSameDay(dt, today);
    });

    const tomorrowEvents = events.filter((e: any) => {
      const dt = new Date(e.date ?? e.utcDate);
      return isSameDay(dt, tomorrow);
    });

    const tomorrowEvening = tomorrowEvents.filter((e: any) => {
      const dt = new Date(e.date ?? e.utcDate);
      return hour(dt) >= 18;
    });

    const todaySports = new Set(
      todayEvents.map((e: any) => (e.sport ?? e.league ?? "").toString()).filter(Boolean)
    );
    const tomorrowSports = new Set(
      tomorrowEvents.map((e: any) => (e.sport ?? e.league ?? "").toString()).filter(Boolean)
    );

    const newSport = [...tomorrowSports].find((s) => !todaySports.has(s));

    return {
      tomorrowCount: tomorrowEvents.length,
      tomorrowEveningCount: tomorrowEvening.length,
      newSport,
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
        pointer-events-none
        rounded-xl
        px-4 py-3
        bg-gradient-to-r
        from-white/90 to-white/60
        dark:from-black/60 dark:to-black/40
        backdrop-blur-md
        shadow-[0_8px_24px_rgba(0,0,0,0.08)]
      "
    >
      <div className="flex items-start gap-3">
        <div className="w-[3px] rounded-full bg-red-500/70 mt-1" />

        <div className="flex-1 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500">
              Tomorrow near you · {tease.dateLabel}
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
              A different snapshot is forming.
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-sm font-medium">
              {tease.tomorrowCount} matches
            </p>
            <p className="text-xs text-gray-500">
              {tease.tomorrowEveningCount > 0
                ? `${tease.tomorrowEveningCount} start in the evening`
                : "New timings show up"}
            </p>
          </div>
        </div>
      </div>

      {tease.newSport && (
        <p className="text-xs text-gray-500 mt-2 ml-[18px]">
          A different sport may appear:{" "}
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {tease.newSport}
          </span>
        </p>
      )}
    </div>
  );
}
