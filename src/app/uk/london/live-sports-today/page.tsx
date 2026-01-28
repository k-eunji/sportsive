///src/app/uk/london/live-sports-today/page.tsx

export const metadata = {
  title: "Live Sports in London Today | Sportsive",
  description:
    "See live sports matches happening in London today. Football, rugby, tennis and more — mapped by location and time.",
};

export default function LondonLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports happening in London today
      </h1>

      <p className="text-muted-foreground">
        Looking for live sports happening in London today?
        This page shows football, rugby, tennis and other matches
        taking place around London, based on location and time.
      </p>

      <p className="text-muted-foreground">
        Most sports events in London are difficult to find unless
        you already follow the right teams or venues.
        Sportsive makes it easy to quickly check what’s happening nearby.
      </p>

      <a
        href="/app"
        className="inline-block mt-6 underline underline-offset-4"
      >
        See what’s happening on the map right now
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
              taking place across London today at stadiums, arenas
              and local venues.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">
              Where can I find live sports near me in London?
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
