// src/app/events/EventsClient.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Event } from '@/types';
import EventMap from './components/EventMap';
import EventList from './components/EventList';
import EventFilterBar from './components/EventFilter';

export default function EventsClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // 이벤트 로딩
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events ?? []);
      setFilteredEvents(data.events ?? []);
    }
    load();
  }, []);

  return (
    <>
      <EventMap
        events={filteredEvents}
        filteredEvents={filteredEvents}
        setFilteredEvents={setFilteredEvents}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
      />
      <EventList
        events={filteredEvents}
        onEventClick={setSelectedEvent}
      />
    </>
  );
}
