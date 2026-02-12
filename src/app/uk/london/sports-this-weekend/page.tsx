// src/app/uk/london/sports-this-weekend/page.tsx

import type { Metadata } from "next";
import { getAllEvents } from "@/lib/events/getAllEvents";
import { EventList } from "@/app/components/EventList";

export const metadata: Metadata = {
  title: "Sports Fixtures in London This Weekend | VenueScope",
  description:
    "Professional sports fixtures scheduled in London this weekend, organised by venue and start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/london/sports-this-weekend",
  },
};

function getWeekendDateKeys() {
  const now = new Date();

  const saturday = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/London" })
  );

  const day = saturday.getDay();

  if (day !== 6) {
    saturday.setDate(saturday.getDate() + ((6 - day + 7) % 7));
  }

  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  const satKey = saturday.toLocaleDateString("en-CA", {
    timeZone: "Europe/London",
  });

  const sunKey = sunday.toLocaleDateString("en-CA", {
    timeZone: "Europe/London",
  });

  return { satKey, sunKey, saturday, sunday };
}

export default async function LondonWeekendPage() {
  const { events } = await getAllEvents("7d");
  const { satKey, sunKey, saturday, sunday } = getWeekendDateKeys();

  const weekendLondonEvents = events.filter((e: any) => {
    const eventKey = (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.city?.toLowerCase() === "london" &&
      (eventKey === satKey || eventKey === sunKey)
    );
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Sports Fixtures in London This Weekend
        </h1>

        <p className="text-muted-foreground">
          {saturday.toLocaleDateString("en-GB")} – {sunday.toLocaleDateString("en-GB")}
        </p>

        <p className="text-muted-foreground">
          There are {weekendLondonEvents.length} professional sporting events
          taking place in London this weekend.
          Fixtures are distributed across major stadium and arena venues.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          This weekend’s fixtures in London
        </h2>

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
        
        <EventList
          events={weekendLondonEvents}
          startFromFirstEvent
        />
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
