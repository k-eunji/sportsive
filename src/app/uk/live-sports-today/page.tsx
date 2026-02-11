///src/app/uk/live-sports-today/page.tsx

export const metadata = {
  title: "Live Sports in the UK Today | VenueScope",
  description:
    "Professional sports fixtures taking place across the UK today, organised by city, venue and scheduled start time.",
};

export default function UKLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports across the UK today
      </h1>

      <p className="text-muted-foreground">
        Overview of professional sports fixtures taking place today across the United Kingdom.
        Events are organised by city, venue and scheduled start time.
      </p>

      <h2 className="text-xl font-semibold pt-8">
        By city
      </h2>

      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
        <li>
          <a href="/uk/london/live-sports-today" className="underline">
            London
          </a>
        </li>
        <li>
          <a href="/uk/manchester/live-sports-today" className="underline">
            Manchester
          </a>
        </li>
        <li>
          <a href="/uk/birmingham/live-sports-today" className="underline">
            Birmingham
          </a>
        </li>
      </ul>

      <a
        href="/ops"
        className="inline-block mt-6 underline underline-offset-4"
      >
        View full operational map →
      </a>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          About VenueScope
        </h2>
        <p className="text-muted-foreground">
          VenueScope provides scheduling visibility across UK professional sports,
          supporting league and event operators with overlap detection and
          peak-time analysis.
        </p>
      </section>
    </main>
  );
}
