// src/app/uk/manchester/live-sports-today/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Sports in Manchester Today | Sportsive",
  description:
    "See live sports matches happening in Manchester today. Football, rugby and other events — shown by location and time.",
};

export default function ManchesterLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports happening in Manchester today
      </h1>

      <p className="text-muted-foreground">
        Looking for live sports happening in Manchester today?
        This page helps you discover football, rugby and other sports
        events taking place across the city.
      </p>

      <p className="text-muted-foreground">
        Manchester hosts major football matches at Old Trafford and the Etihad Stadium,
        along with rugby and indoor sports across local venues.
        Sportsive brings these events together so you can quickly check
        what’s actually happening today.
      </p>

      <h2 className="text-xl font-semibold pt-6">
        Frequently asked questions
      </h2>

      <h3 className="font-medium">
        What sports are happening in Manchester today?
      </h3>
      <p className="text-muted-foreground">
        Football, rugby and other live sports events are taking place across Manchester today,
        depending on local fixtures and tournaments.
      </p>

      <h3 className="font-medium">
        Where can I find live sports near me in Manchester?
      </h3>
      <p className="text-muted-foreground">
        Sportsive shows live sports events by location and time,
        so you can quickly check what’s happening nearby without following teams or leagues.
      </p>

      <a
        href="/app"
        className="inline-block mt-6 underline underline-offset-4"
      >
        Open the live sports map
      </a>
            {/* FAQ SECTION (SEO) */}
      <section className="pt-12 space-y-4">
        <h2 className="text-xl font-semibold">
          Frequently asked questions
        </h2>

        <div className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground">
              What sports are happening in manchester today?
            </h3>
            <p>
              Football, rugby, tennis and other live sports events are
              taking place across London today at stadiums, arenas
              and local venues.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">
              Where can I find live sports near me in manchester?
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
