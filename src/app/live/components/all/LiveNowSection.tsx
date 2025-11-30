// src/app/live/components/all/LiveNowSection.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";          // ✅ 추가
import { doc, onSnapshot } from "firebase/firestore"; // ✅ 추가
import { db } from "@/lib/firebase";                  // ✅ 추가
import { getSportIcon } from "../../components/sportIcon";

interface LiveRoom {
  id: string;
  datetime: string;
  participants: number;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  sport?: string;
}

export default function LiveNowSection({ rooms }: { rooms: LiveRoom[] }) {
  const router = useRouter();

  // 🔥 rooms를 로컬 상태로 관리 (participants 실시간 반영용)  ✅ 추가
  const [liveRoomsState, setLiveRoomsState] = useState<LiveRoom[]>(rooms);

  // 🔥 Firestore 실시간 구독 (각 room마다)  ✅ 추가
  useEffect(() => {
    // rooms가 바뀔 때마다 새로 구독
    const unsubscribes = rooms.map((room) => {
      if (!room.sport) return () => {};

      const ref = doc(db, "live_events", room.sport, "events", room.id);

      return onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as any;
        const count = data.participants ?? 0;

        setLiveRoomsState((prev) =>
          prev.map((r) =>
            r.id === room.id ? { ...r, participants: count ?? r.participants } : r
          )
        );
      });
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub && unsub());
    };
  }, [rooms]);

  useEffect(() => {
    const now = new Date();  // 👈 여기에 선언해야 함!

    console.log("🔎 LIVE DEBUG ----------------");
    liveRoomsState.forEach((r) => {
      const start = new Date(r.datetime);
      const end = new Date(start.getTime() + 2 * 3600 * 1000);

      console.log({
        id: r.id,
        datetime: r.datetime,
        parsed: start,
        now,
        start,
        end,
        isLive: now >= start && now <= end,
      });
    });
  }, [liveRoomsState]);

  useEffect(() => {
    setLiveRoomsState(rooms);
  }, [rooms]);


  // ✅ 여기서부터는 기존 로직 그대로, 다만 rooms 대신 liveRoomsState 사용
  const now = new Date();
  const liveRooms = liveRoomsState.filter((r) => {
    const start = new Date(r.datetime);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);
    const isLiveTime = now >= start && now <= end;

    return isLiveTime; // 👈 participants 조건 제거!
  });

  if (liveRooms.length === 0) return null;

  return (
    <section className="space-y-4 animate-fadeInFast">

      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <h3 className="text-lg font-semibold">Live Now</h3>
      </div>

      <div className="space-y-3">
        {liveRooms.map((room) => {
          const home = room.homeTeam ?? "";
          const away = room.awayTeam ?? "";

          const maxLen = 10;
          const displayHome =
            home.length > maxLen ? home.slice(0, maxLen) + "..." : home;

          return (
            <div
              key={room.id}       
              onClick={() => room.sport && router.push(`/live/${room.sport}/${room.id}`)}
              className="
                relative flex items-center gap-3 p-4 rounded-xl
                bg-white border border-red-200/40 hover:bg-red-50/60
                cursor-pointer transition-colors
              "
            >
              {/* accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl" />

              {/* 로고 */}
              <div className="flex items-center gap-1.5">
                <img src={room.homeTeamLogo} className="h-6 w-6 rounded-full object-cover" />
                <img src={room.awayTeamLogo} className="h-6 w-6 rounded-full object-cover" />
              </div>

              {/* 텍스트 (여기 변경됨!) */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">

                  {getSportIcon(room.sport)}

                  <div className="flex items-center gap-1 min-w-0">
                    <span className="truncate max-w-[90px] text-[13px] font-medium">
                      {displayHome}
                    </span>

                    <span className="text-[13px] font-medium opacity-70">vs</span>

                    <span className="truncate max-w-[90px] text-[13px] font-medium">
                      {away}
                    </span>
                  </div>
                </div>

                <span className="text-xs text-muted-foreground truncate">
                  {room.participants} people chatting
                </span>
              </div>

              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 border border-red-200">
                LIVE
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

