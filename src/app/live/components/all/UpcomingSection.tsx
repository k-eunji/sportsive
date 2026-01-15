// src/app/live/components/all/UpcomingSection.tsx
"use client";

import { groupByDate } from "@/lib/groupByDate";
import DateHeader from "./DateHeader";
import LiveRoomItemAll from "../LiveRoomItemAll";
import { getLiveRoomWindow } from "@/lib/liveRoomTime";

interface LiveRoom {
  id: string;
  kind?: "match" | "session";
  datetime: string;
  participants: number; 
  homeTeam?: string;
  awayTeam?: string;
  homeTeamLogo?: string;
  sport?: string;
}

export default function UpcomingSection({ rooms }: { rooms: LiveRoom[] }) {
  const now = new Date();
  const upcoming = rooms.filter((r) => {
    const now = new Date();
    const { openTime } = getLiveRoomWindow(r);

    // 아직 안 열린 방만 Upcoming
    return now < openTime;
  });

  if (upcoming.length === 0) return null;

  const grouped = groupByDate(upcoming);

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Upcoming Matches</h3>

      {Object.entries(grouped).map(([date, list]) => (
        <div key={date} className="space-y-2">
          <DateHeader date={date} />

          <div className="bg-white rounded-xl border border-border/40 p-1 divide-y">
            {list.map((room) => (
              <LiveRoomItemAll
                key={room.id}
                room={room}
                mode="upcoming"
              />
            ))}
          </div>

        </div>
      ))}
    </section>
  );
}
