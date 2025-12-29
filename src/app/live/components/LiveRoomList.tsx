// src/app/live/components/LiveRoomList.tsx

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from "next/navigation";

interface LiveRoom {
  id: string;
  eventId: string;
  title: string;
  participants: number;
  datetime: string;
  sport: string; // ⭐ 스포츠 추가
}

export default function LiveRoomList() {
  const [rooms, setRooms] = useState<LiveRoom[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname() ?? "";
  const sport = pathname.split("/")[2] ?? "football";


  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch(`/api/live/rooms/${sport}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch rooms")
        const data = await res.json()
        setRooms(data.rooms ?? [])
      } catch (err) {
        console.error("Error loading live rooms:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [sport]) // ✅ sport 변경 시마다 다시 fetch

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Loading live rooms...
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-4">
        No live rooms available
      </p>
    )
  }

  return (
    <div className="divide-y divide-border/60 border-t border-border/60">
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={`/live/${room.sport}/${room.id}`}
          className="flex items-center justify-between py-4 hover:bg-muted/40 transition-colors"
        >
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{room.title}</span>

            <span className="text-xs text-muted-foreground truncate">
              {new Date(room.datetime).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <span className="text-xs text-muted-foreground flex-shrink-0">
            👥 {room.participants}
          </span>
        </Link>
      ))}
    </div>
  )
}
