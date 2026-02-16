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
    title: `UK Fixture Congestion — ${displayDate} | National Overlap Analysis`,
    description: `National fixture congestion analysis for ${displayDate}, including peak kickoff overlap, regional distribution and operational scheduling density across the United Kingdom.`,
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

  const todayKey = new Date().toISOString().slice(0, 10);
  const isPast = date < todayKey;
  const isToday = date === todayKey;
  const isFuture = date > todayKey;

  const displayDate = formatDisplayDate(date);

  const ukEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  /* =========================
     HOURLY ANALYSIS
  ========================= */

  const hourMap = new Map<number, number>();

  ukEvents.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    const d = new Date(raw);
    if (isNaN(d.getTime())) return;

    const hour = Number(
      d.toLocaleString("en-GB", {
        hour: "2-digit",
        hour12: false,
        timeZone: "Europe/London",
      })
    );

    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
  });

  const sortedHours = [...hourMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const peak = sortedHours[0];

  const peakRatio =
    peak && ukEvents.length > 0
      ? Math.round((peak[1] / ukEvents.length) * 100)
      : 0;

  const congestionLevel =
    peak && peak[1] >= 6
      ? "High"
      : peak && peak[1] >= 3
      ? "Moderate"
      : "Low";

  /* =========================
     REGIONAL DISTRIBUTION
  ========================= */

  const regionMap = new Map<string, number>();

  ukEvents.forEach((e: any) => {
    const region = e.region ?? "Other";
    regionMap.set(region, (regionMap.get(region) ?? 0) + 1);
  });

  const regionBreakdown = [...regionMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `UK Fixture Congestion Report — ${displayDate}`,
    description: `National fixture congestion analysis for ${displayDate}, including peak kickoff overlap and regional distribution across the United Kingdom.`,
    author: {
      "@type": "Organization",
      name: "VenueScope",
    },
    publisher: {
      "@type": "Organization",
      name: "VenueScope",
    },
    datePublished: date,
    dateModified: date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://venuescope.io/uk/fixture-congestion/${date}`,
    },
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
        name: displayDate,
      },
    ],
  };

  /* =========================
     RELATED DATES
  ========================= */

  const currentDate = new Date(date);
  const previous = new Date(currentDate);
  previous.setDate(currentDate.getDate() - 1);

  const next = new Date(currentDate);
  next.setDate(currentDate.getDate() + 1);

  const previousDate = previous.toISOString().slice(0, 10);
  const nextDate = next.toISOString().slice(0, 10);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleData),
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
          UK Fixture Congestion Report — {displayDate}
        </h1>

        <p className="text-muted-foreground leading-relaxed">
          {isPast &&
            `A total of ${ukEvents.length} professional fixtures were held across the United Kingdom on this date.`}

          {isToday &&
            `A total of ${ukEvents.length} professional fixtures are scheduled across the United Kingdom today.`}

          {isFuture &&
            `A total of ${ukEvents.length} professional fixtures are scheduled across the United Kingdom on this date.`}
        </p>

      </header>

      {/* ================= KPI BLOCK ================= */}

      <section className="border rounded-xl p-8 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total fixtures
            </p>
            <p className="text-3xl font-semibold">
              {ukEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Peak kickoff hour
            </p>
            <p className="text-3xl font-semibold">
              {peak ? `${peak[0]}:00` : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Peak share
            </p>
            <p className="text-3xl font-semibold">
              {peak ? `${peakRatio}%` : "—"}
            </p>
          </div>

        </div>

        <p className="text-sm text-muted-foreground">
          Overall congestion level:{" "}
          <strong>{congestionLevel}</strong>
        </p>

      </section>

      {/* ================= KICKOFF ANALYSIS ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Kickoff overlap analysis
        </h2>

        {peak && (
          <p className="text-muted-foreground leading-relaxed">
            {isPast
              ? `The highest recorded overlap occurred at ${peak[0]}:00 with ${peak[1]} concurrent fixtures nationwide.`
              : `The primary overlap window occurs at ${peak[0]}:00 with ${peak[1]} concurrent fixtures nationwide.`}

            {" "}Approximately {peakRatio}% of all fixtures are concentrated within this period.
          </p>
        )}

        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          {sortedHours.slice(0, 3).map(([hour, count]) => (
            <li key={hour}>
              {hour}:00 — {count} concurrent fixture
              {count !== 1 ? "s" : ""}
            </li>
          ))}
        </ul>

      </section>

      {/* ================= REGIONAL DISTRIBUTION ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Regional distribution
        </h2>

        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          {regionBreakdown.map(([region, count]) => (
            <li key={region}>
              {region} — {count} fixture{count !== 1 ? "s" : ""}
            </li>
          ))}
        </ul>

      </section>

      {/* ================= OPERATIONAL INTERPRETATION ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Operational interpretation
        </h2>

        <p className="text-muted-foreground leading-relaxed">
          National-level fixture congestion can influence referee allocation,
          broadcast slot coordination, transport demand modelling,
          policing coverage and stadium staffing distribution.
          Overlap windows increase concurrent operational pressure
          across competitions.
        </p>

      </section>

      {/* ================= DATE NAVIGATION ================= */}

      <section className="space-y-6 border-t flex justify-between text-sm">

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

      </section>

      {/* ================= OVERVIEW LINK ================= */}

      <section className="space-y-6">

        <Link
          href="/uk/fixture-congestion"
          className="underline underline-offset-4"
        >
          View live UK congestion overview →
        </Link>

      </section>

      {/* ================= CTA ================= */}

      <section>

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
