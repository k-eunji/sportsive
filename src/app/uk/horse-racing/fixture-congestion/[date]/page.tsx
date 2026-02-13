///src/app/uk/horse-racing/fixture-congestion/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";

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
  return new Date(dateStr).toLocaleDateString("en-GB", {
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
    title: `UK Horse Racing Fixture Congestion — ${displayDate}`,
    description: `Horse racing meeting congestion analysis across the United Kingdom for ${displayDate}, including concurrent session overlap and scheduling density.`,
    alternates: {
      canonical: `https://venuescope.io/uk/horse-racing/fixture-congestion/${date}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");

  const racingEvents = events
    .filter((e: any) => {
      const rawDate =
        (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

      return (
        UK_REGIONS.includes(e.region?.toLowerCase()) &&
        e.sport?.toLowerCase().includes("horse") &&
        rawDate === date
      );
    })
    .sort((a: any, b: any) => {
      return new Date(a.startDate).getTime() -
        new Date(b.startDate).getTime();
    });

  /* ================= TIME STATE ================= */

  const todayKey = new Date().toISOString().slice(0, 10);
  const isPast = date < todayKey;
  const isToday = date === todayKey;
  const isFuture = date > todayKey;

  /* ================= OVERLAP ================= */

  const activeMap = new Map<number, number>();
  for (let hour = 0; hour < 24; hour++) {
    activeMap.set(hour, 0);
  }

  racingEvents.forEach((e: any) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);

    for (let h = 0; h < 24; h++) {
      const check = new Date(`${date}T${String(h).padStart(2, "0")}:00:00`);
      if (check >= start && check <= end) {
        activeMap.set(h, (activeMap.get(h) ?? 0) + 1);
      }
    }
  });

  const sortedHours = [...activeMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const peak = sortedHours[0];

  const displayDate = formatDisplayDate(date);

  /* ================= NAVIGATION ================= */

  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);

  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  const previousDate = previous.toISOString().slice(0, 10);
  const nextDate = next.toISOString().slice(0, 10);

  /* ================= STRUCTURED DATA ================= */

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `UK Horse Racing Fixture Congestion — ${displayDate}`,
    spatialCoverage: {
      "@type": "Place",
      name: "United Kingdom",
    },
    temporalCoverage: date,
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "UK Fixture Congestion",
        item: "https://venuescope.io/uk/fixture-congestion",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Horse Racing",
        item: "https://venuescope.io/uk/horse-racing/fixture-congestion",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayDate,
      },
    ],
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />

      {/* ================= HEADER ================= */}

      <header className="space-y-6">
        <h1 className="text-4xl font-bold leading-tight">
          UK Horse Racing Fixture Congestion — {displayDate}
        </h1>

        {racingEvents.length === 0 ? (
          <p className="text-muted-foreground">
            {isPast && "No race meetings were held on this date."}
            {isToday && "No race meetings are scheduled today."}
            {isFuture && "No race meetings are scheduled on this date."}
          </p>
        ) : (
          <p className="text-muted-foreground">
            {isPast &&
              `${racingEvents.length} race meeting${
                racingEvents.length !== 1 ? "s" : ""
              } were held across the UK.`}

            {isToday &&
              `${racingEvents.length} race meeting${
                racingEvents.length !== 1 ? "s" : ""
              } are scheduled across the UK today.`}

            {isFuture &&
              `${racingEvents.length} race meeting${
                racingEvents.length !== 1 ? "s" : ""
              } are scheduled across the UK.`}
          </p>
        )}
      </header>

      {/* ================= PEAK ================= */}

      {racingEvents.length > 1 && peak && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Meeting overlap analysis
          </h2>

          <p className="text-muted-foreground">
            {isPast
              ? `The highest concurrent meeting window occurred at ${peak[0]}:00.`
              : `The peak overlap window occurs at ${peak[0]}:00.`}
            {" "}
            {peak[1]} concurrent meeting
            {peak[1] !== 1 ? "s" : ""}.
          </p>
        </section>
      )}

      {/* ================= FULL LIST ================= */}

      {racingEvents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Full meeting list
          </h2>

          <ul className="space-y-3 text-muted-foreground">
            {racingEvents.map((e: any) => (
              <li
                key={e.id}
                className="flex justify-between border-b pb-2"
              >
                <span>
                  {e.venue} — {e.sessionTime}
                </span>

                <span className="text-sm">
                  {new Date(e.startDate).toLocaleTimeString(
                    "en-GB",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "Europe/London",
                    }
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ================= NAVIGATION ================= */}

      <section className="flex justify-between border-t pt-6 text-sm">
        <Link
          href={`/uk/horse-racing/fixture-congestion/${previousDate}`}
          className="underline"
        >
          ← Previous day
        </Link>

        <Link
          href={`/uk/horse-racing/fixture-congestion/${nextDate}`}
          className="underline"
        >
          Next day →
        </Link>
      </section>

      <section>
        <Link
          href="/uk/horse-racing/fixture-congestion"
          className="underline underline-offset-4"
        >
          View live horse racing congestion overview →
        </Link>
      </section>

      {/* ================= CTA ================= */}

      <section className="space-y-6">
        <Link
          href="/ops"
          className="inline-block px-5 py-3 rounded-md bg-black text-white text-sm font-medium"
        >
          Open Operations Dashboard →
        </Link>
      </section>

    </main>
  );
}
