// src/app/uk/football-today/page.tsx

import type { Metadata } from "next";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title: "Football Fixtures in the UK Today | VenueScope",
  description:
    "Professional football fixtures taking place across the UK today, including Premier League and EFL competitions.",
  alternates: {
    canonical: "https://venuescope.io/uk/football-today",
  },
};

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

function getTodayKey() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/London",
  });
}

export default async function UKFootballTodayPage() {
  const events = await getAllEventsRaw("180d");
  const todayKey = getTodayKey();

  const footballTodayEvents = events.filter((e: any) => {
    const eventKey = (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.sport?.toLowerCase() === "football" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === todayKey
    );
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Football Fixtures in the UK Today — {formatToday()}
        </h1>

        <p className="text-sm text-muted-foreground">
          Updated: {formatToday()}
        </p>

        <p className="text-muted-foreground">
          There are {footballTodayEvents.length} professional football matches
          scheduled across the United Kingdom today. Fixtures include
          Premier League, EFL Championship, League One, League Two
          and other domestic competitions.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Today’s football fixtures
        </h2>

        <EventList events={footballTodayEvents} />
      </section>

      <section className="pt-8">
        <a
          href="/uk/live-sports-today"
          className="underline underline-offset-4"
        >
          View all UK sports fixtures →
        </a>
      </section>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          About VenueScope
        </h2>
        <p className="text-muted-foreground">
          VenueScope provides scheduling visibility across UK professional sport,
          supporting operational planning and peak overlap analysis.
        </p>
      </section>

    </main>
  );
}
