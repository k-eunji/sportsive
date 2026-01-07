// src/app/components/map-hero/HomeMapSnapCard.tsx

"use client";

import type { Event } from "@/types";
import { formatEventTimeWithOffsetUTC } from "@/utils/date";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getVibe, vibeClass } from "@/lib/vibe";
import { track } from "@/lib/track";

interface LiveRoom {
  id: string;
  eventId: string;
  participants?: number;
  status?: "Scheduled" | "LIVE" | "END";
}

export default function HomeMapSnapCard({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const e: any = event;
  const isLive = (e.status ?? "").toUpperCase() === "LIVE";
  const vibe = getVibe(e);

  const [room, setRoom] = useState<LiveRoom | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/live/rooms/football", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const rooms: LiveRoom[] = data.rooms ?? [];
        const found = rooms.find((r) => r.eventId === e.id) ?? null;
        if (mounted) setRoom(found);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [e.id]);

  const people = room?.participants ?? 0;

  const showChatCta = useMemo(() => {
    if (isLive) return true;
    if (room && room.status !== "END" && people > 0) return true;
    return false;
  }, [isLive, room, people]);

  return (
    <div
      className="
        fixed left-0 right-0 z-40
        bottom-[calc(env(safe-area-inset-bottom)+58px)]
        pb-[env(safe-area-inset-bottom)]
        bg-white dark:bg-black
        border-t
      "
      role="dialog"
      aria-label="Match quick view"
    >
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">
              {formatEventTimeWithOffsetUTC(new Date(e.date ?? e.utcDate))}
            </p>

            <p className="text-base font-semibold truncate mt-0.5">
              {vibe.label}
            </p>

            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {e.homeTeam} vs {e.awayTeam}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${vibeClass(vibe.tone)}`}>
                {vibe.emoji ? `${vibe.emoji} ` : ""}{vibe.label}
              </span>

              <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                isLive ? "text-red-600 bg-red-50 border-red-200" : "text-gray-700 bg-gray-50 border-gray-200"
              }`}>
                {isLive ? "LIVE" : "UPCOMING"}
              </span>

              <span className="text-[11px] font-semibold px-2 py-1 rounded-full border text-gray-700 bg-gray-50 border-gray-200">
                👥 {people}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              track("snapcard_closed", { eventId: e.id });
              onClose();
            }}
            className="text-sm font-semibold text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Link
            href={`/events?focus=${e.id}`}
            onClick={() => track("details_opened", { eventId: e.id, source: "snapcard" })}
            className="
              w-full text-center
              rounded-2xl
              bg-primary text-primary-foreground
              px-4 py-3
              text-sm font-semibold
              shadow-sm shadow-black/10
              hover:opacity-95
              transition
            "
          >
            See what’s happening →
          </Link>

          {showChatCta && (
            <Link
              href={`/live`}
              onClick={() => track("live_opened", { source: "snapcard", eventId: e.id })}
              className="
                w-full text-center
                rounded-2xl border border-border/60
                bg-background/60 backdrop-blur
                px-4 py-3
                text-sm font-semibold text-red-600
                hover:bg-background/80
                transition
              "
            >
              Join live chat
            </Link>
          )}
        </div>

        <p className="mt-3 text-[11px] text-gray-400">
          Explore first. Offline participation only where activity already exists.
        </p>
      </div>
    </div>
  );
}
