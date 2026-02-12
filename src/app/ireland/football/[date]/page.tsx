// src/app/ireland/football/[date]/page.tsx

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
    title: `Football Fixtures in Ireland — ${displayDate} | VenueScope`,
    description:
      `Professional football matches taking place across Ireland on ${displayDate}.`,
    alternates: {
      canonical: `https://venuescope.io/ireland/football/${date}`,
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
    const eventKey = (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.sport?.toLowerCase() === "football" &&
      e.region?.toLowerCase() === "ireland" &&
      eventKey === date
    );
  });

  const displayDate = formatDisplayDate(date);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Football Fixtures in Ireland — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          There are {footballEvents.length} football matches
          taking place across Ireland on {displayDate}.
        </p>
      </header>

      <section>
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
        basePath="/ireland/football"
      />

      {/* 상위 허브 연결 */}
      <section className="pt-8">
        <Link
          href={`/ireland/sports/${date}`}
          className="underline underline-offset-4 block"
        >
          All sports in Ireland on {displayDate}
        </Link>

        <Link
          href={`/ireland/live-sports-today`}
          className="underline underline-offset-4 block mt-2"
        >
          View today’s Ireland fixtures →
        </Link>
      </section>

      {/* 세부 도시 연결 */}
      <section className="mt-6 space-y-2 text-sm">
        <Link
          href={`/ireland/dublin/sports/${date}`}
          className="underline block"
        >
          Dublin fixtures on {displayDate}
        </Link>
      </section>

    </main>
  );
}
