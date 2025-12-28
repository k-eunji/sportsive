//src/app/events/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Event } from '@/types';
import { formatEventTimeWithOffsetUTC } from '@/utils/date';

export default function EventPage() {
  // ✅ 핵심: params 타입 명시
  const params = useParams() as { id?: string | string[] };
  const router = useRouter();

  const id =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : null;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        const found = (data.events ?? []).find((e: Event) => e.id === id);
        setEvent(found ?? null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return <p className="text-center py-20 text-gray-500">Loading match…</p>;
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Match not found</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 underline"
        >
          ← Back
        </button>

      </div>
    );
  }

  const isLive = event.status === 'LIVE';

  const directionsUrl =
    event.location &&
    `https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}`;

  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-6">

      <header>
        <h1 className="text-2xl font-bold">
          {event.homeTeam} vs {event.awayTeam}
        </h1>
        <p className="text-sm text-gray-500">
          {formatEventTimeWithOffsetUTC(new Date(event.date))}
        </p>
      </header>

      {event.venue && (
        <div className="text-sm text-gray-600">
          📍 {event.venue}
          {directionsUrl && (
            <div className="mt-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-blue-600 underline"
              >
                Get directions
              </a>
            </div>
          )}
        </div>
      )}

      <div className="text-sm">
        {isLive ? (
          <span className="text-red-600 font-semibold">🔴 Live now</span>
        ) : (
          <span className="text-gray-500">⏰ Match hasn’t started yet</span>
        )}
      </div>

      <button
        className={`w-full py-3 rounded-lg text-sm font-semibold ${
          isLive
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {isLive ? 'Join live chat' : 'Wait here for the chat'}
      </button>

      <div className="text-center pt-4">
        <button
          onClick={() => router.push('/events')}
          className="text-sm text-gray-500 underline"
        >
          Back to map
        </button>
      </div>
    </main>
  );
}
