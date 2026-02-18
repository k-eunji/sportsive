// src/app/uk/premier-league/fixture-congestion/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";
import { DateNav } from "@/app/components/DateNav";
import { EventList } from "@/app/components/EventList";
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
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const displayDate = formatDisplayDate(date);

  const events = await getAllEventsRaw("180d");

  const leagueEvents = events.filter((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return false;

    const competition = (e.competition ?? "").toLowerCase();

    return (
      competition.includes("premier") &&
      competition.includes("league") &&
      raw.slice(0, 10) === date
    );
  });

  return {
    title: `Premier League Schedule Load – ${displayDate} (${leagueEvents.length} Fixtures)`,
    description: `${leagueEvents.length} Premier League fixtures on ${displayDate}. Includes UK match share, scheduling load and kickoff distribution analysis.`,
    alternates: {
      canonical: `https://venuescope.io/uk/premier-league/fixture-congestion/${date}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");

  const leagueEvents = events
    .filter((e: any) => {
      const raw = e.startDate ?? e.date ?? e.utcDate;
      if (!raw) return false;

      const competition = (e.competition ?? "").toLowerCase();

      return (
        competition.includes("premier") &&
        competition.includes("league") &&
        raw.slice(0, 10) === date
      );
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.startDate ?? a.date ?? a.utcDate).getTime() -
        new Date(b.startDate ?? b.date ?? b.utcDate).getTime()
    );

  const ukFootballEvents = events.filter((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return false;

    return (
      e.sport?.toLowerCase() === "football" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      raw.slice(0, 10) === date
    );
  });

  const premierShare =
    ukFootballEvents.length > 0
      ? Math.round(
          (leagueEvents.length / ukFootballEvents.length) * 100
        )
      : 0;

  const displayDate = formatDisplayDate(date);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `How many Premier League matches are scheduled on ${displayDate}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `There are ${leagueEvents.length} confirmed Premier League fixtures on ${displayDate}.`
                }
              },
              {
                "@type": "Question",
                "name": `What time do Premier League matches kick off?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Kickoff times vary depending on the matchday schedule and broadcasting arrangements.`
                }
              }
            ]
          })
        }}
      />

      {/* HEADER */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold">
          Premier League Schedule Density – {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {leagueEvents.length} Premier League match
          {leagueEvents.length !== 1 ? "es" : ""}
          {leagueEvents.length === 1 ? " is" : " are"} scheduled on {displayDate}.
        </p>

        <Link
          href={`/uk/fixture-congestion/${date}`}
          className="underline text-sm"
        >
          View national congestion analysis →
        </Link>
      </header>

      {/* FIXTURE LIST */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Premier League kickoff times — {displayDate}
        </h2>

        <p className="text-sm text-muted-foreground">
          Below is the complete list of Premier League fixtures scheduled on {displayDate}, including confirmed kickoff times and venue details.
        </p>

        <EventList
          events={leagueEvents}
          fixedStartDate={date}
        />
      </section>

      {/* FAQ TEXT */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          FAQs – Premier League on {displayDate}
        </h2>

        <div className="space-y-3 text-sm">
          <p>
            <strong>How many matches are scheduled?</strong><br />
            There are {leagueEvents.length} confirmed fixtures.
          </p>

          <p>
            <strong>What time do matches kick off?</strong><br />
            Kickoff times vary depending on matchday scheduling.
          </p>

          <p>
            <strong>Which stadiums are hosting matches?</strong><br />
            Each fixture includes venue information where available.
          </p>

          <p>
            <strong>Are there overlapping kickoff times?</strong><br />
            Some matches may begin simultaneously.
          </p>
        </div>
      </section>

      {/* NATIONAL SHARE */}
      <section className="border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          Premier League share of UK football
        </h2>

        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-xs uppercase text-muted-foreground">
              UK football fixtures
            </p>
            <p className="text-2xl font-semibold">
              {ukFootballEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-muted-foreground">
              Premier League fixtures
            </p>
            <p className="text-2xl font-semibold">
              {leagueEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-muted-foreground">
              Premier League share
            </p>
            <p className="text-2xl font-semibold">
              {premierShare}%
            </p>
          </div>
        </div>
      </section>

      {/* SportsEvent Structured Data */}
      {leagueEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              leagueEvents.map((event: any) => ({
                "@context": "https://schema.org",
                "@type": "SportsEvent",
                name: `${event.homeTeam} vs ${event.awayTeam}`,
                startDate: event.startDate ?? event.date ?? event.utcDate,
                eventStatus: "https://schema.org/EventScheduled",
                eventAttendanceMode:
                  "https://schema.org/OfflineEventAttendanceMode",
                location: {
                  "@type": "Place",
                  name: event.venue ?? "Football Stadium",
                },
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

      <DateNav
        date={date}
        basePath="/uk/premier-league/fixture-congestion"
      />

      {/* BOTTOM LINKS */}
      <section className="mt-6 space-y-2 text-sm">
        <Link href={`/uk/football/${date}`} className="underline block">
          All UK football fixtures on {displayDate}
        </Link>

        <Link href={`/uk/london/football/${date}`} className="underline block">
          London football fixtures on {displayDate}
        </Link>

        <Link href={`/uk/live-sports-today`} className="underline block">
          View today’s UK fixtures
        </Link>
      </section>

    </main>
  );
}
