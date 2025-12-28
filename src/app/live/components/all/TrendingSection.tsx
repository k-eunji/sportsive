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
  const now = new Date();

  // sportGroups: { [sport: string]: LiveRoom[] }
  const sportGroups: Record<string, LiveRoom[]> = {};

  rooms.forEach((r) => {
    // ⏰ 시간 계산 (UTC 안전)
    const startTime = new Date(Date.parse(r.datetime));
    const openTime = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
    const closeTime = new Date(
      startTime.getTime() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000
    );

    // ❌ 아직 안 열린 경기 / 이미 완전히 끝난 경기 제거
    if (now < openTime || now > closeTime) return;

    const key = r.sport ?? "other";
    if (!sportGroups[key]) sportGroups[key] = [];
    sportGroups[key].push(r);
  });

  // 필터 결과가 하나도 없으면 섹션 자체 숨김
  if (Object.keys(sportGroups).length === 0) return null;

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
