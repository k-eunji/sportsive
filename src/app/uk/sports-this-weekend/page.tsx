// src/app/uk/sports-this-weekend/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Fixtures in the UK This Weekend | VenueScope",
  description:
    "Professional sports fixtures scheduled across the UK this weekend, organised by city, venue and start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/sports-this-weekend",
  },
};

export default function UKWeekendPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Sports fixtures in the UK this weekend
      </h1>

      <p className="text-muted-foreground">
        Overview of professional sports events scheduled across the United Kingdom
        this weekend, including football, rugby, horse racing and other competitions.
      </p>

      <p className="text-muted-foreground">
        Fixtures are organised by city, venue and scheduled start time.
      </p>

      <a
        href="/ops"
        className="inline-block mt-6 underline underline-offset-4"
      >
        View full weekend schedule on the map →
      </a>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          About VenueScope
        </h2>
        <p className="text-muted-foreground">
          VenueScope provides spatial and scheduling visibility across UK
          professional sports, helping league and event operators monitor
          overlap, peak windows and geographic concentration.
        </p>
      </section>
    </main>
  );
}
