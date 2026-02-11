///src/app/ireland/live-sports-today/page.tsx

export const metadata = {
  title: "Live Sports in Ireland Today | VenueScope",
  description:
    "Professional sports fixtures taking place across Ireland today, organised by city and start time.",
  alternates: {
    canonical: "https://venuescope.io/ireland/live-sports-today",
  },
};

export default function IrelandLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports across Ireland today
      </h1>

      <p className="text-muted-foreground">
        Overview of professional sports events taking place across Ireland today,
        including fixtures by city and venue.
      </p>

      <ul className="list-disc pl-6 text-muted-foreground">
        <li>
          <a href="/ireland/dublin/live-sports-today" className="underline">
            Live sports in Dublin today
          </a>
        </li>
      </ul>

      <a href="/ops" className="underline underline-offset-4">
        Open interactive schedule view →
      </a>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          Platform context
        </h2>
        <p className="text-muted-foreground">
          VenueScope maps sports scheduling across multiple leagues to provide
          operational visibility into timing and geographic overlap.
        </p>
      </section>
    </main>
  );
}
