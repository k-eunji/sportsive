//src/app/ireland/sports-this-weekend/page.tsx

import type { Metadata } from "next";
import { EventList } from "@/app/components/EventList";
import { getAllEvents } from "@/lib/events/getAllEvents";

export const metadata: Metadata = {
  title: "Sports Fixtures in the Ireland This Weekend | VenueScope",
  description:
    "Professional sports fixtures scheduled across Ireland this weekend, organised by city, venue and start time.",
  alternates: {
    canonical: "https://venuescope.io/ireland/sports-this-weekend",
  },
};

function getWeekendDateKeys() {
  const now = new Date();
  const day = now.getDay();

  let saturday = new Date(now);

  if (day === 6) {
    // Saturday
  } else if (day === 0) {
    // Sunday → yesterday Saturday
    saturday.setDate(now.getDate() - 1);
  } else {
    // Mon–Fri → upcoming Saturday
    saturday.setDate(now.getDate() + (6 - day));
  }

  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  return {
    satKey: saturday.toISOString().slice(0, 10),
    sunKey: sunday.toISOString().slice(0, 10),
  };
}

function formatUpdated() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function IrelandWeekendPage() {
  const { events } = await getAllEvents("7d");

  const { satKey, sunKey } = getWeekendDateKeys();

  const weekendEvents = events.filter((e: any) => {
    const eventKey = (e.startDate ?? e.date)?.slice(0, 10);

    return (
        e.region?.toLowerCase() === "ireland" &&
        (eventKey === satKey || eventKey === sunKey)
    );
    });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Sports fixtures in Ireland this weekend
        </h1>

        <p className="text-sm text-muted-foreground">
          Updated: {formatUpdated()}
        </p>

        <p className="text-muted-foreground">
          Professional sports events scheduled across Ireland
          this weekend, organised by city, venue and scheduled start time.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          This weekend’s fixtures
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

        <EventList events={weekendEvents} startFromFirstEvent />
      </section>

      <section className="pt-8">
        <a
          href="/ireland/live-sports-today"
          className="underline underline-offset-4"
        >
          View today’s UK fixtures →
        </a>
      </section>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          About VenueScope
        </h2>
        <p className="text-muted-foreground">
          VenueScope provides spatial and scheduling visibility across Irish
          professional sports, helping league and event operators monitor
          overlap, peak windows and geographic concentration.
        </p>
      </section>

    </main>
  );
}
