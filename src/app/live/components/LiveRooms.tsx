// src/app/live/components/LiveRooms.tsx

"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import LiveRoomItem from "./LiveRoomItem"
import { groupByDate } from "@/lib/groupByDate"

interface LiveRoom {
  id: string
  eventId: string
  title: string
  participants: number;
  datetime: string
  homeTeamLogo?: string
  awayTeamLogo?: string
  homeTeam?: string
  awayTeam?: string
}

export default function LiveRooms() {
  const pathname = usePathname() ?? ""
  const segments = pathname.split("/")

  // /live/football → segments[2] = football
  const sport = segments[2]

  const [rooms, setRooms] = useState<LiveRoom[]>([])
  const searchParams = useSearchParams()
  const eventId = searchParams?.get("eventId") ?? null

  useEffect(() => {
    async function fetchRooms() {
      try {
        // 스포츠 탭에서는 무조건 sport 사용
        const url = `/api/live/rooms/${sport}${eventId ? `?eventId=${eventId}` : ""}`

        const res = await fetch(url, { cache: "no-store" })
        const data = await res.json()

        setRooms(Array.isArray(data.rooms) ? data.rooms : [])
      } catch (err) {
        console.error("Failed to fetch live rooms:", err)
      }
    }

    if (sport) fetchRooms()
  }, [sport, eventId])

  const grouped = groupByDate(rooms)

  const formatHeader = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    const isToday = d.toDateString() === today.toDateString()
    const isTomorrow = d.toDateString() === tomorrow.toDateString()

    if (isToday) return "Today"
    if (isTomorrow) return "Tomorrow"

    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  return (
    <main className="max-w-5xl mx-auto p-4 pt-4 space-y-10">
      <div className="space-y-1">
        <h2 className="text-xl font-bold leading-tight">Feel the buzz with fellow fans</h2>
        <p className="text-sm text-muted-foreground">
          Join live chats before, during and after every match.
        </p>
      </div>

      {rooms.length === 0 ? (
        <p className="text-center text-muted-foreground py-24">No live rooms available</p>
      ) : (
        Object.entries(grouped).map(([date, matches]) => (
          <section key={date} className="space-y-3">
            <div className="sticky top-[110px] z-20 bg-background">
              <div
                className={`
                  py-2 px-1 border-l-4  
                  ${formatHeader(date) === "Today"
                    ? "border-red-500"
                    : formatHeader(date) === "Tomorrow"
                    ? "border-blue-500"
                    : "border-border"}
                `}
              >
                <h2
                  className={`
                    font-bold text-lg tracking-wide 
                    ${formatHeader(date) === "Today"
                      ? "text-red-500"
                      : formatHeader(date) === "Tomorrow"
                      ? "text-blue-500"
                      : "text-foreground"}
                  `}
                >
                  {formatHeader(date)}
                </h2>
              </div>
            </div>

            <div className="divide-y divide-border/60 border-t border-border/60">
              {matches.map((room) => (
                <LiveRoomItem key={room.id} room={room} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  )
}
