// src/app/events/components/MapSnapCard.tsx
'use client';

import type { Event } from '@/types';
import Image from 'next/image';
import { formatEventTimeWithOffsetUTC } from '@/utils/date';

export default function MapSnapCard({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  if (!event) return null;

  // 🎾 Tennis session (tournament)
  if (event.kind === 'session') {
    return <TennisSessionSnapCard event={event} onClose={onClose} />;
  }

  // ⚽️🏉 Match
  return <MatchSnapCard event={event} onClose={onClose} />;
}

/* ============================= */
/* 🎾 Tennis session snap card */
/* ============================= */

function TennisSessionSnapCard({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const now = new Date();
  const start = event.startDate ? new Date(event.startDate) : null;
  const end = event.endDate ? new Date(event.endDate) : null;

  const isOngoing =
    start && end && start <= now && now <= end;

  const directionsUrl =
    event.location &&
    `https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}`;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[82%] max-w-sm z-20">
      <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm px-4 py-3">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xs text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Status */}
        <p className="text-[11px] mb-2">
          {isOngoing ? (
            <span className="text-green-600 font-semibold">
              🎾 Ongoing tournament
            </span>
          ) : (
            <span className="text-gray-500">
              Upcoming tournament
            </span>
          )}
        </p>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
          {event.title}
        </h3>

        {/* Period */}
        {start && end && (
          <p className="mt-1 text-[11px] text-gray-500">
            {event.startDate} – {event.endDate}
          </p>
        )}

        {/* Venue + Directions */}
        {event.venue && (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
            <span className="truncate">📍 {event.venue}</span>
            {directionsUrl && (
              <>
                <span className="opacity-40">·</span>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline whitespace-nowrap"
                >
                  Directions
                </a>
              </>
            )}
          </div>
        )}

        {/* Action */}
        {event.homepageUrl && (
          <a
            href={event.homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              mt-3 block w-full text-center
              py-2 rounded-md text-xs font-semibold
              bg-blue-600 text-white hover:bg-blue-700 transition
            "
          >
            Official website
          </a>
        )}
      </div>
    </div>
  );
}

/* ============================= */
/* ⚽️🏉 Match snap card */
/* ============================= */

function MatchSnapCard({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const eventDate = new Date(event.date);
  const isLive = event.status === 'LIVE';

  const today = new Date().toISOString().slice(0, 10);
  const isToday = eventDate.toISOString().slice(0, 10) === today;

  const directionsUrl =
    event.location &&
    `https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}`;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[82%] max-w-sm z-20">
      <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm px-4 py-3">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xs text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Meta */}
        <p className="text-[11px] text-gray-500 mb-2">
          {isLive && (
            <span className="text-red-600 font-semibold">🔴 Live now</span>
          )}

          {!isLive && isToday && (
            <span className="text-yellow-600 font-semibold">
              Today · {formatEventTimeWithOffsetUTC(eventDate)}
            </span>
          )}

          {!isLive && !isToday && formatEventTimeWithOffsetUTC(eventDate)}
        </p>

        {/* Teams */}
        <div className="flex items-center justify-between gap-3">
          <TeamBlock name={event.homeTeam} logo={event.homeTeamLogo} />
          <span className="text-xs text-gray-400">vs</span>
          <TeamBlock name={event.awayTeam} logo={event.awayTeamLogo} />
        </div>

        {/* Venue + Directions */}
        {event.venue && (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
            <span className="truncate">📍 {event.venue}</span>
            {directionsUrl && (
              <>
                <span className="opacity-40">·</span>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline whitespace-nowrap"
                >
                  Get directions
                </a>
              </>
            )}
          </div>
        )}

        {/* Primary Action */}
        <button
          type="button"
          disabled={!isLive}
          className={`
            mt-3 w-full py-2 rounded-md text-xs font-semibold transition
            ${
              isLive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default'
            }
          `}
        >
          {isLive ? 'Join live chat' : 'Live chat opens soon'}
        </button>
      </div>
    </div>
  );
}

/* ============================= */
/* Team block */
/* ============================= */

function TeamBlock({
  name,
  logo,
}: {
  name?: string;
  logo?: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {logo && (
        <Image
          src={logo}
          alt={name ?? 'Team'}
          width={24}
          height={24}
          className="rounded-full bg-gray-100 object-contain"
        />
      )}
      <span className="text-sm font-semibold truncate">
        {name}
      </span>
    </div>
  );
}
