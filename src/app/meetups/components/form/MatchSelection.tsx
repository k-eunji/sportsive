// src/app/meetups/components/form/MatchSelection.tsx

"use client";

import React, { useState, useMemo } from "react";
import type { Event } from "@/types";
import type { MeetupFormReturn } from "@/app/meetups/hooks/useMeetupForm";

interface MatchSelectionProps {
  form: Pick<
    MeetupFormReturn,
    "selectedEvent" | "setSelectedEvent" | "cheerTeam" | "setCheerTeam"
  >;
  upcomingEvents: Event[];
}

export default function MatchSelection({ form, upcomingEvents }: MatchSelectionProps) {
  const { selectedEvent, setSelectedEvent, cheerTeam, setCheerTeam } = form;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // --- 검색 적용 ---
  const filtered = useMemo(() => {
    return upcomingEvents.filter((ev) =>
      `${ev.homeTeam} ${ev.awayTeam}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, upcomingEvents]);

  // --- 날짜 그룹핑 ---
  const grouped = useMemo(() => {
    const groups: Record<string, Event[]> = {};

    filtered.forEach((ev) => {
      const date = new Date(ev.date);
      const key = date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }); // e.g. "Sat, 11 Nov"

      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });

    return groups;
  }, [filtered]);

  return (
    <>
      {/* Label */}
      <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
        Select Match
      </p>

      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="
          w-full text-left border-b border-gray-300 py-2
          text-[15px] bg-transparent
        "
      >
        {selectedEvent
          ? `${selectedEvent.homeTeam} vs ${selectedEvent.awayTeam}`
          : "Choose a match"}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-end z-[9999]">
          <div className="w-full max-w-lg bg-white rounded-t-2xl pt-5 pb-6">

            {/* Header */}
            <div className="px-4 flex justify-between items-center mb-3">
              <h3 className="text-[18px] font-semibold">Select Match</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-[22px] text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="px-4 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search match"
                className="
                  w-full border-b border-gray-300 py-2
                  text-[15px] bg-transparent focus:border-black
                "
              />
            </div>

            {/* Match list */}
            <div className="max-h-[50vh] overflow-y-auto px-2 space-y-5">
              {Object.keys(grouped).length === 0 && (
                <p className="text-center text-gray-500 py-3 text-[14px]">
                  No matches found
                </p>
              )}

              {Object.entries(grouped).map(([dateLabel, matches]) => (
                <div key={dateLabel} className="px-3">

                  {/* --- DATE HEADER --- */}
                  <p className="text-[13px] font-semibold text-gray-700 mb-2">
                    {dateLabel}
                  </p>

                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    {matches.map((ev, idx) => (
                      <button
                        key={ev.id}
                        onClick={() => {
                          setSelectedEvent(ev);
                          setOpen(false);
                        }}
                        className="
                          w-full text-left px-4 py-3
                          text-[15px] bg-white
                          border-b border-gray-200
                          hover:bg-gray-50 transition
                        "
                      >
                        <div className="font-medium">
                          {ev.homeTeam} vs {ev.awayTeam}
                        </div>

                        <div className="text-[13px] text-gray-500 mt-1">
                          {new Date(ev.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>

                        {/* 마지막 아이템은 바텀 border 제거 */}
                        {idx === matches.length - 1 && (
                          <div className="border-none" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cheer Team */}
      {selectedEvent && (
        <div className="mt-5">
          <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
            Cheer For
          </p>

          <div className="flex gap-5 text-[15px]">
            {(["home", "away"] as const).map((side) => (
              <button
                key={side}
                onClick={() => setCheerTeam(side)}
                className={`
                  transition pb-1
                  ${
                    cheerTeam === side
                      ? "font-semibold border-b-2 border-black"
                      : "text-gray-500"
                  }
                `}
              >
                {side === "home"
                  ? selectedEvent.homeTeam
                  : selectedEvent.awayTeam}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
