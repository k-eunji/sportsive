// src/app/teams/[teamId]/components/TeamLiveRooms.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TeamLiveRoom {
  id: string;
  title: string;
  participants: string[];
  datetime: string;
}

export default function TeamLiveRooms({ teamId }: { teamId: string }) {
  const [rooms, setRooms] = useState<TeamLiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/teams/${teamId}/live`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch live rooms");
        const data = await res.json();
        setRooms(data.rooms ?? []);
      } catch (err) {
        console.error("Error loading team live rooms:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [teamId]);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground text-sm my-6">
        Loading live rooms...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-sm my-6">
        Failed to load live rooms.
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm my-6">
        No active live rooms right now.
      </div>
    );
  }

  return (
    <div className="mt-6 mb-10">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
        🎥 Live Rooms
      </h2>
      <div className="flex flex-col gap-3">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/live/${room.id}`}
            className="flex justify-between items-center p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors shadow-sm"
          >
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{room.title}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(room.datetime).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {room.participants.length} participants
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
