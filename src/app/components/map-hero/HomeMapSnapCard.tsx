// src/app/components/map-hero/HomeMapSnapCard.tsx

"use client";

import type { Event } from "@/types";
import { formatEventTimeWithOffsetUTC } from "@/utils/date";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  const isLive = (event as any).status === "LIVE";
  const [room, setRoom] = useState<LiveRoom | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRoom() {
      try {
        // ✅ 초경량 브릿지: 지금은 football rooms만 있어도 “사람 냄새” 만들 수 있음
        const res = await fetch("/api/live/rooms/football", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();

        const rooms: LiveRoom[] = data.rooms ?? [];
        const found = rooms.find((r) => r.eventId === (event as any).id) ?? null;

        if (mounted) setRoom(found);
      } catch {
        // 조용히 실패
      }
    }

    loadRoom();
    return () => {
      mounted = false;
    };
  }, [event]);

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
        bottom-[58px]
        pb-[env(safe-area-inset-bottom)]
        bg-white dark:bg-black
        border-t
      "
    >
      <div className="max-w-3xl mx-auto px-4 py-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">
              {formatEventTimeWithOffsetUTC(new Date((event as any).date))}
            </p>

            <p className="text-sm font-semibold truncate">
              {(event as any).homeTeam} vs {(event as any).awayTeam}
            </p>

            {/* “사람 냄새” + 라이브 상태 */}
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              {isLive ? (
                <span className="text-red-600 font-medium">● Live now</span>
              ) : (
                <span className="opacity-80">Not live yet</span>
              )}

              <span className="text-gray-300">·</span>

              <span className="opacity-90">
                👥 {people} {people === 1 ? "person" : "people"} around this match
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <Link
            href={`/events?focus=${(event as any).id}`}
            className="
              text-sm font-semibold
              text-blue-600
              hover:underline
              underline-offset-4
            "
          >
            Open match details →
          </Link>

          {showChatCta && (
            <Link
              href={`/live`}
              className="
                text-sm font-semibold
                text-red-600
                hover:underline
                underline-offset-4
              "
            >
              Open live chat →
            </Link>
          )}
        </div>

        {/* Safety / participation framing (홈 아래에서 여기로 이동) */}
        <p className="mt-3 text-[11px] text-gray-400">
          Offline participation emerges only where activity already exists — explore first,
          join only if you feel it.
        </p>
      </div>
    </div>
  );
}
