// src/app/live/components/LiveRoomItemAll.tsx

'use client'

import { useRouter } from 'next/navigation'
import { formatEventTimeWithOffsetUTC } from '@/utils/date'

export default function LiveRoomItemAll({ room }: { room: any }) {
  const router = useRouter()

  const startTime = new Date(room.datetime)
  const now = new Date()

  // ⏰ 시간 정책 (LiveRoomItem과 동일)
  const openTime = new Date(startTime.getTime() - 2 * 60 * 60 * 1000)
  const liveEndTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
  const closeTime = new Date(liveEndTime.getTime() + 30 * 60 * 1000)

  let status: 'Scheduled' | 'LIVE' | 'END' = 'Scheduled'
  if (now >= startTime && now <= liveEndTime) status = 'LIVE'
  else if (now > liveEndTime) status = 'END'

  const isOpen = now >= openTime && now <= closeTime

  // 🖱️ 클릭 제어
  const handleClick = () => {
    if (isOpen) {
      router.push(`/live/${room.sport}/${room.id}`)
    } else if (now < openTime) {
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

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between py-3 px-3 transition-colors text-[13px] md:text-[14px]
        ${isOpen ? 'cursor-pointer hover:bg-muted/40' : 'opacity-60 cursor-not-allowed'}
      `}
    >
      {/* LEFT */}
      <div className="flex items-center gap-2 min-w-0">
        {/* LOGOS */}
        <div className="flex items-center gap-1 shrink-0">
          {room.homeTeamLogo && (
            <img
              src={room.homeTeamLogo}
              alt={room.homeTeam}
              className="w-6 h-6 rounded-full object-cover md:w-7 md:h-7"
            />
          )}
          {room.awayTeamLogo && (
            <img
              src={room.awayTeamLogo}
              alt={room.awayTeam}
              className="w-6 h-6 rounded-full object-cover md:w-7 md:h-7"
            />
          )}
        </div>

        {/* TEXT */}
        <div className="flex flex-col min-w-0">
          <span className="font-medium flex items-center gap-1 min-w-0">
            <span className="truncate max-w-[70px] md:max-w-[110px]">
              {room.homeTeam}
            </span>
            <span className="shrink-0">vs</span>
            <span className="truncate max-w-[70px] md:max-w-[110px]">
              {room.awayTeam}
            </span>
          </span>

          <span className="text-[11px] text-muted-foreground truncate md:text-xs">
            {formatEventTimeWithOffsetUTC(startTime)} • 👥 {room.participants}
          </span>
        </div>
      </div>

      {/* STATUS */}
      <span
        className={`px-2 py-1 text-xs rounded-full border ml-3 shrink-0
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
