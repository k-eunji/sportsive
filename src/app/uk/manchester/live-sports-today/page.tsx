// src/app/uk/manchester/live-sports-today/page.tsx

import type { Metadata } from "next";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title: "Live Sports in Manchester Today | VenueScope",
  description:
    "Professional sports fixtures taking place in Manchester today, organised by venue and scheduled start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/manchester/live-sports-today",
  },
};

function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function ManchesterLiveSportsTodayPage() {
  const events = await getAllEventsRaw();

  const todayKey = new Date().toISOString().slice(0, 10);

  const manchesterTodayEvents = events.filter((e: any) => {
    const eventKey = (e.startDate ?? e.date)?.slice(0, 10);

    return (
      e.city?.toLowerCase() === "manchester" &&
      eventKey === todayKey
    );
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Live sports in Manchester today
        </h1>

        <p className="text-sm text-muted-foreground">
          Updated: {formatToday()}
        </p>

        <p className="text-muted-foreground">
          Professional sports fixtures taking place across Manchester today,
          organised by venue and scheduled start time.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Today’s fixtures in Manchester
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

        <EventList events={manchesterTodayEvents} />
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
