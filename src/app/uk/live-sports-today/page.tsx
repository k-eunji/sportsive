///src/app/uk/live-sports-today/page.tsx

export const metadata = {
  title: "Live Sports in the UK Today | Sportsive",
  description:
    "Find live sports matches happening across the UK today. Football, rugby, tennis and more — shown by city, location and time.",
};

export default function UKLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports happening across the UK today
      </h1>

      <p className="text-muted-foreground">
        Looking for live sports happening in the UK today?
        This page helps you discover football, rugby, tennis and other
        sports matches taking place across major UK cities.
      </p>

      <p className="text-muted-foreground">
        Sports events are often hard to find unless you already follow
        specific teams or leagues. Sportsive shows what’s happening
        based on location and time — without accounts or subscriptions.
      </p>

      <h2 className="text-xl font-semibold pt-8">
        Live sports by city
      </h2>

      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
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
              What sports are happening in the UK today?
            </h3>
            <p>
              <p>
                Football, rugby, tennis and other live sports events are
                taking place across the UK today, including matches
                in major cities such as London, Manchester, Birmingham and the UK.
              </p>

            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground">
              Where can I find live sports near me in the UK?
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
