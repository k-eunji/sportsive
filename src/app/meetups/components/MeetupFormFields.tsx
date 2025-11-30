// src/app/meetups/components/MeetupFormFields.tsx

"use client";

import React from "react";
import type { Event } from "@/types";
import type { MeetupFormReturn } from "@/app/meetups/hooks/useMeetupForm";

import {
  MatchSelection,
  OnlineGameFields,
  VenueFields,
  ParticipantsFields,
  ExtraFields,
  MeetupImageSelector,
} from "./form";

type MeetupType =
  | "match_attendance"
  | "pub_gathering"
  | "online_game"
  | "pickup_sports";

interface Props {
  form: MeetupFormReturn;
  meetupType: MeetupType;
  setMeetupType: (t: MeetupType) => void;
  upcomingEvents: Event[];
}

export default function MeetupFormFields({
  form,
  meetupType,
  setMeetupType,
  upcomingEvents,
}: Props) {
  const sports = [
    { id: "football", label: "Football", icon: "⚽" },
    { id: "rugby", label: "Rugby", icon: "🏉" },
    { id: "cricket", label: "Cricket", icon: "🏏" },
    { id: "tennis", label: "Tennis", icon: "🎾" },
    { id: "golf", label: "Golf", icon: "🏌️" },
    { id: "f1", label: "F1", icon: "🏎️" },
    { id: "boxing", label: "Boxing", icon: "🥊" },
    { id: "cycling", label: "Cycling", icon: "🚴" },
    { id: "other", label: "Other", icon: "🏅" },
  ];

  return (
    <div>
      {/* ─────────────────────────── */}
      {/* ① 스포츠 선택 (맨 위) */}
      {/* ─────────────────────────── */}

      <div className="flex flex-wrap gap-4 px-4 pt-2 pb-3">
        {sports.map((s) => (
          <button
            key={s.id}
            onClick={() => form.setSportType(s.id)}
            className={`
              text-[15px] transition
              ${
                form.sportType === s.id
                  ? "font-semibold underline text-black"
                  : "text-gray-500 hover:text-black"
              }
            `}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="h-[1px] bg-gray-200 mb-3 mx-4" />

      {/* ─────────────────────────── */}
      {/* ② Meetup Type 탭 */}
      {/* ─────────────────────────── */}
      <div className="flex gap-6 px-4 py-2">
        {[
          { id: "match_attendance", label: "Match" },
          { id: "pub_gathering", label: "Pub" },
          { id: "online_game", label: "Online" },
          { id: "pickup_sports", label: "Pickup" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setMeetupType(t.id as MeetupType)}
            className={`
              pb-1 text-[15px]
              ${
                meetupType === t.id
                  ? "font-semibold border-b-2 border-black"
                  : "text-gray-500"
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="h-[1px] bg-gray-200 mb-4 mx-4" />

      {/* ─────────────────────────── */}
      {/* ③ 제목 */}
      {/* ─────────────────────────── */}
      <div className="px-4 mb-6">
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Title
        </p>

        <input
          className="
            w-full border-b border-gray-300 bg-transparent py-2
            text-[15px] focus:border-black
          "
          value={form.title}
          onChange={(e) => form.setTitle(e.target.value)}
          placeholder="Enter meetup title"
        />
      </div>

      {/* ─────────────────────────── */}
      {/* ④ 유형별 필드 */}
      {/* ─────────────────────────── */}
      <div className="px-4 mb-6">
        {meetupType === "match_attendance" ||
        meetupType === "pub_gathering" ? (
          <MatchSelection form={form} upcomingEvents={upcomingEvents} />
        ) : null}

        {meetupType === "online_game" && (
          <OnlineGameFields form={form} />
        )}
      </div>

      {/* ─────────────────────────── */}
      {/* ⑤ 이미지 업로드 */}
      {/* ─────────────────────────── */}
      <div className="px-4 mb-6">
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Cover Image
        </p>

        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={form.useCustomImage}
            onChange={(e) => form.setUseCustomImage(e.target.checked)}
            className="accent-black scale-90"
          />
          <span className="text-[14px] text-gray-700">
            Upload custom image
          </span>
        </label>

        {form.useCustomImage && (
          <MeetupImageSelector
            autoImageUrl={form.autoImageUrl}
            customImage={form.customImage}
            setCustomImage={form.setCustomImage}
          />
        )}
      </div>

      {/* ─────────────────────────── */}
      {/* ⑥ venue, participants, details */}
      {/* ─────────────────────────── */}

      <div className="px-4 mb-6">
        <VenueFields form={form} meetupType={meetupType} />
      </div>

      <div className="px-4 mb-6">
        <ParticipantsFields form={form} meetupType={meetupType} />
      </div>

      <div className="px-4 mb-20">
        <ExtraFields form={form}/>
      </div>
    </div>
  );
}
