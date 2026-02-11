//src/app/uk/football-today/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Football Fixtures in the UK Today | VenueScope",
  description:
    "Professional football fixtures taking place across the UK today, including Premier League and EFL competitions.",
  alternates: {
    canonical: "https://venuescope.io/uk/football-today",
  },
};

export default function UKFootballTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Football fixtures in the UK today
      </h1>

      <p className="text-muted-foreground">
        Scheduled professional football matches taking place today across the UK,
        including top-tier and lower-league competitions.
      </p>

      <p className="text-muted-foreground">
        Fixtures are organised by venue and scheduled start time.
      </p>

      <a
        href="/ops"
        className="inline-block mt-6 underline underline-offset-4"
      >
        View football fixtures on the map →
      </a>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          Platform context
        </h2>
        <p className="text-muted-foreground">
          VenueScope aggregates professional sports schedules to provide
          visibility into timing overlap and geographic concentration
          across multiple competitions.
        </p>
      </section>
    </main>
  );
}
