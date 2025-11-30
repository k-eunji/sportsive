// src/app/meetups/create/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CreateMeetupModal from "@/app/meetups/components/CreateMeetupModal";
import type { Event } from "@/types";

// 임시 데이터 또는 fetch로 받아온 upcomingEvents
const upcomingEvents: Event[] = [];

export default function CreateMeetupPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  return (
    <>
      {isModalOpen && (
        <CreateMeetupModal
          upcomingEvents={upcomingEvents}
          onClose={() => setIsModalOpen(false)}
          onCreated={(meetupId) => {
            console.log("✅ Created Meetup ID:", meetupId);
            setIsModalOpen(false);

            // ✅ meetup 생성 후 상세 페이지로 이동
            router.push(`/meetups/${meetupId}`);
          }}
        />
      )}
    </>
  );
}
