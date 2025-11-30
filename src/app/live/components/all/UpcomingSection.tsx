// src/app/live/components/all/UpcomingSection.tsx
"use client";

import { groupByDate } from "@/lib/groupByDate";
import DateHeader from "./DateHeader";
import LiveRoomItemAll from "../LiveRoomItemAll";

interface LiveRoom {
  id: string;
  datetime: string;
  participants: number; 
  homeTeam?: string;
  awayTeam?: string;
  homeTeamLogo?: string;
  sport?: string;
}

export default function UpcomingSection({ rooms }: { rooms: LiveRoom[] }) {
  const now = new Date();
  const upcoming = rooms.filter((r) => new Date(r.datetime) > now);
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
              <LiveRoomItemAll key={room.id} room={room} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
