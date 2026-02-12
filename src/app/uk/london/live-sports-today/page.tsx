// src/app/uk/london/live-sports-today/page.tsx

import type { Metadata } from "next";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title: "Live Sports in London Today | VenueScope",
  description:
    "Professional sports fixtures taking place in London today, organised by venue and scheduled start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/london/live-sports-today",
  },
};

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

export default async function LondonLiveSportsTodayPage() {
  const events = await getAllEventsRaw();
  const todayKey = getTodayKey();

  const londonTodayEvents = events.filter((e: any) => {
    const eventKey = (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.city?.toLowerCase() === "london" &&
      eventKey === todayKey
    );
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Sports in London Today — {formatToday()}
        </h1>

        <p className="text-sm text-muted-foreground">
          Updated: {formatToday()}
        </p>

        <p className="text-muted-foreground">
          Professional sports fixtures taking place across London today,
          organised by venue and scheduled start time.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Today’s fixtures in London
        </h2>

        <p className="text-muted-foreground mb-4">
          There are {londonTodayEvents.length} professional sporting events
          taking place in London today. Fixtures include football,
          rugby, cricket, horse racing and other major competitions.
          Activity is typically concentrated in afternoon and evening peak windows.
        </p>
        {/* Sport markers explanation */}
        <div className="mt-5 mb-3 text-xs text-muted-foreground space-y-1">
          <div className="font-medium text-foreground/70">
            Sport markers
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>F</strong> Football</span>
            <span><strong>R</strong> Rugby</span>
            <span><strong>B</strong> Basketball</span>
            <span><strong>C</strong> Cricket</span>
            <span><strong>H</strong> Horse racing</span>
            <span><strong>T</strong> Tennis</span>
            <span><strong>D</strong> Darts</span>
          </div>
        </div>
        <EventList events={londonTodayEvents} />
      </section>

      <section className="pt-8">
        <a
          href="/uk/live-sports-today"
          className="underline underline-offset-4"
        >
          View all UK fixtures →
        </a>
      </section>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          About VenueScope
        </h2>
        <p className="text-muted-foreground">
          VenueScope maps sports scheduling across multiple leagues
          to provide operational visibility into timing overlap and
          venue concentration.
        </p>
      </section>

    </main>
  );
}
