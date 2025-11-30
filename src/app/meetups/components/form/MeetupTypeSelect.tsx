// src/app/meetups/components/form/MeetupTypeSelect.tsx

"use client";

import React from "react";

type MeetupType =
  | "match_attendance"
  | "pub_gathering"
  | "online_game"
  | "pickup_sports";

interface MeetupTypeSelectProps {
  meetupType: MeetupType;
  setMeetupType: (type: MeetupType) => void;
}

/**
 * ✅ Tailwind 4 + Next.js 15 대응 Meetup Type Selector
 * - 시각적 일관성 및 focus 스타일 개선
 * - 라벨/입력 연결 및 접근성 강화
 */
export default function MeetupTypeSelect({
  meetupType,
  setMeetupType,
}: MeetupTypeSelectProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="meetup-type"
        className="block font-semibold text-gray-800 text-sm"
      >
        Meetup Type
      </label>

      <select
        id="meetup-type"
        className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        value={meetupType}
        onChange={(e) => setMeetupType(e.target.value as MeetupType)}
      >
        <option value="match_attendance">⚽ Watch Match at Stadium</option>
        <option value="pub_gathering">🍻 Watch at Pub</option>
        <option value="online_game">🎮 Online Game</option>
        <option value="pickup_sports">🏃 Pickup Sports</option>
      </select>
    </div>
  );
}
