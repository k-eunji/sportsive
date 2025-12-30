// src/app/live/components/all/SportGroupCard.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SportGroupCard({ room }: { room: any }) {
  const router = useRouter();

  const home = room.homeTeam ?? "";
  const away = room.awayTeam ?? "";

  // ✅ participants는 presence 기준으로만 관리
  const [participants, setParticipants] = useState<number>(0);

  // 홈팀 이름 길이 제한
  const maxHomeLen = 10;
  const displayHome =
    home.length > maxHomeLen ? home.slice(0, maxHomeLen) + "..." : home;

  // 🔥 presence 실시간 구독 (누적 ❌, 실제 접속자 수 ✅)
  useEffect(() => {
    if (!room?.sport || !room?.id) return;

    const ref = collection(
      db,
      "live_events",
      room.sport,
      "events",
      String(room.id),
      "presence"
    );

    const unsub = onSnapshot(ref, (snap) => {
      setParticipants(snap.size);
    });

    return () => unsub();
  }, [room.sport, room.id]);

  return (
    <div
      onClick={() => router.push(`/live/${room.sport}/${room.id}`)}
      className="
        flex items-center gap-2 px-4 py-3 rounded-xl
        bg-muted/20 border border-border/40
        hover:bg-muted/40 transition cursor-pointer
      "
    >
      {/* 로고 */}
      <div className="flex items-center gap-1.5">
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

      {/* 텍스트 */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-medium text-[13px] truncate">
          {displayHome} vs {away}
        </span>

        <span className="text-xs text-muted-foreground truncate">
          {new Date(room.datetime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" • "}
          {participants} people
        </span>
      </div>
    </div>
  );
}
