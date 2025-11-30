// src/app/live/components/all/TrendingSection.tsx
"use client";

import { getSportIcon } from "../../components/sportIcon";
import SportGroupCard from "./SportGroupCard";

interface LiveRoom {
  id: string;
  sport?: string;
  homeTeam?: string;
  awayTeam?: string;
  datetime: string;
  participants: number; 
  homeTeamLogo?: string;
}

export default function TrendingSection({ rooms }: { rooms: LiveRoom[] }) {
  // sportGroups: { [sport: string]: LiveRoom[] }
  const sportGroups: Record<string, LiveRoom[]> = {};

  rooms.forEach((r) => {
    const key = r.sport ?? "other";
    if (!sportGroups[key]) sportGroups[key] = []; // 배열 초기화
    sportGroups[key].push(r);
  });

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Trending Today</h3>

      {Object.entries(sportGroups).map(([sport, items]) => (
        <div key={sport} className="space-y-2">
          <div className="flex items-center gap-2 text-sm opacity-70">
            {getSportIcon(sport)}
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
