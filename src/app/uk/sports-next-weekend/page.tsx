// src/app/uk/sports-next-weekend/page.tsx

import type { Metadata } from "next";
import { EventList } from "@/app/components/EventList";
import { getAllEvents } from "@/lib/events/getAllEvents";

export const metadata: Metadata = {
  title: "Sports Fixtures in the UK Next Weekend | VenueScope",
  description:
    "Professional sports fixtures scheduled across the UK next weekend, organised by city, venue and start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/sports-next-weekend",
  },
};

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

function getNextWeekendDateKeys() {
  const now = new Date();

  const base = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/London" })
  );

  const day = base.getDay();
  const thisSaturdayOffset = (6 - day + 7) % 7;

  // ✅ 다음 주 토요일
  base.setDate(base.getDate() + thisSaturdayOffset + 7);

  const saturday = new Date(base);
  const sunday = new Date(base);
  sunday.setDate(base.getDate() + 1);

  const satKey = saturday.toLocaleDateString("en-CA", {
    timeZone: "Europe/London",
  });

  const sunKey = sunday.toLocaleDateString("en-CA", {
    timeZone: "Europe/London",
  });

  return { satKey, sunKey, saturday, sunday };
}

function formatDateRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  };

  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`;
}

export default async function UKNextWeekendPage() {
  const { events } = await getAllEvents("30d");
  const { satKey, sunKey, saturday, sunday } =
    getNextWeekendDateKeys();

  const weekendEvents = events.filter((e: any) => {
    const key =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      (key === satKey || key === sunKey)
    );
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Sports Fixtures in the UK Next Weekend
        </h1>

        <p className="text-muted-foreground">
          {formatDateRange(saturday, sunday)}
        </p>

        <p className="text-muted-foreground">
          There are {weekendEvents.length} professional sporting
          events scheduled across the United Kingdom next weekend.
        </p>
      </header>
      <section className="border rounded-xl p-6 bg-muted/30">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Operational insight
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Planning ahead for staffing, broadcast allocation or transport coordination?
          Review projected fixture density and peak overlap windows.
        </p>

        <a
          href="/uk/fixture-congestion/next-weekend"
          className="inline-block mt-3 text-sm font-medium underline underline-offset-4"
        >
          View UK next weekend congestion analysis →
        </a>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Next weekend’s fixtures
        </h2>

        <EventList
          events={weekendEvents}
          fixedStartDate={satKey}
        />

      </section>

      <section className="pt-6 border-t space-y-4 text-sm">
        <a
          href="/uk/sports-this-weekend"
          className="block underline underline-offset-4"
        >
          View this weekend’s fixtures →
        </a>
        <a
          href="/uk/live-sports-today"
          className="underline underline-offset-4"
        >
          View today’s UK fixtures →
        </a>
      </section>

    </main>
  );
}
