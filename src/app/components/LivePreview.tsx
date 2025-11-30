//src/app/components/LivePreview.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LiveRoom {
  id: string;
  eventId: string;
  homeTeam?: string;
  awayTeam?: string;
  status?: "Scheduled" | "LIVE" | "END";
}

/**
 * 🔴 Live 미리보기 섹션
 * - 현재 진행 중인 응원방 3개 요약
 * - 홈 화면 요약용
 */
export default function LivePreview() {
  const [rooms, setRooms] = useState<LiveRoom[]>([]);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("/api/live/football/rooms?limit=3");
        if (!res.ok) throw new Error("Failed to fetch live rooms");
        const data = await res.json();
        setRooms(data.rooms ?? []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchRooms();
  }, []);

  if (!rooms.length) return null;

  return (
    <section className="text-center">
      <h2 className="text-3xl font-extrabold mb-6 text-[var(--primary-to)]">
        🔴 Live Now
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {rooms.map((r) => (
          <Link
            key={r.id}
            href={`/live/${r.id}`}
            className="rounded-xl border border-border bg-card/70 px-6 py-4 shadow-sm hover:shadow-md transition-all"
          >
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {r.homeTeam} vs {r.awayTeam}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{r.status}</p>
          </Link>
        ))}
      </div>

      <a
        href="/live"
        className="inline-block mt-6 text-sm text-blue-600 hover:underline"
      >
        Go to Live Rooms →
      </a>
    </section>
  );
}
