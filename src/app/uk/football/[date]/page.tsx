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

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const displayDate = formatDisplayDate(date);

  return {
    title: `Football Fixtures in the UK — ${displayDate} | VenueScope`,
    description: `Professional football matches taking place across the United Kingdom on ${displayDate}, organised by venue and start time.`,
    alternates: {
      canonical: `https://venuescope.io/uk/football/${date}`,
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
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  const displayDate = formatDisplayDate(date);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Football Fixtures in the UK — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          There are {footballEvents.length} professional football matches
          taking place across the United Kingdom on {displayDate}.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Football matches on {displayDate}
        </h2>

        <EventList events={footballEvents} fixedStartDate={date}/>

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
        basePath="/uk/football"
      />

      {/* 상위 스포츠 날짜 허브 */}
      <section className="pt-8">
        <Link
          href={`/uk/sports/${date}`}
          className="underline underline-offset-4"
        >
          All UK sports fixtures on {displayDate} →
        </Link>
      </section>

      {/* 지역 클러스터 연결 */}
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
