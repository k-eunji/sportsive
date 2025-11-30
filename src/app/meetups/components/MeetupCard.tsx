// src/app/meetups/components/MeetupCard.tsx

"use client";

import { useRouter } from "next/navigation";
import { MeetupWithEvent } from "@/types/event";
import CardThumbnail from "./card/CardThumbnail";
import CardHost from "./card/CardHost";
import CardMainInfo from "./card/CardMainInfo";
import CardParticipants from "./card/CardParticipants";
import CardHeader from "./card/CardHeader";
import { getDDay } from "./card/utils";

export default function MeetupCard({ meetup }: { meetup: MeetupWithEvent }) {
  const router = useRouter();
  const ddayLabel = getDDay(meetup.datetime, meetup.applicationDeadline);

  return (
    <div
      onClick={() => router.push(`/meetups/${meetup.id}`)}
      className="
        flex gap-4 py-4 cursor-pointer
        border-b border-gray-200 dark:border-gray-800
        hover:bg-gray-50/40 dark:hover:bg-gray-900/20
        transition-colors
      "
    >
      {/* Thumbnail (mobile smaller) */}
      <div className="sm:hidden">
        <CardThumbnail meetup={meetup} size="mobile" />
      </div>
      <div className="hidden sm:block">
        <CardThumbnail meetup={meetup} size="desktop" />
      </div>

      {/* Right Content */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Title + D-day */}
        <div className="flex items-center justify-between mb-1">
          <p className="
            text-[14px] sm:text-[15px]
            font-semibold text-gray-900 dark:text-gray-100 truncate
          ">
            {meetup.title}
          </p>

          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 shrink-0">
            {ddayLabel}
          </span>
        </div>

        {/* Host */}
        <CardHost hostId={meetup.hostId} />

        {/* Info */}
        <div className="
          flex flex-col gap-1 mt-1
          text-[12px] sm:text-[13px]
          text-gray-600 dark:text-gray-400
        ">
          <CardMainInfo meetup={meetup} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1 mt-2 line-clamp-2">
          <CardHeader meetup={meetup} />
        </div>

        {/* Participants (mobile tighter spacing) */}
        <div className="mt-2 sm:mt-3">
          <CardParticipants meetup={meetup} compactMobile />
        </div>
      </div>
    </div>
  );
}
