//src/app/meetups/components/card/CardMainInfo.tsx

"use client";

import React from "react";
import { MeetupWithEvent } from "@/types/event";

export default function CardMainInfo({ meetup }: { meetup: MeetupWithEvent }) {
  return (
    <div className="space-y-[2px]">
      
      {/* DATE */}
      <p className="text-[13px] text-gray-600 dark:text-gray-400">
        {new Intl.DateTimeFormat("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date(meetup.datetime))}
      </p>

      {/* DEADLINE */}
      {meetup.applicationDeadline && (
        <p className="text-[12px] text-red-600 dark:text-red-400">
          Closes:{" "}
          {new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(new Date(meetup.applicationDeadline))}
        </p>
      )}

      {/* LOCATION */}
      <p className="text-[13px] text-gray-600 dark:text-gray-400">
        {meetup.location?.name || "TBA"}
      </p>

      {/* FEE */}
      <p className="text-[13px] text-gray-700 dark:text-gray-300">
        {meetup.fee && meetup.fee > 0 ? `£${meetup.fee}` : "Free"}
      </p>
    </div>
  );
}
