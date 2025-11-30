//src/app/teams/[teamId]/components/TeamMeetupList.tsx

"use client";

import React, { useState, useMemo } from "react";
import TeamMeetupCard from "./TeamMeetupCard";
import { MeetupWithEvent } from "@/types/event";

interface Props {
  matchMeetups: MeetupWithEvent[];
  fanMeetups: MeetupWithEvent[];
  isLoading?: boolean;
}

export default function TeamMeetupList({
  matchMeetups,
  fanMeetups,
  isLoading = false,
}: Props) {
  const [filter, setFilter] = useState<"all" | "match" | "fan">("all");

  // 전체 리스트
  const all = [...matchMeetups, ...fanMeetups];

  // 필터링
  const filtered = useMemo(() => {
    if (filter === "match") return matchMeetups;
    if (filter === "fan") return fanMeetups;
    return all;
  }, [filter, matchMeetups, fanMeetups]);

  return (
    <section className="mt-6 space-y-4">

      {/* 🔥 상단 필터 */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "match", label: "Match" },
          { key: "fan", label: "Fan" },
        ].map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium border transition
                ${isActive
                  ? "text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                }
              `}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(90deg, var(--primary-from), var(--primary-to))",
                      borderColor: "transparent",
                    }
                  : {}
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 섹션 타이틀 */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Meetups
      </h3>

      {/* 🔵 로딩 */}
      {isLoading && (
        <div className="text-center py-10 text-gray-400 animate-pulse">
          Loading meetups...
        </div>
      )}

      {/* ❗ 만약 데이터가 없는 경우 */}
      {!isLoading && filtered.length === 0 && (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          No meetups yet.
        </div>
      )}

      {/* 🟦 리스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((meetup) => (
          <TeamMeetupCard key={meetup.id} meetup={meetup} />
        ))}
      </div>
    </section>
  );
}
