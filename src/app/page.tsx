//src/app/page.tsx

"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/types";
import EventListItem from "@/app/components/list/EventListItem";
import { buildNowStatus } from "@/lib/nowDashboard";

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("/api/events?window=1d")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []));
  }, []);

  const status = buildNowStatus(events, "today");

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Live sports near you today
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {status.text}
          </p>
        </div>

        {/* 🔵 OPEN MAP CTA */}
        <a
          href="/app"
          className="
            shrink-0
            px-4 py-2
            rounded-full
            bg-black text-white
            text-sm font-medium
            hover:bg-black/90
            transition
          "
        >
          Open map
        </a>
      </header>

      {/* LIST */}
      <section className="divide-y">
        {events.map((e) => (
          <EventListItem
            key={e.id}
            event={e}
            onClick={() => {
              // 👉 나중에 /app?eventId= 로 연결 가능
            }}
          />
        ))}

        {events.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nothing scheduled today
          </p>
        )}
      </section>
    </main>
  );
}
