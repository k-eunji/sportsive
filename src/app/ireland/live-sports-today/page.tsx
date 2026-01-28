///src/app/ireland/live-sports-today/page.tsx

export const metadata = {
  title: "Live Sports in Ireland Today | Sportsive",
  description:
    "Find live sports matches happening across Ireland today. Football, rugby and more — shown by location and time.",
};

export default function IrelandLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports happening across Ireland today
      </h1>

      <p className="text-muted-foreground">
        Discover sports matches happening today across Ireland,
        including football, rugby and other live events.
      </p>

      <ul className="list-disc pl-6 text-muted-foreground">
        <li>
          <a href="/ireland/dublin/live-sports-today" className="underline">
            Live sports in Dublin today
          </a>
        </li>
      </ul>

      <a href="/app" className="underline underline-offset-4">
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
              What sports are happening in Ireland today?
            </h3>
            <p>
              Football, rugby, tennis and other live sports events are
              taking place across London today at stadiums, arenas
              and local venues.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">
              Where can I find live sports near me in Ireland?
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
