// src/app/events/components/EventCard.tsx

import type { Event } from '@/types';
import Image from 'next/image';
import { formatEventTimeWithOffsetUTC } from '@/utils/date';

export default function EventCard({ event }: { event: Event }) {
  const eventDate = event.date ? new Date(event.date) : null;

  return (
    <div
      className="
        group flex flex-col justify-between
        rounded-2xl
        bg-transparent dark:bg-transparent
        p-4 w-full
      "
    >
      {/* 날짜 */}
      {eventDate && (
        <p className="text-[0.75rem] text-gray-500 dark:text-gray-400 font-medium mb-2 truncate">
          {formatEventTimeWithOffsetUTC(eventDate)}
        </p>
      )}

      {/* 팀 */}
      <div className="flex items-center justify-between flex-1 gap-4">

        {/* 홈팀 */}
        <div className="flex flex-col items-center w-1/2 overflow-hidden">
          {event.homeTeamLogo && (
            <Image
              src={event.homeTeamLogo}
              alt={event.homeTeam ?? "Home team"}
              width={40}
              height={40}
              className="size-10 rounded-full bg-gray-100 dark:bg-gray-700 object-contain"
            />
          )}

          <span
            className="
              mt-2 text-sm font-semibold text-center
              text-gray-900 dark:text-gray-100
              truncate whitespace-nowrap overflow-hidden max-w-full
            "
          >
            {event.homeTeam}
          </span>
        </div>

        {/* vs */}
        <span className="text-[0.8rem] sm:text-sm font-semibold text-gray-500 dark:text-gray-400 select-none">
          vs
        </span>

        {/* 어웨이팀 */}
        <div className="flex flex-col items-center w-1/2 overflow-hidden">
          {event.awayTeamLogo && (
            <Image
              src={event.awayTeamLogo}
              alt={event.awayTeam ?? "Away team"}
              width={40}
              height={40}
              className="size-10 rounded-full bg-gray-100 dark:bg-gray-700 object-contain"
            />
          )}

          <span
            className="
              mt-2 text-sm font-semibold text-center
              text-gray-900 dark:text-gray-100
              truncate whitespace-nowrap overflow-hidden max-w-full
            "
          >
            {event.awayTeam}
          </span>
        </div>

      </div>

      {/* 경기장 */}
      {event.venue && (
        <div className="mt-3 text-center text-[0.7rem] text-gray-500 dark:text-gray-400 leading-tight">
          <div className="truncate">{event.venue}</div>
          {(event.region || event.city) && (
            <div className="truncate">
              ({[event.region, event.city].filter(Boolean).join(', ')})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
