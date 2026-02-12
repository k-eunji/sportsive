// src/app/uk/fixture-congestion/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";
import Link from "next/link";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

type Props = {
  params: Promise<{ date: string }>;
};

function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function formatDisplayDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const displayDate = formatDisplayDate(date);

  return {
    title: `UK Fixture Congestion — ${displayDate} | VenueScope`,
    description: `National fixture congestion analysis for ${displayDate}, highlighting overlapping kickoff windows and concurrent professional sports fixtures across the UK.`,
    alternates: {
      canonical: `https://venuescope.io/uk/fixture-congestion/${date}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");

  const ukEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  // 시간대별 집계
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

  const competitions: string[] = Array.from(
    new Set(
      ukEvents
        .map((e: any) => e.competition)
        .filter((c: unknown): c is string => typeof c === "string")
    )
  );

  const displayDate = formatDisplayDate(date);
  const currentDate = new Date(date);

  const previous = new Date(currentDate);
  previous.setDate(currentDate.getDate() - 1);

  const next = new Date(currentDate);
  next.setDate(currentDate.getDate() + 1);

  const previousDate = previous.toISOString().slice(0, 10);
  const nextDate = next.toISOString().slice(0, 10);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `UK Fixture Congestion — ${displayDate}`,
    description: `National fixture congestion analysis for ${displayDate}, including peak kickoff windows and concurrent professional sports fixtures.`,
    spatialCoverage: {
      "@type": "Place",
      name: "United Kingdom"
    },
    temporalCoverage: date,
    variableMeasured: [
      "Number of fixtures",
      "Peak kickoff hour",
      "Concurrent matches"
    ]
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          UK Fixture Congestion — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {ukEvents.length} professional sporting fixtures are scheduled
          across the United Kingdom on {displayDate}, resulting in measurable levels of national fixture overlap.
        </p>

        {peak && (
          <p className="text-muted-foreground">
            The most concentrated kickoff window occurs at{" "}
            <strong>{peak[0]}:00</strong>, with{" "}
            <strong>{peak[1]}</strong> simultaneous fixtures
            taking place across multiple regions.
          </p>
        )}

        {peak && peak[1] >= 10 && (
          <p className="text-muted-foreground">
            This represents one of the primary overlapping kickoff blocks of the day.
          </p>
        )}

        {peak && (
          <p className="text-muted-foreground mt-4">
            At this level of overlap, coordinated broadcast scheduling,
            regional safety planning and matchday operations monitoring
            may be required.
            National congestion patterns can influence referee allocation,
            travel logistics and emergency service deployment.
          </p>
        )}

      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Competitions contributing to congestion
        </h2>

        {competitions.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2">
            {competitions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            No structured competition data available for this date.
          </p>
        )}

        {competitions.length > 1 && (
          <p className="text-muted-foreground mt-4">
            Multiple competitions share the same kickoff window, creating concurrent match activity across regions.
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


      <section className="pt-8">
        <Link
          href={`/uk/sports/${date}`}
          className="underline underline-offset-4"
        >
          View all UK sports fixtures on {displayDate} →
        </Link>
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
