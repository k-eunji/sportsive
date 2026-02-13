//src/app/uk/london/sports-next-weekend/page.tsx

import type { Metadata } from "next";
import { EventList } from "@/app/components/EventList";
import { getAllEvents } from "@/lib/events/getAllEvents";

export const metadata: Metadata = {
  title: "Sports Fixtures in London Next Weekend | VenueScope",
  description:
    "Professional sports fixtures scheduled in London next weekend, organised by venue and start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/london/sports-next-weekend",
  },
};

function getNextWeekendDateKeys() {
  const now = new Date();

  const base = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/London" })
  );

  const day = base.getDay();
  const thisSaturdayOffset = (6 - day + 7) % 7;

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

export default async function LondonNextWeekendPage() {
  const { events } = await getAllEvents("30d");
  const { satKey, saturday, sunday } =
    getNextWeekendDateKeys();

  const weekendEvents = events.filter((e: any) => {
    const key =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.city?.toLowerCase() === "london" &&
      (key === satKey ||
        key ===
          new Date(sunday).toLocaleDateString("en-CA", {
            timeZone: "Europe/London",
          }))
    );
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Sports Fixtures in London Next Weekend
        </h1>

        <p className="text-muted-foreground">
          {formatDateRange(saturday, sunday)}
        </p>

        <p className="text-muted-foreground">
          There are {weekendEvents.length} professional sporting
          events scheduled across London next weekend.
        </p>
      </header>

      <section className="border rounded-xl p-6 bg-muted/30">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Operational insight
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Planning ahead for venue staffing or transport coordination?
        </p>

        <a
          href="/uk/london/fixture-congestion/next-weekend"
          className="inline-block mt-3 text-sm font-medium underline underline-offset-4"
        >
          View London next weekend congestion analysis →
        </a>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Next weekend’s fixtures in London
        </h2>

        <EventList
          events={weekendEvents}
          fixedStartDate={satKey}
        />
      </section>

      <section className="pt-6 border-t space-y-4 text-sm">
        <a
          href="/uk/london/sports-this-weekend"
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


