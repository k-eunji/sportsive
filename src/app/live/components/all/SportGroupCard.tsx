// src/app/live/components/all/SportGroupCard.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SportGroupCard({ room }: { room: any }) {
  const router = useRouter();
  const [participants, setParticipants] = useState<number>(0);

  const isTennis = room.sport === "tennis" || room.kind === "session";

  const home = room.homeTeam ?? "";
  const away = room.awayTeam ?? "";

  const maxHomeLen = 10;
  const displayHome =
    home.length > maxHomeLen ? home.slice(0, maxHomeLen) + "..." : home;

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
      {!isTennis && (
        <div className="flex items-center gap-1.5">
          {room.homeTeamLogo && (
            <img src={room.homeTeamLogo} className="w-6 h-6 rounded-full" />
          )}
          {room.awayTeamLogo && (
            <img src={room.awayTeamLogo} className="w-6 h-6 rounded-full" />
          )}
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-medium text-[13px] truncate">
          {isTennis ? room.title : `${displayHome} vs ${away}`}
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
