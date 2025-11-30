// src/app/meetups/components/MeetupList.tsx

// src/app/meetups/components/MeetupList.tsx
"use client";

import React from "react";
import MeetupCard from "./MeetupCard";
import { MeetupWithEvent } from "@/types/event";

interface MeetupListProps {
  meetups: MeetupWithEvent[];
  hostId: string;
  isLoading?: boolean; // ✅ 추가
}

export default function MeetupList({
  meetups,
  hostId,
  isLoading = false, // ✅ 기본값
}: MeetupListProps) {
  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center py-20 text-center bg-background rounded-xl shadow-sm">
        <p className="text-lg font-semibold text-foreground animate-pulse">
          Loading meetups...
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Please wait while we fetch the latest meetups.
        </p>
      </section>
    );
  }

  if (!meetups?.length) {
    return (
      <section className="flex flex-col items-center justify-center py-20 text-center bg-background rounded-xl shadow-sm">
        <p className="text-lg font-semibold text-foreground">
          No meetups available
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Try creating a new meetup or check back later.
        </p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-6">
      {meetups.map((meetup) => (
        <MeetupCard
          key={meetup.id}
          meetup={meetup}
        />
      ))}
    </section>
  );
}
