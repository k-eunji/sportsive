// src/app/live/components/LiveRoomItemAll.tsx

'use client'

import { useRouter } from 'next/navigation'
import { formatEventTimeWithOffsetUTC } from '@/utils/date'
import { sportEmoji } from '@/lib/sportEmoji'
import { toast } from "react-hot-toast";

export default function LiveRoomItemAll({
  room,
  mode = "live",
}: {
  room: any;
  mode?: "live" | "upcoming";
}) {
  const router = useRouter()
  const startTime = new Date(room.datetime)

  const isTeamMatch =
    room.kind !== "session" &&
    (room.sport === "football" || room.sport === "rugby")

  const SPORT_LABEL_MAP: Record<string, string> = {
    football: "Football",
    rugby: "Rugby",
    tennis: "Tennis",
    f1: "F1",
    cricket: "Cricket",
    golf: "Golf",
    horseracing: "Horse Racing",
  };

  const handleClick = () => {
    if (mode === "upcoming") {
      toast("This chat opens on match day.");
      return;
    }

    router.push(`/live/${room.sport}/${room.id}`);
  };


  const sportLabel = SPORT_LABEL_MAP[room.sport ?? ""] ?? "Sport";

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-start gap-3 py-3 px-3
        transition-colors
        ${
          mode === "upcoming"
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:bg-muted/40"
        }
      `}
    >
      {/* LEFT ZONE */}
      <div className="flex flex-col items-center gap-1 shrink-0 min-w-[44px]">

        {/* 팀 로고 (팀 매치만) */}
        {isTeamMatch && (
          <div className="flex items-center gap-1">
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
        )}

        {/* 스포츠 배지 (이모지 + 텍스트) */}
        <span
          className="
            px-1.5 py-0.5 rounded
            text-[10px] font-semibold tracking-wide
            bg-muted/40 text-muted-foreground
          "
        >
          {sportEmoji[room.sport ?? ""]} {sportLabel.toUpperCase()}
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col min-w-0">
        <span className="font-semibold truncate">
          {isTeamMatch
            ? `${room.homeTeam} vs ${room.awayTeam}`
            : room.title}
        </span>

        <span className="text-[11px] text-muted-foreground truncate">
          {formatEventTimeWithOffsetUTC(startTime)} • 👥 {room.participants}
        </span>
      </div>
    </div>
  )
}
