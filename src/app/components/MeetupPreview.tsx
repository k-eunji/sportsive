//src/app/components/MeetupPreview.tsx

"use client";

import { useEffect, useState } from "react";
import MeetupCard from "@/app/meetups/components/MeetupCard";
import type { MeetupWithEvent } from "@/types/event";

/**
 * 🤝 Meetup 미리보기 섹션
 * - 최근 3개의 밋업 표시
 * - 홈 화면 요약용 (실제 데이터 기반)
 */
export default function MeetupPreview() {
  const [meetups, setMeetups] = useState<MeetupWithEvent[]>([]);

  useEffect(() => {
    async function fetchMeetups() {
      try {
        const res = await fetch("/api/meetups?limit=3");
        if (!res.ok) throw new Error("Failed to fetch meetups");
        const data = await res.json();
        setMeetups(data.meetups ?? []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMeetups();
  }, []);

  if (!meetups.length) return null;

  return (
    <section className="text-center">
      <h2 className="text-3xl font-extrabold mb-6 text-[var(--primary-from)]">
        🤝 Recent Meetups
      </h2>
      <div className="flex flex-wrap justify-center gap-6">
        {meetups.map((m) => (
          <MeetupCard key={m.id} meetup={m} hostId={m.hostId ?? ""} />
        ))}
      </div>

      <a
        href="/meetups"
        className="inline-block mt-6 text-sm text-blue-600 hover:underline"
      >
        View all meetups →
      </a>
    </section>
  );
}
