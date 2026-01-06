// src/app/components/LivePreview.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatEventTimeWithOffsetUTC } from "@/utils/date";

interface LiveRoom {
  id: string;
  eventId: string;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  datetime: string;
  participants?: number;
  sport?: string;
  status?: "Scheduled" | "LIVE" | "END";
}

export default function LivePreview() {
  const [rooms, setRooms] = useState<LiveRoom[]>([]);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("/api/live/rooms/football", {
          cache: "no-store",
        });
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

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const activeRooms = rooms.filter(
    (room) => room.status !== "END"
  );

  const liveRooms = activeRooms.filter(
    (room) => room.status === "LIVE"
  );

  const todayRooms = activeRooms.filter((room) => {
    const time = new Date(room.datetime);
    return time >= startOfToday && time < endOfToday;
  });

  // 🔑 노출용 리스트 (최대 3개)
  const prioritizedRooms = [...activeRooms]
    .sort((a, b) => {
      if (a.status === "LIVE" && b.status !== "LIVE") return -1;
      if (a.status !== "LIVE" && b.status === "LIVE") return 1;
      return (
        new Date(a.datetime).getTime() -
        new Date(b.datetime).getTime()
      );
    })
    .slice(0, 3);

  if (!prioritizedRooms.length) return null;

  // 🔤 헤더 문구 결정
  // 헤더 결정 부분만 변경
  let headerTitle = "Upcoming matches";
  let headerDesc = "Some people are already here.";

  if (liveRooms.length > 0) {
    headerTitle = "Happening now";
    headerDesc = "These matches aren’t empty.";
  } else if (todayRooms.length > 0) {
    headerTitle = "Later today";
    headerDesc = "A few games people are planning around.";
  }

  return (
    <section className="mt-14 max-w-3xl mx-auto text-left">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-medium tracking-tight">
          {headerTitle}
        </h2>
        <p className="text-sm text-muted-foreground">
          {headerDesc}
        </p>
      </div>

      {/* Preview-only list */}
      <div className="divide-y divide-border/60 border-t border-border/60">
        {prioritizedRooms.map((room) => {
          const startTime = new Date(room.datetime);

          return (
            <div
              key={room.id}
              className="
                flex items-center justify-between gap-3
                py-3 px-2
                opacity-80
                cursor-default
              "
            >
              {/* LEFT */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1 shrink-0">
                  {room.homeTeamLogo && (
                    <img
                      src={room.homeTeamLogo}
                      alt={room.homeTeam}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  {room.awayTeamLogo && (
                    <img
                      src={room.awayTeamLogo}
                      alt={room.awayTeam}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm truncate">
                    {room.homeTeam} vs {room.awayTeam}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {formatEventTimeWithOffsetUTC(startTime)} • 👥{" "}
                    {room.participants ?? 0}
                  </span>
                </div>
              </div>

              {room.status === "LIVE" && (
                <span className="text-xs text-red-600 shrink-0">
                  ● LIVE
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="pt-4 flex justify-end">
        <Link
          href="/live"
          className="
            inline-flex items-center gap-1
            text-sm font-medium
            text-blue-600
            hover:underline
            underline-offset-4
          "
        >
          Explore live chats →
        </Link>
      </div>
    </section>
  );
}
