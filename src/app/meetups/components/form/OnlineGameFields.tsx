// src/app/meetups/components/form/OnlineGameFields.tsx

"use client";

import React from "react";
import type { MeetupFormReturn } from "@/app/meetups/hooks/useMeetupForm";

interface OnlineGameFieldsProps {
  form: MeetupFormReturn;
}

export default function OnlineGameFields({ form }: OnlineGameFieldsProps) {

  return (
    <div className="space-y-8 mt-8">

      <div>
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Game Room Link
        </p>
        <input
          type="text"
          value={form.onlineLink}
          onChange={(e) => form.setOnlineLink(e.target.value)}
          placeholder="Discord / Steam / PSN link"
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent placeholder-gray-400
            focus:border-black
          "
        />
      </div>

      <div>
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          Game Name
        </p>
        <input
          type="text"
          value={form.onlineGameName}
          onChange={(e) => form.setOnlineGameName(e.target.value)}
          placeholder="League of Legends / FC24 / Valorant"
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent placeholder-gray-400
            focus:border-black
          "
        />
      </div>

    </div>
  );
}
