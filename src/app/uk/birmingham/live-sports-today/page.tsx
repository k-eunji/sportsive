// src/app/uk/birmingham/live-sports-today/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Sports in Birmingham Today | Sportsive",
  description:
    "Find live sports matches happening in Birmingham today. Football, rugby and other events — mapped by location and time.",
};

export default function BirminghamLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports happening in Birmingham today
      </h1>

      <p className="text-muted-foreground">
        Looking for live sports happening in Birmingham today?
        This page shows football, rugby and other sports events
        taking place across the city.
      </p>

      <p className="text-muted-foreground">
        Birmingham hosts matches and tournaments across stadiums,
        arenas and local sports venues.
        Sportsive makes it easy to quickly check what’s happening nearby.
      </p>

      <h2 className="text-xl font-semibold pt-6">
        Frequently asked questions
      </h2>

      <h3 className="font-medium">
        What sports are happening in Birmingham today?
      </h3>
      <p className="text-muted-foreground">
        Football, rugby and other live sports events may be taking place in Birmingham today,
        depending on league and tournament schedules.
      </p>

      <h3 className="font-medium">
        How can I discover live sports near me?
      </h3>
      <p className="text-muted-foreground">
        Sportsive lets you explore live sports by location and time,
        without needing to follow specific teams or leagues.
      </p>

      <a
        href="/app"
        className="inline-block mt-6 underline underline-offset-4"
      >
        See what’s happening on the map
      </a>
            {/* FAQ SECTION (SEO) */}
      <section className="pt-12 space-y-4">
        <h2 className="text-xl font-semibold">
          Frequently asked questions
        </h2>

        <div className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground">
              What sports are happening in London today?
            </h3>
            <p>
              Football, rugby, tennis and other live sports events are
              taking place across birmingham today at stadiums, arenas
              and local venues.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">
              Where can I find live sports near me in birmingham?
            </h3>
            <p>
              Sportsive helps you discover live sports events by
              location and time, so you can quickly check what’s
              happening nearby without following teams or leagues.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
