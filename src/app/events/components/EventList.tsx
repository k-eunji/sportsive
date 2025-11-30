// src/app/events/components/EventList.tsx
'use client';

import EventCard from './EventCard';
import type { Event } from '@/types';

interface Props {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export default function EventList({ events, onEventClick }: Props) {
  if (!events || events.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 italic text-center mt-6 text-sm sm:text-base">
        No upcoming matches
      </p>
    );
  }

  return (
    <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
      {events.map((event) => (
        <div
          key={`${event.id}-${event.title}`}
          onClick={() => onEventClick?.(event)}
          role="button"
          tabIndex={0}
          className="py-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
        >
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
}
