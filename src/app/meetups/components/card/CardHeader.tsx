//src/app/meetups/components/card/CardHeader.tsx

"use client";

import React from "react";
import { MeetupWithEvent } from "@/types/event";

export default function CardHeader({ meetup }: { meetup: MeetupWithEvent }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-[11px] text-gray-700 dark:text-gray-300">

      {/* 타입 */}
      <span className="px-2 py-[1px] rounded border border-gray-300 dark:border-gray-700">
        {labelFromType(meetup.type)}
      </span>

      {/* 온라인 게임 이름 */}
      {meetup.type === "online_game" && meetup.onlineGameName && (
        <span className="px-2 py-[1px] rounded border border-purple-400/40 text-purple-600 dark:text-purple-300">
          🎮 {meetup.onlineGameName}
        </span>
      )}

      {/* Skill Level */}
      {(meetup.type === "online_game" || meetup.type === "pickup_sports") &&
        meetup.skillLevel && (
          <span className="px-2 py-[1px] rounded border border-blue-400/40 text-blue-600 dark:text-blue-300">
            {meetup.skillLevel}
          </span>
      )}

      {/* Sport Type */}
      {meetup.sportType && (
        <span className="px-2 py-[1px] rounded border border-amber-400/40 text-amber-600 dark:text-amber-300">
          🏅 {meetup.sportType}
        </span>
      )}

      {/* Age Limit */}
      {(meetup.ageFrom != null && meetup.ageTo != null) ? (
        <span className="px-2 py-[1px] rounded border border-pink-400/40 text-pink-600 dark:text-pink-300">
          {meetup.ageFrom} - {meetup.ageTo}
        </span>
      ) : meetup.ageLimit && (
        <span className="px-2 py-[1px] rounded border border-pink-400/40 text-pink-600 dark:text-pink-300">
          {meetup.ageLimit}
        </span>
      )}

      {/* Match: Home vs Away */}
      {(meetup.event?.homeTeam || meetup.event?.awayTeam) && (
        <span className="px-2 py-[1px] rounded border border-gray-300 dark:border-gray-700">
          {meetup.event?.homeTeam} vs {meetup.event?.awayTeam}
        </span>
      )}

      {/* ⭐ Cheer For → 팀 이름으로 표시 */}
      {meetup.type === "match_attendance" && (
        <span className="px-2 py-[1px] rounded border border-green-400/40 text-green-600 dark:text-green-300">
          🎉 Cheer: {getCheerTeamName(meetup)}
        </span>
      )}
    </div>
  );
}

function labelFromType(type: string) {
  return {
    match_attendance: "Match",
    pub_gathering: "Pub",
    online_game: "Online",
    pickup_sports: "Pickup",
    other: "Other",
  }[type] || "Meetup";
}

/** ⭐ cheerTeam을 실제 팀 이름으로 변환 */
function getCheerTeamName(meetup: MeetupWithEvent) {
  if (meetup.teamType === "home") return meetup.event?.homeTeam || "Home";
  if (meetup.teamType === "away") return meetup.event?.awayTeam || "Away";
  return "Neutral";
}
