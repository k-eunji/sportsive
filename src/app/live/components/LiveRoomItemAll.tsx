//src/app/live/components/LiveRoomItemAll.tsx

'use client'

import { useRouter } from 'next/navigation'
import { formatEventTimeWithOffsetUTC } from '@/utils/date'

export default function LiveRoomItemAll({ room }: { room: any }) {
  const router = useRouter()

  const startTime = new Date(room.datetime)

  const handleClick = () => router.push(`/live/${room.sport}/${room.id}`)

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-between py-3 px-3 cursor-pointer hover:bg-muted/40 transition-colors text-[13px] md:text-[14px]"
    >
      {/* LEFT: logos + names */}
      <div className="flex items-center gap-2 min-w-0">
        {/* LOGO WRAPPER */}
        <div className="flex items-center gap-1 shrink-0">
          {room.homeTeamLogo && (
            <img
              src={room.homeTeamLogo}
              alt={room.homeTeam}
              className="w-6 h-6 rounded-full object-cover md:w-7 md:h-7 shrink-0"
            />
          )}
          {room.awayTeamLogo && (
            <img
              src={room.awayTeamLogo}
              alt={room.awayTeam}
              className="w-6 h-6 rounded-full object-cover md:w-7 md:h-7 shrink-0"
            />
          )}
        </div>

        {/* TEXT */}
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-[13px] md:text-sm flex items-center gap-1 min-w-0">
            <span className="truncate max-w-[70px] md:max-w-[110px]">{room.homeTeam}</span>
            <span className="shrink-0">vs</span>
            <span className="truncate max-w-[70px] md:max-w-[110px]">{room.awayTeam}</span>
          </span>

          <span className="text-[11px] text-muted-foreground truncate max-w-[135px] md:max-w-full md:text-xs">
            {formatEventTimeWithOffsetUTC(startTime)} • 👥 {room.participants}
          </span>
        </div>
      </div>
    </div>
  )
}
