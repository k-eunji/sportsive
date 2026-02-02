// src/app/components/EventList.tsx

"use client";

import type { Event } from "@/types";
import { groupEventsByDate } from "@/lib/groupEventsByDate";
import { EventCard } from "./EventCard";

/* =========================
   DATE HELPERS
========================= */

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function eachDay(start: Date, end: Date) {
  const days: Date[] = [];
  const d = new Date(start);

  while (d < end) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  return days;
}

function formatDateHeader(dateKey: string) {
  return new Date(dateKey).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* =========================
   MAIN
========================= */

export function EventList({ events }: { events: Event[] }) {
  const grouped = groupEventsByDate(events);

  // 이벤트 자체가 하나도 없을 때 (아예 데이터 없음)
  if (events.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No upcoming events.
      </p>
    );
  }

  // 🔑 날짜 축은 "오늘부터 마지막 이벤트 날짜까지"
  const dates = events
    .map((e: any) => {
      const raw = e.date ?? e.utcDate ?? e.startDate;
      if (!raw) return null;
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    })
    .filter(Boolean) as Date[];

  const start = startOfDay(new Date());
  const lastEventDate = new Date(
    Math.max(...dates.map((d) => d.getTime()))
  );

  // 마지막 이벤트 날짜까지 포함
  const end = addDays(startOfDay(lastEventDate), 1);

  const days = eachDay(start, end);

  return (
    <div>
      {days.map((day) => {
        const key = day.toISOString().slice(0, 10);
        const cards = grouped[key] ?? [];

        return (
          <section key={key}>
            <h3 className="mt-6 mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {formatDateHeader(key)}
            </h3>

            {cards.length > 0 ? (
              <div className="divide-y">
                {cards.map((card) => (
                  <EventCard key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <p className="py-4 text-sm text-muted-foreground">
                No events scheduled.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
