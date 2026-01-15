///src/app/live/components/LiveRoomItem.tsx

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatEventTimeWithOffsetUTC } from '@/utils/date'

export default function LiveRoomItem({ room }: { room: any }) {
  const router = useRouter()

  const isSession = room.kind === "session" || room.sport === "tennis"

  // 👥 participants (실시간)
  const [participants, setParticipants] = useState(room.participants ?? 0)

  useEffect(() => {
    const ref = doc(db, "live_events", room.sport, "events", room.id)

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setParticipants(snap.data().participants ?? 0)
      }
    })

    return () => unsub()
  }, [room.sport, room.id])

  const now = new Date()
  const startTime = new Date(room.datetime)

  // ===============================
  // ⏰ OPEN / CLOSE TIME 계산
  // ===============================

  let openTime: Date
  let closeTime: Date

  if (isSession) {
    // 🎾 테니스: 당일 하루 종일
    openTime = new Date(startTime)
    openTime.setHours(0, 0, 0, 0)

    closeTime = new Date(startTime)
    closeTime.setHours(23, 59, 59, 999)
  } else {
    // ⚽️🏉 match
    openTime = new Date(startTime.getTime() - 2 * 60 * 60 * 1000)
    closeTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000)
  }

  const isOpen = now >= openTime && now <= closeTime

  // ===============================
  // 📡 STATUS
  // ===============================

  let status: 'Scheduled' | 'LIVE' | 'END' = 'Scheduled'

  if (isSession) {
    if (isOpen) status = 'LIVE'
    else if (now > closeTime) status = 'END'
  } else {
    const matchEnd = new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
    if (now >= startTime && now <= matchEnd) status = 'LIVE'
    else if (now > matchEnd) status = 'END'
  }

  const handleClick = () => {
    if (isOpen) return router.push(`/live/${room.sport}/${room.id}`)

    if (now < openTime) {
      alert(
        `Chat opens at ${openTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      )
    } else {
      alert('This chat has ended.')
    }
  }

  // ===============================
  // 🖼 RENDER
  // ===============================

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between py-4 cursor-pointer transition-colors
        ${isOpen ? 'hover:bg-muted/40' : 'opacity-60 cursor-not-allowed'}
      `}
    >
      <div className="flex items-center min-w-0 gap-2">

        {/* 로고 (match만) */}
        {!isSession && room.homeTeamLogo && (
          <img src={room.homeTeamLogo} className="w-6 h-6 rounded-full object-cover" />
        )}

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0">

            <span className="truncate text-[13px] font-medium">
              {isSession
                ? `🎾 ${room.title}`
                : `${room.homeTeam} vs ${room.awayTeam}`}
            </span>

          </div>

          <span className="text-xs text-muted-foreground truncate">
            {formatEventTimeWithOffsetUTC(startTime)} • 👥 {participants}
          </span>
        </div>

        {!isSession && room.awayTeamLogo && (
          <img src={room.awayTeamLogo} className="w-6 h-6 rounded-full object-cover ml-1" />
        )}
      </div>

      <span
        className={`px-2 py-1 text-xs rounded-full border ml-3
          ${
            status === 'LIVE'
              ? 'text-red-600 border-red-600/40'
              : status === 'Scheduled'
              ? 'text-blue-500 border-blue-500/40'
              : 'text-muted-foreground border-border'
          }
        `}
      >
        {status}
      </span>
    </div>
  )
}
