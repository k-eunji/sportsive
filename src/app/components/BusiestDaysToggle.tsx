///src/app/components/BusiestDaysToggle.tsx

"use client";

import { useState } from "react";
import type { Event } from "@/types";
import { EventList } from "./EventList";

export function BusiestDaysToggle({
  days,
  allEvents,
}: {
  days: [string, number][];
  allEvents: Event[];
}) {
  const [openDate, setOpenDate] = useState<string | null>(null);

  // 평균 계산
  const grouped: Record<string, number> = {};
  allEvents.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    grouped[d] = (grouped[d] || 0) + 1;
  });

  const avg =
    Object.keys(grouped).length > 0
      ? Math.round(allEvents.length / Object.keys(grouped).length)
      : 0;

  const totalMeetings = allEvents.length;    

  function toggle(date: string) {
    setOpenDate((prev) => (prev === date ? null : date));
  }

  return (
    <div className="space-y-3">
      {days.map(([date, count], i) => {
        const isOpen = openDate === date;
        const isAboveAvg = count > avg;

        const percentage =
          totalMeetings > 0
            ? ((count / totalMeetings) * 100).toFixed(1)
            : "0.0";

        const eventsForDay = allEvents.filter(
          (e: any) => (e.startDate ?? "").slice(0, 10) === date
        );

        return (
          <div
            key={date}
            className={`
              rounded-xl bg-white transition
              ${isOpen ? "shadow-md" : ""}
            `}
          >
            <button
              onClick={() => toggle(date)}
              className="w-full flex justify-between items-center px-4 py-4 text-sm hover:bg-gray-50 transition"
            >
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  #{i + 1}
                </span>

                <span>
                  {date}
                </span>

                {isAboveAvg && (
                  <span className="text-xs text-muted-foreground">
                    (above average)
                  </span>
                )}
              </span>

              <span
                className={`font-medium flex items-center gap-2 ${
                  isAboveAvg ? "text-black" : "text-muted-foreground"
                }`}
              >
                <span className="tabular-nums">
                  {count} meetings
                </span>
                <span className="text-xs text-muted-foreground">
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

            {/* Animated Content */}
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
                    events={eventsForDay}
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