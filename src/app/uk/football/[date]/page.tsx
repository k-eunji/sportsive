// src/app/uk/football/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";
import { DateNav } from "@/app/components/DateNav";
import Link from "next/link";
import OpsCta from "@/app/components/OpsCta";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

async function getFootballEventsByDate(date: string) {
  const events = await getAllEventsRaw("180d");

  const footballEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.sport?.toLowerCase() === "football" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  return footballEvents;
}

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

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

/* ================= METADATA ================= */

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const shortDate = formatShortDate(date);

  return {
    title: `Football Fixtures in the UK – ${shortDate} | Full Match List`,
    description: `Full list of professional football matches taking place across the United Kingdom on ${shortDate}. View venues, kickoff times and download the schedule in CSV or calendar format.`,
    alternates: {
      canonical: `https://venuescope.io/uk/football/${date}`,
    },
  };
}

/* ================= PAGE ================= */

export default async function Page({ params }: Props) {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");

  const footballEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.sport?.toLowerCase() === "football" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  if (footballEvents.length === 0) {
    notFound();
  }

  const availableDates = new Set<string>();

  events.forEach((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    if (
      e.sport?.toLowerCase() === "football" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey
    ) {
      availableDates.add(eventKey);
    }
  });

  const sortedDates = Array.from(availableDates).sort();

  /* =========================
    REGIONAL BREAKDOWN
  ========================= */

  const regionCounts: Record<string, number> = {};

  footballEvents.forEach((event: any) => {
    const region = event.region?.toLowerCase();
    if (!region) return;

    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });

  const ukTotalSportsEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  const footballShare =
    ukTotalSportsEvents.length > 0
      ? Math.round(
          (footballEvents.length / ukTotalSportsEvents.length) * 100
        )
      : 0;


  const displayDate = formatDisplayDate(date);
  const shortDate = formatShortDate(date);

  const cityCounts: Record<string, number> = {};

  footballEvents.forEach((event: any) => {
    if (!event.city) return;
    cityCounts[event.city] = (cityCounts[event.city] || 0) + 1;
  });

  const busiestCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* =========================
    MONTH CONTEXT (UK FOOTBALL)
  ========================= */

  const monthPrefix = date.slice(0, 7);

  const monthEvents = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      e.sport?.toLowerCase() === "football" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventMonth === monthPrefix
    );
  });

  const monthGrouped: Record<string, number> = {};

  monthEvents.forEach((e: any) => {
    const d =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);
    if (!d) return;
    monthGrouped[d] = (monthGrouped[d] || 0) + 1;
  });

  const sortedMonthDays = Object.entries(monthGrouped)
    .sort((a, b) => b[1] - a[1]);

  const rank =
    sortedMonthDays.findIndex(([d]) => d === date) + 1;

  const totalDays = sortedMonthDays.length;

  function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  const uniqueVenues = new Set(
    footballEvents.map((e: any) => e.venue).filter(Boolean)
  ).size;

  const currentIndex = sortedDates.indexOf(date);

  const prevDate =
    currentIndex > 0 ? sortedDates[currentIndex - 1] : null;

  const nextDate =
    currentIndex !== -1 && currentIndex < sortedDates.length - 1
      ? sortedDates[currentIndex + 1]
      : null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      {/* ================= HEADER ================= */}

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Football Fixtures in the UK – {displayDate}
        </h1>

        <p className="text-muted-foreground">
          There are {footballEvents.length} professional football matches
          taking place across the United Kingdom on {displayDate}.
        </p>
      </header>

      {rank > 0 && (
        <p className="text-sm text-muted-foreground">
          This is the <strong>{getOrdinal(rank)}</strong> busiest
          UK football matchday of {totalDays} this month.
        </p>
      )}

      {/* ================= EXPORT ================= */}

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">

        <h2 className="text-sm font-semibold uppercase tracking-wide">
          Export Schedule
        </h2>

        <div className="flex gap-4 flex-wrap">

          <a
            href={`/api/export/uk-football?date=${date}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition shadow-md"
          >
            ⬇ Download Full Match List (CSV)
          </a>

          <a
            href={`/api/export/uk-football?date=${date}&format=ics`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium hover:bg-muted transition"
          >
            📅 Add All Matches to Calendar (.ics)
          </a>
        </div>

        <div className="mt-4">
          <OpsCta />
        </div>
      </section>

      {/* ================= FOOTBALL SHARE ANALYSIS ================= */}

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">

        <h2 className="text-xl font-semibold mb-6">
          Daily Match Summary
        </h2>

        {/* 핵심 숫자 요약 */}
        <div className="grid grid-cols-3 gap-6 text-center mb-6">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              UK total sports
            </p>
            <p className="text-2xl font-semibold">
              {ukTotalSportsEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              UK football fixtures
            </p>
            <p className="text-2xl font-semibold">
              {footballEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Football share
            </p>
            <p className="text-2xl font-semibold">
              {footballShare}%
            </p>
          </div>

        </div>

        {/* Share 설명 */}
        <p className="text-sm text-muted-foreground mb-6">
          On {displayDate}, football accounts for{" "}
          <strong>{footballShare}%</strong> of all professional
          sports fixtures taking place across the United Kingdom.
          Fixtures are being played across{" "}
          <strong>{uniqueVenues}</strong> stadiums nationwide.
        </p>

        {/* Regional Breakdown */}
        {Object.keys(regionCounts).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Regional Breakdown
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {Object.entries(regionCounts).map(([region, count]) => (
                <div key={region}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {region}
                  </p>
                  <p className="text-2xl font-semibold">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Busiest Cities */}
        {busiestCities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Busiest Cities
            </h3>

            <ul className="space-y-2 text-sm">
              {busiestCities.map(([city, count], i) => (
                <li key={city} className="flex justify-between border-b py-2">
                  <span>{i + 1}. {city}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href={`/uk/sports/${date}`}
          className="underline text-sm block text-center"
        >
          View all UK sports fixtures →
        </Link>

      </section>
      {/* ================= LIST ================= */}

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Full list of UK football matches – {shortDate}
        </h2>

        <EventList
          events={footballEvents}
          fixedStartDate={date}
        />
      </section>


      {/* ================= STRUCTURED DATA ================= */}

      {footballEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              footballEvents.map((event: any) => ({
                "@context": "https://schema.org",
                "@type": "SportsEvent",
                name:
                  event.homeTeam && event.awayTeam
                    ? `${event.homeTeam} vs ${event.awayTeam}`
                    : event.title ?? "Sports Event",
                startDate: event.startDate ?? event.date ?? event.utcDate,
                location: {
                  "@type": "Place",
                  name: event.venue ?? "Sports Venue",
                },
                sport: event.sport ?? "Sports",
              }))
            ),
          }}
        />
      )}

      {footballEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Dataset",
              name: `UK Football Fixtures Dataset – ${shortDate}`,
              description: `Structured dataset of professional football matches across the UK on ${shortDate}.`,
              url: `https://venuescope.io/uk/football/${date}`,
              distribution: [
                {
                  "@type": "DataDownload",
                  encodingFormat: "text/csv",
                  contentUrl: `https://venuescope.io/api/export/uk-football?date=${date}`
                },
                {
                  "@type": "DataDownload",
                  encodingFormat: "text/calendar",
                  contentUrl: `https://venuescope.io/api/export/uk-football?date=${date}&format=ics`
                }
              ]
            })
          }}
        />
      )}

      {/* ================= DATE NAV ================= */}

      <section className="pt-8 border-t flex justify-between text-sm">

        {prevDate ? (
          <Link
            href={`/uk/football/${prevDate}`}
            className="underline"
          >
            ← Previous matchday
          </Link>
        ) : <span />}

        {nextDate ? (
          <Link
            href={`/uk/football/${nextDate}`}
            className="underline"
          >
            Next matchday →
          </Link>
        ) : <span />}

      </section>
      {/* ================= INTERNAL LINKS ================= */}

      <section className="pt-8">
        <Link
          href={`/uk/sports/${date}`}
          className="underline underline-offset-4"
        >
          All UK sports fixtures on {displayDate} →
        </Link>
      </section>

      <section className="mt-6 space-y-2 text-sm">
        <Link
          href={`/uk/london/football/${date}`}
          className="underline block"
        >
          London football fixtures on {displayDate}
        </Link>

        <Link
          href={`/uk/manchester/football/${date}`}
          className="underline block"
        >
          Manchester football fixtures on {displayDate}
        </Link>

        <Link
          href={`/uk/live-sports-today`}
          className="underline block"
        >
          View today’s UK football fixtures
        </Link>
      </section>

    </main>
  );
}
