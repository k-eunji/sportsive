// src/app/meetups/components/card/CardThumbnail.tsx

"use client";

import React from "react";
import Image from "next/image";
import type { MeetupWithEvent } from "@/types/event";

const typeEmoji = {
  match_attendance: "🏟️",
  pub_gathering: "🍺",
  online_game: "🎮",
  pickup_sports: "🏐",
  other: "❓",
};

export default function CardThumbnail({
  meetup,
  size = "desktop",
}: {
  meetup: MeetupWithEvent;
  size?: "mobile" | "desktop";
}) {
  const icon = typeEmoji[meetup.type] || "❓";

  const raw = meetup.imageUrl;
  const imageUrl = raw && raw.startsWith("http") ? raw : null;

  const dim = size === "mobile" ? "w-12 h-12" : "w-14 h-14";

  return (
    <div className={`relative ${dim} rounded-lg overflow-hidden shrink-0`}>
      {imageUrl ? (
        <Image src={imageUrl} fill alt="Meetup thumbnail" className="object-cover" />
      ) : (
        <div className="
          absolute inset-0 flex items-center justify-center text-2xl
          bg-gray-100 dark:bg-gray-800
        ">
          {icon}
        </div>
      )}
    </div>
  );
}
