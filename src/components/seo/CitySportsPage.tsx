//src/components/seo/CitySportsPage.tsx

type Props = {
  city: string;
  countryLabel: string; // "UK" or "Ireland"
};

export default function CitySportsPage({ city, countryLabel }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports in {city} today
      </h1>

      <p className="text-muted-foreground">
        Professional sports fixtures scheduled across {city} today,
        including football, rugby and other competitions.
      </p>

      <p className="text-muted-foreground">
        Events are organised by venue and scheduled start time.
        Coverage reflects publicly available professional fixture data.
      </p>

      <a
        href="/ops"
        className="inline-block mt-6 underline underline-offset-4"
      >
        View {city} schedule on the interactive map →
      </a>

      <section className="pt-12">
        <h2 className="text-xl font-semibold">
          About VenueScope
        </h2>
        <p className="text-muted-foreground">
          VenueScope provides spatial and scheduling visibility across {countryLabel}
          professional sports, supporting league and event operators with
          overlap detection, peak-time analysis and geographic concentration monitoring.
        </p>
      </section>
    </main>
  );
}
