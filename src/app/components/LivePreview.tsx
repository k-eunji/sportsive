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
        const res = await fetch("/api/live/rooms/football?limit=3", {
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

  return (
    <section className="mt-14 max-w-3xl mx-auto text-left">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-medium tracking-tight">
          Live match chats
        </h2>
        <p className="text-sm text-muted-foreground">
          Chat rooms open shortly before kickoff and close after the match.
        </p>
      </div>

      {/* 🔒 Preview-only list (NOT clickable per room) */}
      <div className="divide-y divide-border/60 border-t border-border/60">
        {rooms.map((room) => {
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
                {/* Logos */}
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

                {/* Text */}
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

              {/* RIGHT */}
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
