// src/app/uk/london/sports-this-weekend/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Fixtures in London This Weekend | VenueScope",
  description:
    "Professional sports fixtures scheduled in London this weekend, organised by venue and start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/london/sports-this-weekend",
  },
};

export default function LondonWeekendPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Sports fixtures in London this weekend
      </h1>

      <p className="text-muted-foreground">
        Professional sports events scheduled across London this weekend,
        including football, rugby and other major competitions.
      </p>

      <p className="text-muted-foreground">
        Events are listed by venue and scheduled start time.
      </p>

      <a
        href="/ops"
        className="inline-block mt-6 underline underline-offset-4"
      >
        View London schedule on the interactive map →
      </a>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          Platform context
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
