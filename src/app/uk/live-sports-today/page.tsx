// src/app/uk/live-sports-today/page.tsx

import type { Metadata } from "next";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title: "Live Sports in the UK Today | VenueScope",
  description:
    "Professional sports fixtures taking place across the UK today, organised by city, venue and scheduled start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/live-sports-today",
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

export default async function UKLiveSportsTodayPage() {
  const events = await getAllEventsRaw("180d");

  const todayKey = getTodayKey();

  const UK_REGIONS = [
    "england",
    "scotland",
    "wales",
    "northern ireland",
  ];

  const todayEvents = events.filter((e: any) => {
    const eventKey = (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === todayKey
    );
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Sports in the UK Today — {formatToday()}
        </h1>

        <p className="text-sm text-muted-foreground">
          Updated: {formatToday()}
        </p>

        <p className="text-muted-foreground">
          Professional sports fixtures taking place across the United Kingdom today,
          organised by city, venue and scheduled start time.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Today’s fixtures across the UK
        </h2>

        <p className="text-muted-foreground mb-4">
          There are {todayEvents.length} professional sporting events
          taking place across England, Scotland, Wales and Northern Ireland today.
          Fixtures include football, rugby, cricket, horse racing and other
          major competitions. Activity is typically concentrated in the
          afternoon and evening peak windows.
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

        <EventList events={todayEvents} />
      </section>

      <section>
        <h2 className="text-xl font-semibold pt-8">
          By city
        </h2>

        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-4">
          <li>
            <a href="/uk/london/live-sports-today" className="underline">
              Live sports in London today
            </a>
          </li>
          <li>
            <a href="/uk/manchester/live-sports-today" className="underline">
              Live sports in Manchester today
            </a>
          </li>
          <li>
            <a href="/uk/birmingham/live-sports-today" className="underline">
              Live sports in Birmingham today
            </a>
          </li>
        </ul>
      </section>

      <section className="pt-8">
        <a
          href="/ops"
          className="inline-block underline underline-offset-4"
        >
          View full operational schedule on the interactive map →
        </a>
      </section>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          About VenueScope
        </h2>
        <p className="text-muted-foreground">
          VenueScope provides scheduling visibility across UK professional sports,
          supporting league and event operators with overlap detection,
          peak-window analysis and geographic concentration monitoring.
        </p>
      </section>

    </main>
  );
}
