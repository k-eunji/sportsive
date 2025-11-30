//src/app/teams/[teamId]/components/TeamMeetupCard.tsx

"use client";

import { MeetupWithEvent } from "@/types/event";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

export default function TeamMeetupCard({ meetup }: { meetup: MeetupWithEvent }) {
  const router = useRouter();

  /** 🧮 D-Day 계산 */
  const getDDay = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = date.getTime() - now.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Closed";
    if (diffDays === 0) return "D-Day";
    return `D-${diffDays}`;
  };

  const ddayLabel = useMemo(() => getDDay(meetup.datetime), [meetup.datetime]);

  /** 🏷️ 타입 라벨 */
  const typeEmoji =
    meetup.type === "match_attendance"
      ? "🏟️"
      : meetup.type === "pickup_sports"
      ? "🏐"
      : meetup.type === "online_game"
      ? "🎮"
      : "🎉";

  const typeLabel =
    meetup.type === "match_attendance"
      ? "Match Meetup"
      : meetup.type === "online_game"
      ? "Online Game"
      : meetup.type === "pickup_sports"
      ? "Pickup Sports"
      : "Fan Meetup";

  const hasMatch =
    meetup.event?.homeTeam && meetup.event?.awayTeam;

  const handleClick = () => router.push(`/meetups/${meetup.id}`);

  return (
    <div
      onClick={handleClick}
      className="
        rounded-2xl border border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-900 shadow-sm 
        hover:shadow-lg active:scale-[0.98]
        transition cursor-pointer
        overflow-hidden
      "
    >
      {/* =========================== */}
      {/* 🏟️ SPORTS HEADER */}
      {/* =========================== */}
      <div
        className="
          px-4 py-3 flex items-center justify-between
          border-b border-gray-100 dark:border-gray-800
        "
        style={{
          background:
            "linear-gradient(90deg, var(--primary-from), var(--primary-to))",
        }}
      >
        <span className="flex items-center gap-1 text-xs font-semibold text-white tracking-wide">
          {typeEmoji} {typeLabel}
        </span>

        {/* D-Day */}
        <span
          className="
            text-[10px] font-bold px-2 py-0.5 rounded-md 
            bg-black/30 text-white backdrop-blur-sm
          "
        >
          {ddayLabel}
        </span>
      </div>

      {/* =========================== */}
      {/* ⚔️ MATCHUP SECTION */}
      {/* =========================== */}
      {hasMatch && (
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col items-center text-xs font-medium">
            <span className="text-gray-800 dark:text-gray-100">
              {meetup.event?.homeTeam}
            </span>
          </div>

          <span className="text-gray-400 font-semibold text-[10px]">VS</span>

          <div className="flex flex-col items-center text-xs font-medium">
            <span className="text-gray-800 dark:text-gray-100">
              {meetup.event?.awayTeam}
            </span>
          </div>
        </div>
      )}

      {/* =========================== */}
      {/* 📍 MAIN INFO */}
      {/* =========================== */}
      <div className="px-4 py-3 space-y-1.5">
        {/* 제목 */}
        <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-50 line-clamp-1">
          {meetup.title}
        </h3>

        {/* 장소 */}
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
          📍 {meetup.location?.name || "TBA"}
        </p>

        {/* 날짜 */}
        <p className="text-xs text-gray-400">
          {new Intl.DateTimeFormat("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(new Date(meetup.datetime))}
        </p>
      </div>

      {/* =========================== */}
      {/* 🧑‍🤝‍🧑 PARTICIPANTS */}
      {/* =========================== */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {(meetup.participantsAvatars ?? []).slice(0, 4).map((url, i) => (
              <img
                key={i}
                src={url}
                className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 object-cover"
              />
            ))}
          </div>

          {meetup.participantsCount > 4 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{meetup.participantsCount - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
