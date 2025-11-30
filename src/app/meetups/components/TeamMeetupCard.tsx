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
  const typeLabel =
    meetup.type === "match_attendance"
      ? "🏟️ Match Meetup"
      : meetup.type === "online_game"
      ? "🎮 Online"
      : meetup.type === "pickup_sports"
      ? "🏐 Pickup"
      : "🎉 Fan Meetup";

  /** 🎯 이동 */
  const handleClick = () => router.push(`/meetups/${meetup.id}`);

  return (
    <div
      onClick={handleClick}
      className="
        rounded-2xl border border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-900 p-4 shadow-sm 
        hover:shadow-md active:scale-[0.99]
        transition cursor-pointer space-y-3
      "
    >
      {/* 상단 라벨 */}
      <div className="flex items-center justify-between">
        <span
          className="
            text-[11px] font-medium px-2 py-1 rounded-md 
            text-white shadow-sm
          "
          style={{
            background: "linear-gradient(90deg, var(--primary-from), var(--primary-to))",
          }}
        >
          {typeLabel}
        </span>

        <span className="text-xs font-semibold text-red-500">{ddayLabel}</span>
      </div>

      {/* 제목 */}
      <h3 className="font-semibold text-[15px] line-clamp-1 text-gray-900 dark:text-gray-50">
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

      {/* 참가자 아바타 */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex -space-x-2">
          {(meetup.participantsAvatars ?? []).slice(0, 3).map((url, i) => (
            <img
              key={i}
              src={url}
              className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 object-cover"
            />
          ))}
        </div>

        {meetup.participantsCount > 3 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            +{meetup.participantsCount - 3}
          </span>
        )}
      </div>
    </div>
  );
}
