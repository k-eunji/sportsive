// src/app/uk/london/sports/[date]/page.tsx

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

  // ✅ 추가
  if (dateEvents.length === 0) {
    notFound();
  }

  /* =========================
    GROUP BY SPORT
  ========================= */

  const groupedBySport: Record<string, any[]> = {};

  dateEvents.forEach((event: any) => {
    const sport = event.sport ?? "Other Sports";

    if (!groupedBySport[sport]) {
      groupedBySport[sport] = [];
    }

    groupedBySport[sport].push(event);
  });

  /* =========================
    SPORT PRIORITY ORDER
  ========================= */

  const SPORT_PRIORITY = [
    "football",
    "rugby",
    "cricket",
    "tennis",
    "basketball",
    "horse racing",
    "dart",
  ];

  const sortedSports = Object.entries(groupedBySport).sort((a, b) => {
    const indexA = SPORT_PRIORITY.indexOf(a[0]?.toLowerCase());
    const indexB = SPORT_PRIORITY.indexOf(b[0]?.toLowerCase());

    const priorityA = indexA === -1 ? 999 : indexA;
    const priorityB = indexB === -1 ? 999 : indexB;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a[0].localeCompare(b[0]);
  });

  const ukEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  /* =========================
    NEXT LONDON EVENTS
  ========================= */

  const upcomingLondonEvents = events
    .filter((e: any) => {
      const eventDate = e.startDate ?? e.date ?? e.utcDate;
      if (!eventDate) return false;

      return (
        e.city?.toLowerCase() === "london" &&
        new Date(eventDate) > new Date(date)
      );
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.startDate ?? a.date ?? a.utcDate).getTime() -
        new Date(b.startDate ?? b.date ?? b.utcDate).getTime()
    );

  const nextEvents = upcomingLondonEvents.slice(0, 5);

  const londonShare =
    ukEvents.length > 0
      ? Math.round((dateEvents.length / ukEvents.length) * 100)
      : 0;
   
  /* =========================
    MONTH CONTEXT (ALL SPORTS)
  ========================= */

  const monthPrefix = date.slice(0, 7);

  const monthEvents = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      e.city?.toLowerCase() === "london" &&
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

  const displayDate = formatDisplayDate(date);
  const shortDate = formatShortDate(date);

  const availableDates = new Set<string>();

  events.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    if (e.city?.toLowerCase() === "london") {
      availableDates.add(raw.slice(0, 10));
    }
  });

  const sortedDates = Array.from(availableDates).sort();

  const currentIndex = sortedDates.indexOf(date);

  const previousDate =
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
        <div className="mt-4">
          <OpsCta />
        </div>
      </section>
      {/* ================= SHARE ANALYSIS ================= */}

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">

        <h2 className="text-xl font-semibold mb-4 space-y-4">
          Daily Match Summary
        </h2>

        {rank > 0 && totalDays > 1 && (
          <p className="text-sm text-muted-foreground mb-4">
            With <strong>{dateEvents.length}</strong> fixtures scheduled,
            this is the <strong>{getOrdinal(rank)}</strong> busiest
            London sports matchday of {totalDays} this month.
          </p>
        )}
        
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

        <div className="space-y-10">
          {sortedSports.map(([sport, events]) => (
            <div key={sport} className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                {sport} ({events.length})
              </h3>

              <EventList
                events={events}
                fixedStartDate={date}
              />
            </div>
          ))}
        </div>
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

      <section className="flex justify-between border-t pt-6 text-sm">

        {previousDate ? (
          <Link
            href={`/uk/london/sports/${previousDate}`}
            className="underline"
          >
            ← Previous matchday
          </Link>
        ) : <span />}

        {nextDate ? (
          <Link
            href={`/uk/london/sports/${nextDate}`}
            className="underline"
          >
            Next matchday →
          </Link>
        ) : <span />}

      </section>
      
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
