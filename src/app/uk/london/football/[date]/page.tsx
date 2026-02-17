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


  return {
    title: `London Football Matches on ${displayDate} – Kickoff Times & Stadiums`,
    description: `${footballEvents.length} football matches scheduled in London on ${displayDate}. Kickoff times, stadium details and full fixture list across Premier League and EFL.`,
    alternates: {
      canonical: `https://venuescope.io/uk/london/football/${date}`,
    },
    openGraph: {
      title: `London Football Matches on ${displayDate}`,
      description: `Kickoff times and stadium details for football matches in London on ${displayDate}.`,
      type: "website",
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `How many football matches are in London on ${displayDate}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `There are ${footballEvents.length} professional matches scheduled in London on ${displayDate}.`
                }
              },
              {
                "@type": "Question",
                "name": `Are there overlapping matches in London?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Some fixtures may kick off at similar times depending on the matchday schedule.`
                }
              }
            ]
          })
        }}
      />

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          London Football Matches on {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {footballEvents.length} professional football match
          {footballEvents.length !== 1 ? "es" : ""} 
          {footballEvents.length === 1 ? " is" : " are"} scheduled in London on {displayDate}.
        </p>

        <p className="text-sm text-muted-foreground">
          This includes Premier League and EFL fixtures scheduled across multiple London stadiums, with kickoff times and venue details listed below.
        </p>

      </header>

      <Link href={`/uk/london/fixture-congestion/${date}`} className="underline">
        View congestion analysis for London →
      </Link>


      <section>
        <h2 className="text-xl font-semibold mb-4">
          London football kickoff times — {displayDate}
        </h2>

        <EventList events={footballEvents} fixedStartDate={date} />
      </section>  

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">
          FAQs – London football on {displayDate}
        </h2>

        <div className="space-y-3 text-sm">
          <p>
            <strong>How many football matches are in London on {displayDate}?</strong><br />
            There are {footballEvents.length} professional matches scheduled.
          </p>

          <p>
            <strong>What time do London football matches kick off?</strong><br />
            Kickoff times vary by fixture and are listed above.
          </p>

          <p>
            <strong>Which stadiums are hosting matches?</strong><br />
            Each fixture includes venue information for the hosting stadium.
          </p>

          <p>
            <strong>Are there overlapping matches in London?</strong><br />
            Some fixtures may kick off at similar times depending on the matchday schedule.
          </p>
        </div>
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
