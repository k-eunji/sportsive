// src/app/uk/live-sports-today/page.tsx

import type { Metadata } from "next";
import { EventList } from "@/app/components/EventList";
import { getAllEvents } from "@/lib/events/getAllEvents";

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
  });
}

export default async function UKLiveSportsTodayPage() {

  // 🔥 이미 today window 지원
  const { events } = await getAllEvents("today");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Live sports across the UK today
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
          Today’s fixtures
        </h2>

        <EventList events={events} />
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
