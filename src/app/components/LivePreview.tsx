// src/app/components/LivePreview.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatEventTimeWithOffsetUTC } from "@/utils/date";
import { motion } from "framer-motion";

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
    let mounted = true;
    (async function fetchRooms() {
      try {
        const res = await fetch("/api/live/rooms/football", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setRooms(data.rooms ?? []);
      } catch {
        // silent
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const view = useMemo(() => {
    const active = rooms.filter((r) => r.status !== "END");
    const sorted = [...active].sort((a, b) => {
      if (a.status === "LIVE" && b.status !== "LIVE") return -1;
      if (a.status !== "LIVE" && b.status === "LIVE") return 1;
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    });

    const top = sorted.slice(0, 2);
    const liveCount = active.filter((r) => r.status === "LIVE").length;

    return { top, liveCount, activeCount: active.length };
  }, [rooms]);

  if (!view.top.length) return null;

  const headerTitle = view.liveCount > 0 ? "Happening now" : "Circling today";
  const headerDesc =
    view.liveCount > 0
      ? "People are already in these rooms."
      : "A few matches people are quietly watching.";

  return (
    <section className="px-6">
      <div className="w-full md:max-w-3xl md:mx-auto">
        <div className="mb-3 space-y-1">
          <div
            onClick={() => window.location.href = "/live"}
            className="cursor-pointer space-y-1"
          >
            <h2 className="text-lg font-semibold tracking-tight">
              {headerTitle}
            </h2>

            <p className="text-sm text-muted-foreground">
              {headerDesc}
            </p>

            <p className="text-xs font-medium text-blue-600">
              Tap to open live
            </p>
          </div>

        </div>

        <div className="grid gap-3">
          {view.top.map((room) => {
            const startTime = new Date(room.datetime);
            const people = room.participants ?? 0;

            return (
              <Link
                key={room.id}
                href="/live"
                className="
                  rounded-2xl
                  border border-border/60
                  bg-background/60
                  backdrop-blur
                  shadow-sm shadow-black/5
                  px-4 py-3
                  hover:bg-background/80
                  transition
                "
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-1 shrink-0">
                      {room.homeTeamLogo && (
                        <img
                          src={room.homeTeamLogo}
                          alt={room.homeTeam}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      )}
                      {room.awayTeamLogo && (
                        <img
                          src={room.awayTeamLogo}
                          alt={room.awayTeam}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {room.homeTeam} vs {room.awayTeam}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatEventTimeWithOffsetUTC(startTime)} · 👥 {people}
                      </p>
                    </div>
                  </div>

                  {room.status === "LIVE" && (
                    <motion.span
                      className="ml-auto text-xs text-red-600 font-semibold"
                      animate={{ opacity: [1, 0.35, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    >
                      ● LIVE
                    </motion.span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
