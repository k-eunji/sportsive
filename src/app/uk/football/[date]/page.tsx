// src/app/uk/football/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";
import { DateNav } from "@/app/components/DateNav";
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

      </section>

      {/* ================= FOOTBALL SHARE ANALYSIS ================= */}

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">

        <h2 className="text-xl font-semibold mb-4 space-y-4">
          Daily Match Summary
        </h2>

        <div className="grid grid-cols-3 gap-6 text-center space-y-4">

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

        <p className="text-sm text-muted-foreground mb-4 space-y-4">
          On {displayDate}, football accounts for{" "}
          <strong>{footballShare}%</strong> of all professional
          sports fixtures taking place across the United Kingdom.
        </p>
   
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

      <DateNav
        date={date}
        basePath="/uk/football"
      />

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
