// src/app/uk/fixture-congestion/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title: "UK Fixture Congestion Overview | VenueScope",
  description:
    "National fixture congestion overview across the United Kingdom, highlighting overlapping kickoff windows, concurrent professional sports fixtures and scheduling density patterns.",
  alternates: {
    canonical: "https://venuescope.io/uk/fixture-congestion",
  },
};

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export default async function Page() {
  const events = await getAllEventsRaw("180d");

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const ukEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      ["england", "scotland", "wales", "northern ireland"].includes(
        e.region?.toLowerCase()
      ) && eventKey === todayKey
    );
  });

  const hourMap = new Map<number, number>();

  ukEvents.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    const d = new Date(raw);
    if (isNaN(d.getTime())) return;

    const hourString = d.toLocaleString("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Europe/London"
    });

    const h = Number(hourString);

    hourMap.set(h, (hourMap.get(h) ?? 0) + 1);
  });

  const sorted = [...hourMap.entries()].sort((a, b) => b[1] - a[1]);
  const peak = sorted[0];

  const displayDate = formatDisplayDate(today);

  const previous = new Date(today);
  previous.setDate(today.getDate() - 1);

  const next = new Date(today);
  next.setDate(today.getDate() + 1);

  const previousDate = previous.toISOString().slice(0, 10);
  const nextDate = next.toISOString().slice(0, 10);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "UK Fixture Congestion Overview",
    description:
      "National overview of professional sports fixture congestion across the United Kingdom, including peak kickoff windows and concurrent match density.",
    spatialCoverage: {
      "@type": "Place",
      name: "United Kingdom"
    },
    temporalCoverage: todayKey,
    variableMeasured: [
      "Number of fixtures",
      "Peak kickoff hour",
      "Concurrent matches"
    ]
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          What is fixture congestion?
        </h2>

        <p className="text-muted-foreground">
          Fixture congestion refers to periods where multiple professional
          sporting events are scheduled within the same time window across
          the United Kingdom. High overlap increases operational pressure
          on broadcast coordination, transport networks, policing resources
          and stadium staffing.
        </p>

        <h2 className="text-xl font-semibold">
          Why national overlap matters
        </h2>

        <p className="text-muted-foreground">
          Understanding peak scheduling clusters helps leagues, clubs and
          event operators anticipate resource strain, referee allocation,
          travel logistics planning and matchday safety coordination.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Today’s congestion signal — {displayDate}
        </h2>

        <p className="text-muted-foreground">
          {ukEvents.length} professional sporting fixtures are
          scheduled across the UK today.
        </p>

        {peak && (
          <p className="text-muted-foreground">
            {peak[1] >= 5 && (
              <>
                The primary overlapping kickoff window occurs at{" "}
                <strong>{peak[0]}:00</strong>, with{" "}
                <strong>{peak[1]}</strong> simultaneous fixtures
                nationwide.
              </>
            )}

            {peak[1] >= 3 && peak[1] < 5 && (
              <>
                The highest overlap occurs at{" "}
                <strong>{peak[0]}:00</strong>, with{" "}
                <strong>{peak[1]}</strong> fixtures scheduled concurrently.
              </>
            )}

            {peak[1] < 3 && (
              <>
                Limited fixture overlap is observed, with a maximum of{" "}
                <strong>{peak[1]}</strong> concurrent fixture
                at <strong>{peak[0]}:00</strong>.
              </>
            )}
          </p>
        )}
      </section>

      <section className="pt-8 space-y-2 text-sm">
        <p className="font-medium">Related dates</p>

        <div className="flex gap-4 flex-wrap">
          <Link
            href={`/uk/fixture-congestion/${previousDate}`}
            className="underline"
          >
            ← Previous day
          </Link>

          <Link
            href={`/uk/fixture-congestion/${nextDate}`}
            className="underline"
          >
            Next day →
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Daily congestion analysis
        </h2>

        <p className="text-muted-foreground">
          Review detailed fixture overlap breakdowns for specific dates.
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href={`/uk/fixture-congestion/${todayKey}`}
              className="underline underline-offset-4"
            >
              UK fixture congestion on {displayDate}
            </Link>
          </li>
        </ul>
      </section>

      <section className="pt-10 border-t space-y-4">
        <h2 className="text-xl font-semibold">
          Explore real-time operational insights
        </h2>

        <p className="text-muted-foreground">
          Move beyond static reports and explore live fixture overlap,
          peak congestion windows and regional scheduling patterns
          through the interactive UK operations dashboard.
        </p>

        <Link
          href="/ops"
          className="inline-block mt-2 px-4 py-2 rounded-md bg-black text-white text-sm font-medium"
        >
          Open UK Operations Dashboard →
        </Link>
      </section>

    </main>
  );
}
