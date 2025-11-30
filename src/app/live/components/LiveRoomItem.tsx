///src/app/live/components/LiveRoomItem.tsx

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatEventTimeWithOffsetUTC } from '@/utils/date'

export default function LiveRoomItem({ room }: { room: any }) {
  const router = useRouter()

  // 🔥 추가된 부분
  const [participants, setParticipants] = useState(room.participants)

  useEffect(() => {
    const ref = doc(db, "live_events", room.sport, "events", room.id)

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setParticipants(snap.data().participants ?? 0)
      }
    })

    return () => unsub()
  }, [room.sport, room.id])
  // 🔥 여기까지

  const startTime = new Date(room.datetime)
  const now = new Date()

  const openTime = new Date(startTime.getTime() - 2 * 60 * 60 * 1000)
  const closeTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000)

  let status: 'Scheduled' | 'LIVE' | 'END' = 'Scheduled'
  if (now >= startTime && now <= new Date(startTime.getTime() + 2 * 60 * 60 * 1000)) status = 'LIVE'
  else if (now > new Date(startTime.getTime() + 2 * 60 * 60 * 1000)) status = 'END'

  const isOpen = now >= openTime && now <= closeTime

  const handleClick = () => {
    if (isOpen) return router.push(`/live/${room.sport}/${room.id}`)
    if (now < openTime)
      alert(
        `Chat opens at ${openTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      )
    else alert('This chat has ended.')
  }

  const home = room.homeTeam ?? ''
  const away = room.awayTeam ?? ''

  const maxLen = 10
  const displayHome = home.length > maxLen ? home.slice(0, maxLen) + '...' : home
  const displayAway = away.length > maxLen ? away.slice(0, maxLen) + '...' : away

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between py-4 cursor-pointer transition-colors
        ${isOpen ? 'hover:bg-muted/40' : 'opacity-60 cursor-not-allowed'}
      `}
    >
      <div className="flex items-center min-w-0 gap-2">

        {room.homeTeamLogo && (
          <img src={room.homeTeamLogo} className="w-6 h-6 rounded-full object-cover" />
        )}

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-1 min-w-0">

            <span className="truncate max-w-[90px] text-[13px] font-medium">
              {displayHome}
            </span>

            <span className="opacity-70 text-[13px] font-medium">vs</span>

            <span className="truncate max-w-[90px] text-[13px] font-medium">
              {displayAway}
            </span>
          </div>

          {/* 🔥 기존 room.participants → 실시간 state */}
          <span className="text-xs text-muted-foreground truncate">
            {formatEventTimeWithOffsetUTC(startTime)} • 👥 {participants}
          </span>
        </div>

        {room.awayTeamLogo && (
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
