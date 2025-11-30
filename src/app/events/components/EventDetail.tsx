// src/app/events/components/EventDetail.tsx
'use client';

import type { Event } from '@/types';
import { formatEventTimeWithOffsetUTC } from '@/utils/date';

interface Props {
  event: Event;
}

export default function EventDetail({ event }: Props) {
  if (!event) return <p className="text-gray-500 text-center">No event selected</p>;

  const eventDate = event.date ? new Date(event.date) : null;

  return (
    <section
      className="
        w-full max-w-2xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-800 shadow-sm p-6 sm:p-8 
        text-gray-900 dark:text-gray-100 space-y-3
      "
    >
      {/* 제목 */}
      <header className="border-b border-gray-100 dark:border-gray-700 pb-3">
        <h1 className="text-3xl font-semibold tracking-tight text-blue-600 mb-1 text-balance">
          {event.title}
        </h1>
        {eventDate && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatEventTimeWithOffsetUTC(eventDate)}
          </p>
        )}
      </header>

      {/* 설명 */}
      {event.description && (
        <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {event.description}
        </p>
      )}

      {/* 구분선 */}
      <div className="border-t border-gray-100 dark:border-gray-700 my-3" />

      {/* 상세 정보 */}
      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
        {event.category && (
          <p>
            <span className="font-medium text-gray-800 dark:text-gray-200">Category:</span>{' '}
            {event.category}
          </p>
        )}
        {event.location && (
          <p>
            <span className="font-medium text-gray-800 dark:text-gray-200">Location:</span>{' '}
            {event.location.address} ({event.location.lat}, {event.location.lng})
          </p>
        )}
        {event.free ? (
          <p className="text-green-600 dark:text-green-400 font-medium">Free Event</p>
        ) : (
          <p>
            <span className="font-medium text-gray-800 dark:text-gray-200">Price:</span>{' '}
            ${event.price}
          </p>
        )}
      </div>
    </section>
  );
}
