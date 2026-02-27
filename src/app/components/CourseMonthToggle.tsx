//src/app/components/CourseMonthToggle.tsx

"use client";

import { useState } from "react";
import { EventList } from "./EventList";
import type { Event } from "@/types";

export function CourseMonthToggle({
  monthKey,
  events,
  courseTotal,
}: {
  monthKey: string;
  events: Event[];
  courseTotal: number;
}) {
  const [open, setOpen] = useState(false);

  const monthLabel = new Date(`${monthKey}-01`).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const total = events.length;
  
  const percentage =
    courseTotal > 0
      ? ((total / courseTotal) * 100).toFixed(1)
      : "0.0";

  return (
    <div
      className={`
        rounded-xl bg-white transition
        ${open ? "shadow-md" : ""}
      `}
    >
      {/* ===== Header ===== */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 py-4 text-sm hover:bg-gray-50 transition"
      >
        <span className="font-medium">
          {monthLabel}
        </span>

        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="tabular-nums">
            {total} meetings
          </span>
          <span className="text-xs text-muted-foreground">
            ({percentage}%)
          </span>

          <span
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </span>
      </button>

      {/* ===== Animated Content ===== */}
      <div
        className={`grid transition-all duration-300 ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden border-t border-gray-100">
          <div className="px-4 py-4">
            <EventList
              events={events}
              startFromFirstEvent
              fixedStartDate={`${monthKey}-01`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}