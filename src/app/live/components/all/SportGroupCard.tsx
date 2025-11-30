//src/app/live/components/all/SportGroupCard.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";          // ✅ 추가
import { doc, onSnapshot } from "firebase/firestore"; // ✅ 추가
import { db } from "@/lib/firebase";                  // ✅ 추가

export default function SportGroupCard({ room }: { room: any }) {
  const home = room.homeTeam ?? "";
  const away = room.awayTeam ?? "";

  // 🔥 참가자 수를 위한 로컬 상태 (기본값: props에서 온 값)
  const [participants, setParticipants] = useState(room.participants ?? 0);  // ✅ 추가

  // 홈팀 이름 길면 무조건 ... 처리
  const maxHomeLen = 10;
  const displayHome =
    home.length > maxHomeLen ? home.slice(0, maxHomeLen) + "..." : home;
  const router = useRouter();

  // 🔥 Firestore 실시간 구독 (room.sport / room.id 기준)  ✅ 추가
  useEffect(() => {
    if (!room?.sport || !room?.id) return;

    const ref = doc(db, "live_events", room.sport, "events", room.id);

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as any;
      setParticipants(data.participants ?? 0);
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
      {/* 홈 + 어웨이 로고 (크기 줄임) */}
      <div className="flex items-center gap-1.5">
        {room.homeTeamLogo && (
          <img
            src={room.homeTeamLogo}
            className="w-6 h-6 rounded-full object-cover"
          />
        )}

        {room.awayTeamLogo && (
          <img
            src={room.awayTeamLogo}
            className="w-6 h-6 rounded-full object-cover"
          />
        )}
      </div>

      {/* 팀명 + 시간 */}
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
