// src/app/components/map-hero/MapHero.tsx

'use client';

import { useEffect, useState } from 'react';
import HomeEventMap from './HomeEventMap';
import type { Event } from '@/types';

export default function MapHero() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/events?limit=20');
      const data = await res.json();

      const now = new Date();
      const in7Days = new Date();
      in7Days.setDate(now.getDate() + 7);

      const upcoming = (data.events ?? []).filter((e: any) => {
        const date = new Date(e.date ?? e.utcDate);
        return date >= now && date <= in7Days;
      });

      setEvents(upcoming);
    }
    load();
  }, []);

  if (!events.length) return null;

  return (
    <section id="map" className="mt-14 space-y-4">
      {/* 🔹 Context (텍스트는 맵 위가 아니라 맵 앞에) */}
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-medium tracking-tight">
          Matches near you
        </h2>
        <p className="text-sm text-gray-500">
          Live & upcoming · Next 7 days
        </p>
      </div>

      {/* 🗺️ Map (UI 없음, 증거만) */}
      <div className="relative">
        <HomeEventMap events={events} />
      </div>
    </section>
  );
}
