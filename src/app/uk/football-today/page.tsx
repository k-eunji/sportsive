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
  });
}

export default async function UKFootballTodayPage() {
  const events = await getAllEventsRaw();

  const todayKey = new Date().toISOString().slice(0, 10);

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
          Football fixtures in the UK today
        </h1>

        <p className="text-sm text-muted-foreground">
          Updated: {formatToday()}
        </p>

        <p className="text-muted-foreground">
          Scheduled professional football matches taking place today across the UK,
          including Premier League and EFL competitions.
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
          View all UK fixtures →
        </a>
      </section>

    </main>
  );
}
