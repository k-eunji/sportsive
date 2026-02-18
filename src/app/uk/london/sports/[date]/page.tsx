// src/app/uk/london/sports/[date]/page.tsx

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
    title: `Sports Fixtures in London – ${shortDate} | Full Match List`,
    description: `Full list of professional sports fixtures in London on ${shortDate}. View venues, start times and download the complete schedule in CSV or calendar format.`,
    alternates: {
      canonical: `https://venuescope.io/uk/london/sports/${date}`,
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

  const dateEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.city?.toLowerCase() === "london" &&
      eventKey === date
    );
  });

  const ukEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  const londonShare =
    ukEvents.length > 0
      ? Math.round((dateEvents.length / ukEvents.length) * 100)
      : 0;

  const displayDate = formatDisplayDate(date);
  const shortDate = formatShortDate(date);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      {/* ================= HEADER ================= */}

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Sports Fixtures in London – {displayDate}
        </h1>

        <p className="text-muted-foreground">
          There are {dateEvents.length} professional sporting events
          taking place in London on {displayDate}.
        </p>
      </header>

      {/* ================= EXPORT ================= */}

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">

        <h2 className="text-sm font-semibold uppercase tracking-wide">
          Export Schedule
        </h2>

        <div className="flex gap-4 flex-wrap">

          <a
            href={`/api/export/london-sports?date=${date}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition shadow-md"
          >
            ⬇ Download Full Match List (CSV)
          </a>

          <a
            href={`/api/export/london-sports?date=${date}&format=ics`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium hover:bg-muted transition"
          >
            📅 Add All Events to Calendar (.ics)
          </a>

        </div>

      </section>
      {/* ================= SHARE ANALYSIS ================= */}

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">

        <h2 className="text-xl font-semibold mb-4 space-y-4">
          Daily Match Summary
        </h2>

        <div className="grid grid-cols-3 gap-6 text-center space-y-4">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              UK total fixtures
            </p>
            <p className="text-2xl font-semibold">
              {ukEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              London fixtures
            </p>
            <p className="text-2xl font-semibold">
              {dateEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              London share
            </p>
            <p className="text-2xl font-semibold">
              {londonShare}%
            </p>
          </div>

        </div>
   
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
          Full list of London sports fixtures – {shortDate}
        </h2>

        {/* 🔥 MARKERS 유지 (절대 삭제 안 함) */}
        <div className="mt-5 mb-3 text-xs text-muted-foreground space-y-1">
          <div className="font-medium text-foreground/70">
            Sport markers
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>F</strong> Football</span>
            <span><strong>R</strong> Rugby</span>
            <span><strong>B</strong> Basketball</span>
            <span><strong>C</strong> Cricket</span>
            <span><strong>H</strong> Horse racing</span>
            <span><strong>T</strong> Tennis</span>
            <span><strong>D</strong> Darts</span>
          </div>
        </div>

        <EventList
          events={dateEvents}
          fixedStartDate={date}
        />
      </section>


      {/* ================= STRUCTURED DATA ================= */}

      {dateEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              dateEvents.map((event: any) => ({
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

      {dateEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Dataset",
              name: `London Sports Fixtures Dataset – ${shortDate}`,
              description: `Structured dataset of professional sports fixtures in London on ${shortDate}.`,
              url: `https://venuescope.io/uk/london/sports/${date}`,
              distribution: [
                {
                  "@type": "DataDownload",
                  encodingFormat: "text/csv",
                  contentUrl: `https://venuescope.io/api/export/london-sports?date=${date}`
                },
                {
                  "@type": "DataDownload",
                  encodingFormat: "text/calendar",
                  contentUrl: `https://venuescope.io/api/export/london-sports?date=${date}&format=ics`
                }
              ]
            })
          }}
        />
      )}

      <DateNav
        date={date}
        basePath="/uk/london/sports"
      />

      <section className="pt-8">
        <Link
          href={`/uk/sports/${date}`}
          className="underline underline-offset-4"
        >
          All UK fixtures on {displayDate} →
        </Link>
      </section>

    </main>
  );
}
