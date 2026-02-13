// src/app/ireland/fixture-congestion/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";
import Link from "next/link";

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
    timeZone: "Europe/Dublin",
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
    title: `Ireland Fixture Congestion — ${displayDate}`,
    description:
      `National fixture congestion analysis for ${displayDate}, including peak kickoff overlap and competition distribution across Ireland.`,
    alternates: {
      canonical:
        `https://venuescope.io/ireland/fixture-congestion/${date}`,
    },
  };
}

export default async function Page({ params }: Props) {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");
  const displayDate = formatDisplayDate(date);

  const todayKey = new Date().toISOString().slice(0, 10);

  const isPast = date < todayKey;
  const isToday = date === todayKey;
  const isFuture = date > todayKey;

  /* ===================== FILTER ===================== */

  const irelandEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.region?.toLowerCase() === "ireland" &&
      eventKey === date
    );
  });

  /* ===================== HOURLY ===================== */

  const hourMap = new Map<number, number>();

  irelandEvents.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    const d = new Date(raw);
    if (isNaN(d.getTime())) return;

    const hourString = d.toLocaleString("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Europe/Dublin",
    });

    const h = Number(hourString);
    hourMap.set(h, (hourMap.get(h) ?? 0) + 1);
  });

  const sortedHours = [...hourMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const peak = sortedHours[0];

  const peakRatio =
    peak && irelandEvents.length > 0
      ? Math.round((peak[1] / irelandEvents.length) * 100)
      : 0;

  const congestionLevel =
    peak && peak[1] >= 6
      ? "High"
      : peak && peak[1] >= 3
      ? "Moderate"
      : "Low";

  /* ===================== STRUCTURED DATA ===================== */

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Ireland Fixture Congestion — ${displayDate}`,
    description:
      `National fixture congestion analysis for ${displayDate} across Ireland.`,
    spatialCoverage: {
      "@type": "Place",
      name: "Ireland",
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
        name: "Ireland Fixture Congestion",
        item: "https://venuescope.io/ireland/fixture-congestion",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
      },
    ],
  };

  /* ===================== RELATED DATES ===================== */

  const currentDate = new Date(date);

  const prev = new Date(currentDate);
  prev.setDate(currentDate.getDate() - 1);

  const next = new Date(currentDate);
  next.setDate(currentDate.getDate() + 1);

  const prevDate = prev.toISOString().slice(0, 10);
  const nextDate = next.toISOString().slice(0, 10);

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
          Ireland Fixture Congestion Report — {displayDate}
        </h1>

        <p className="text-muted-foreground leading-relaxed">
          {isPast &&
            `A total of ${irelandEvents.length} professional fixtures were held across Ireland on this date.`}
          {isToday &&
            `A total of ${irelandEvents.length} professional fixtures are scheduled across Ireland today.`}
          {isFuture &&
            `A total of ${irelandEvents.length} professional fixtures are scheduled across Ireland on this date.`}
        </p>

      </header>

      {/* ================= KPI ================= */}

      <section className="border rounded-xl p-8 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total fixtures
            </p>
            <p className="text-3xl font-semibold">
              {irelandEvents.length}
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

      {/* ================= OVERLAP ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Kickoff overlap analysis
        </h2>

        {peak && (
          <p className="text-muted-foreground leading-relaxed">
            {isPast
              ? `The highest recorded overlap occurred at ${peak[0]}:00 with ${peak[1]} concurrent fixtures nationwide.`
              : `The primary overlap window occurs at ${peak[0]}:00 with ${peak[1]} concurrent fixtures nationwide.`}
            {" "}
            Approximately {peakRatio}% of all fixtures are concentrated within this period.
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

      {/* ================= NAVIGATION ================= */}

      <section className="pt-8 border-t flex justify-between text-sm">

        <Link
          href={`/ireland/fixture-congestion/${prevDate}`}
          className="underline"
        >
          ← Previous day
        </Link>

        <Link
          href={`/ireland/fixture-congestion/${nextDate}`}
          className="underline"
        >
          Next day →
        </Link>

      </section>

      <section className="space-y-6">

        <Link
          href="/ireland/fixture-congestion"
          className="underline underline-offset-4"
        >
          View live Ireland congestion overview →
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
