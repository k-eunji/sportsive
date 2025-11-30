// src/app/meetups/[meetupId]/components/MeetupDateTabs.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { MeetupWithEvent } from "@/types/event";

interface Props {
  currentMeetup: MeetupWithEvent;
  relatedMeetups: MeetupWithEvent[];
}

export default function MeetupDateTabs({ currentMeetup, relatedMeetups }: Props) {
  const router = useRouter();

  /** ✅ 날짜순 정렬 */
  const sortedMeetups = useMemo(
    () =>
      [...relatedMeetups].sort(
        (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      ),
    [relatedMeetups]
  );

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {sortedMeetups.map((m) => {
        const dateObj = new Date(m.datetime);
        const label = new Intl.DateTimeFormat("en-GB", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        }).format(dateObj);

        const isActive = m.id === currentMeetup.id;

        return (
          <button
            key={m.id}
            onClick={() => router.push(`/meetups/${m.id}`)}
            aria-current={isActive ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {label} GMT
          </button>
        );
      })}
    </div>
  );
}
