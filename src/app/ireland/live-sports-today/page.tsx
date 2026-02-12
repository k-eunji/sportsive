// src/app/ireland/live-sports-today/page.tsx

import type { Metadata } from "next";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title: "Live Sports in Ireland Today | VenueScope",
  description:
    "Professional sports fixtures taking place across Ireland today, organised by city, venue and scheduled start time.",
  alternates: {
    canonical: "https://venuescope.io/ireland/live-sports-today",
  },
};

function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Dublin",
  });
}

function getTodayKey() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Dublin",
  });
}

export default async function IrelandLiveSportsTodayPage() {
  const events = await getAllEventsRaw("180d");

  const todayKey = getTodayKey();

  const irelandTodayEvents = events.filter((e: any) => {
    const eventKey = (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.region?.toLowerCase() === "ireland" &&
      eventKey === todayKey
    );
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Sports in Ireland Today — {formatToday()}
        </h1>

        <p className="text-sm text-muted-foreground">
          Updated: {formatToday()}
        </p>

        <p className="text-muted-foreground">
          Professional sports fixtures taking place across Ireland today,
          organised by city, venue and scheduled start time.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Today’s fixtures in Ireland
        </h2>

        <p className="text-muted-foreground mb-4">
          There are {irelandTodayEvents.length} professional sporting events
          taking place across Ireland today. Fixtures include football,
          rugby, horse racing and other major competitions.
          Events are distributed across key venues, with activity
          typically concentrated in the late afternoon and evening.
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

        <EventList events={irelandTodayEvents} />
      </section>

      <section>
        <h2 className="text-xl font-semibold pt-8">
          By city
        </h2>

        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-4">
          <li>
            <a href="/ireland/dublin/live-sports-today" className="underline">
              Live sports in Dublin today
            </a>
          </li>
        </ul>
      </section>

      <section className="pt-8">
        <a
          href="/ops"
          className="underline underline-offset-4"
        >
          Open interactive schedule view →
        </a>
      </section>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          About VenueScope
        </h2>
        <p className="text-muted-foreground">
          VenueScope maps professional sports schedules to provide
          operational visibility into timing overlap and venue concentration.
        </p>
      </section>

    </main>
  );
}
