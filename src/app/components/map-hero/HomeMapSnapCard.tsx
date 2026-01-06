// src/app/components/map-hero/HomeMapSnapCard.tsx

'use client';

import type { Event } from '@/types';
import { formatEventTimeWithOffsetUTC } from '@/utils/date';
import Link from 'next/link';

export default function HomeMapSnapCard({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const isLive = event.status === 'LIVE';

  return (
    <div
      className="
        fixed left-0 right-0 z-40
        bottom-[58px]
        pb-[env(safe-area-inset-bottom)]
        bg-white dark:bg-black
        border-t
      "
    >
      <div className="max-w-3xl mx-auto px-4 py-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">
              {formatEventTimeWithOffsetUTC(new Date(event.date))}
            </p>
            <p className="text-sm font-medium">
              {event.homeTeam} vs {event.awayTeam}
            </p>

            {isLive && (
              <p className="text-xs text-red-600 mt-0.5">
                Live now
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        {/* Actions */}
        <div className="mt-3">
          <Link
            href={`/events?focus=${event.id}`}
            className="
              text-sm font-medium
              text-blue-600
              hover:underline
              underline-offset-4
            "
          >
            Open match details →
          </Link>
        </div>
      </div>
    </div>
  );
}
