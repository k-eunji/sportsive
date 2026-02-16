// src/app/uk/london/football/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";
import { DateNav } from "@/app/components/DateNav";
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
    title: `Football Fixtures in London on ${displayDate} | Kickoff Times & Tickets`,
    description: `Full list of football matches in London on ${displayDate}. View kickoff times, venues and ticket information for Premier League and EFL fixtures.`,
    alternates: {
      canonical: `https://venuescope.io/uk/london/football/${date}`,
    },
  };

}

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
      e.city?.toLowerCase() === "london" &&
      eventKey === date
    );
  });

  const ukFootballEvents = events.filter((e: any) => {
  const eventKey =
    (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

  return (
    e.sport?.toLowerCase() === "football" &&
    eventKey === date
  );
});

  const londonShare =
    ukFootballEvents.length > 0
      ? Math.round(
          (footballEvents.length / ukFootballEvents.length) * 100
        )
      : 0;

  const displayDate = formatDisplayDate(date);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Football Fixtures in London — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          There are {footballEvents.length} professional football matches
          taking place in London on {displayDate}.
        </p>

        <p className="text-sm text-muted-foreground">
          This page lists all confirmed professional football fixtures scheduled in London on {displayDate}, including Premier League, EFL and domestic cup competitions.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          London football kickoff times — {displayDate}
        </h2>

        <EventList events={footballEvents} fixedStartDate={date} />
      </section>  

      <section className="border rounded-xl p-6 space-y-4 mt-8">
        <h2 className="text-xl font-semibold">
          London vs UK fixture share
        </h2>

        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              UK football fixtures
            </p>
            <p className="text-2xl font-semibold">
              {ukFootballEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              London football fixtures
            </p>
            <p className="text-2xl font-semibold">
              {footballEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              London football share
            </p>
            <p className="text-2xl font-semibold">
              {londonShare}%
            </p>
          </div>
        </div>

        <Link
          href={`/uk/football/${date}`}
          className="underline text-sm block text-center"
        >
          View all UK football fixtures →
        </Link>
      </section>

      {footballEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              footballEvents
                .filter((event: any) => event.startDate || event.date || event.utcDate)
                .map((event: any) => ({
                  "@context": "https://schema.org",
                  "@type": "SportsEvent",
                  name:
                    event.homeTeam && event.awayTeam
                      ? `${event.homeTeam} vs ${event.awayTeam}`
                      : event.title ?? "Sports Event",
                  startDate: event.startDate ?? event.date ?? event.utcDate,
                  eventAttendanceMode:
                    "https://schema.org/OfflineEventAttendanceMode",
                  eventStatus:
                    "https://schema.org/EventScheduled",
                  location: {
                    "@type": "Place",
                    name: event.venue ?? "Sports Venue",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: event.city ?? "",
                      addressCountry: event.region ?? "",
                    },
                  },
                  sport: event.sport ?? "Sports",
                  organizer: {
                    "@type": "Organization",
                    name: "VenueScope",
                    url: "https://venuescope.io",
                  },
                }))
            ),
          }}
        />
      )}

      {/* 날짜 네비게이션 */}
      <DateNav
        date={date}
        basePath="/uk/london/football"
      />


      {/* 상위 London 스포츠 날짜 페이지 */}
      <section className="pt-8">
        <Link
          href={`/uk/london/sports/${date}`}
          className="underline underline-offset-4"
        >
          All London fixtures on {displayDate} →
        </Link>
      </section>

      {/* UK 레벨 연결 */}
      <section className="mt-6 space-y-2 text-sm">
        <Link
          href={`/uk/football/${date}`}
          className="underline block"
        >
          All UK football fixtures on {displayDate}
        </Link>
        <Link
          href={`/uk/london/fixture-congestion/${date}`}
          className="underline block"
        >
          All London sports fixtures on {displayDate}
        </Link>
        <Link
          href={`/uk/live-sports-today`}
          className="underline block"
        >
          View today’s London fixtures
        </Link>
      </section>

    </main>
  );
}
