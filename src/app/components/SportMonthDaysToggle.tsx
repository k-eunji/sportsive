//src/app/components/SportMonthDaysToggle.tsx

"use client";

import Link from "next/link";
import { EventList } from "./EventList";

import { useState } from "react";

export function SportMonthDaysToggle({
  monthlyEvents,
  totalMonth,
  sportSlug,
  currentFilters,
  mode = "link"
}: {
  monthlyEvents: any[]
  totalMonth: number
  sportSlug: string
  currentFilters?: string
  mode?: "link" | "toggle"
}) {
  const grouped: Record<string, any[]> = {};
  
  const [openDate, setOpenDate] = useState<string | null>(null);

  monthlyEvents.forEach((e: any) => {
    const raw =
      e.startDate ??
      e.date ??
      e.utcDate;

    if (!raw) return;

    const date = raw.slice(0, 10);

    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(e);
  });

  const sorted = Object.entries(grouped)
    .sort(
      (a, b) =>
        new Date(a[0]).getTime() -
        new Date(b[0]).getTime()
    );

  return (
    <ul className="space-y-3 text-sm">
      {sorted.map(([date, events]) => {
        const count = events.length;

        const percentage =
          totalMonth > 0
            ? ((count / totalMonth) * 100).toFixed(1)
            : "0.0";

        const query = new URLSearchParams({
          sport: sportSlug,
          ...(currentFilters
            ? Object.fromEntries(
                new URLSearchParams(currentFilters)
              )
            : {}),
        }).toString();

        return (
          <li key={date}>

            {mode === "toggle" ? (

              <button
                onClick={() =>
                  setOpenDate(openDate === date ? null : date)
                }
                className="flex w-full justify-between items-center px-4 py-3 rounded-lg hover:bg-muted/40 transition"
              >
                <span>{date}</span>

                <span className="flex items-center gap-2 text-muted-foreground">
                  {count} ({percentage}%)
                  <span className="text-base opacity-60">
                    {openDate === date ? "−" : "›"}
                  </span>
                </span>
              </button>

            ) : (

              <Link
                href={`/date/${date}?${query}`}
                className="flex justify-between items-center px-4 py-3 rounded-lg hover:bg-muted/40 transition"
              >
                <span>{date}</span>

                <span className="flex items-center gap-2 text-muted-foreground">
                  {count} ({percentage}%)
                  <span className="text-base opacity-60">›</span>
                </span>
              </Link>

            )}

            {mode === "toggle" && openDate === date && (
              <div className="pt-3">
                <EventList
                  events={events}
                  startFromFirstEvent
                  fixedStartDate={date}
                />
              </div>
            )}

          </li>
        );
      })}
    </ul>
  );
}