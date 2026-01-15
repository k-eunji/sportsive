// src/app/live/components/all/TrendingSection.tsx

"use client";

import SportGroupCard from "./SportGroupCard";
import { sportEmoji } from "@/lib/sportEmoji";

interface LiveRoom {
  id: string;
  kind?: "match" | "session";
  sport?: string;
  homeTeam?: string;
  awayTeam?: string;
  datetime: string;
  participants: number;
  homeTeamLogo?: string;
}

export default function TrendingSection({ rooms }: { rooms: LiveRoom[] }) {
  const today = new Date();
  const todayKey = today.toDateString();

  const sportGroups: Record<string, LiveRoom[]> = {};

  rooms.forEach((r) => {
    const startTime = new Date(r.datetime);

    // ✅ Trending = "오늘 열리는 모든 경기"
    if (startTime.toDateString() !== todayKey) return;

    const key = r.sport ?? "other";
    if (!sportGroups[key]) sportGroups[key] = [];
    sportGroups[key].push(r);
  });

  if (Object.keys(sportGroups).length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Trending Today</h3>

      {Object.entries(sportGroups).map(([sport, items]) => (
        <div key={sport} className="space-y-2">
          <div className="flex items-center gap-2 text-sm opacity-70">
            <span>{sportEmoji[sport] ?? "🏟️"}</span>
            <span className="font-medium">{sport.toUpperCase()}</span>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
            {items.slice(0, 5).map((room) => (
              <div key={room.id} className="min-w-[240px]">
                <SportGroupCard room={room} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
