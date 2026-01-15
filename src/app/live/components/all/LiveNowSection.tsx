// src/app/live/components/all/LiveNowSection.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sportEmoji } from "@/lib/sportEmoji";
import { isLiveNow, getLiveRoomWindow } from "@/lib/liveRoomTime";

interface LiveRoom {
  id: string;
  datetime: string;
  participants: number;
  homeTeam?: string | null;
  awayTeam?: string | null;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  sport?: string;
  title?: string;
  kind?: "match" | "session"; // ✅ 수정
}

const SPORT_LABEL_MAP: Record<string, string> = {
  football: "Football",
  rugby: "Rugby",
  tennis: "Tennis",
  f1: "F1",
  cricket: "Cricket",
  golf: "Golf",
  horseracing: "Horse Racing",
};

export default function LiveNowSection({ rooms }: { rooms: LiveRoom[] }) {
  const router = useRouter();
  const [liveRoomsState, setLiveRoomsState] = useState<LiveRoom[]>([]);

  // 1️⃣ rooms → local state 초기화
  useEffect(() => {
    setLiveRoomsState(
      rooms.map((r) => ({
        ...r,
        participants: 0,
      }))
    );
  }, [rooms]);

  // 2️⃣ presence 구독 (rooms 기준으로 딱 한 번)
  useEffect(() => {
    if (rooms.length === 0) return;

    const unsubscribes = rooms.map((room) => {
      if (!room.sport) return () => {};

      const ref = collection(
        db,
        "live_events",
        room.sport,
        "events",
        room.id,
        "presence"
      );

      return onSnapshot(ref, (snap) => {
        setLiveRoomsState((prev) =>
          prev.map((r) =>
            r.id === room.id ? { ...r, participants: snap.size } : r
          )
        );
      });
    });

    return () => unsubscribes.forEach((u) => u && u());
  }, [rooms]);

  // 3️⃣ LIVE 판별
  const liveRooms = liveRoomsState.filter(isLiveNow);

  if (liveRooms.length === 0) return null;

  return (
    <section className="space-y-4 animate-fadeInFast">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <h3 className="text-lg font-semibold">Live Now</h3>
      </div>

      <div className="space-y-3">
        {liveRooms.map((room) => {
          const isTeamMatch =
            room.kind !== "session" &&
            (room.sport === "football" || room.sport === "rugby");

          return (
            <div
              key={room.id}
              onClick={() =>
                room.sport && router.push(`/live/${room.sport}/${room.id}`)
              }
              className="relative flex items-center gap-3 p-4 rounded-xl
                         bg-white border border-red-200/40 hover:bg-red-50/60
                         cursor-pointer transition-colors"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl" />

              {isTeamMatch && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {room.homeTeamLogo && (
                    <img src={room.homeTeamLogo} className="h-6 w-6 rounded-full" />
                  )}
                  {room.awayTeamLogo && (
                    <img src={room.awayTeamLogo} className="h-6 w-6 rounded-full" />
                  )}
                </div>
              )}

              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[11px] text-muted-foreground font-medium">
                  {sportEmoji[room.sport ?? ""]} {(room.sport ?? "").toUpperCase()}
                </span>

                <span className="truncate text-[13px] font-semibold">
                  {isTeamMatch
                    ? `${room.homeTeam} vs ${room.awayTeam}`
                    : room.title}
                </span>

                <span className="text-xs text-muted-foreground">
                  {room.participants} people chatting
                </span>
              </div>

              <span className="px-2 py-1 text-xs rounded-full
                               bg-red-100 text-red-600 border border-red-200">
                LIVE
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
