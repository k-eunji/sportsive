//src/app/components/MonthDaysToggle.tsx

"use client";

import { useState } from "react";
import type { Event } from "@/types";
import { EventList } from "./EventList";

export function MonthDaysToggle({
  monthlyEvents,
  totalMonth,
}: {
  monthlyEvents: Event[];
  totalMonth: number;
}) {
  const [openDate, setOpenDate] = useState<string | null>(null);

  // 날짜별 그룹핑
  const grouped: Record<string, Event[]> = {};

  monthlyEvents.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });

  const sorted = Object.entries(grouped).sort(
    (a, b) => b[1].length - a[1].length
  );

  function toggle(date: string) {
    setOpenDate((prev) => (prev === date ? null : date));
  }

  return (
    <div className="space-y-3">
      {sorted.map(([date, events]) => {
        const isOpen = openDate === date;
        const count = events.length;

        const percentage =
          totalMonth > 0
            ? ((count / totalMonth) * 100).toFixed(1)
            : "0.0";

        return (
          <div
            key={date}
            className={`rounded-xl bg-white transition ${
              isOpen ? "shadow-md" : ""
            }`}
          >
            <button
              onClick={() => toggle(date)}
              className="w-full flex justify-between items-center px-4 py-4 text-sm hover:bg-gray-50 transition"
            >
              <span>{date}</span>

              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="tabular-nums">
                  {count} meetings
                </span>
                <span className="text-xs">
                  ({percentage}%)
                </span>
                <span
                  className={`transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden border-t border-gray-100">
                <div className="px-4 py-4">
                  <EventList
                    events={events}
                    fixedStartDate={date}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}