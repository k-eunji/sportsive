// src/app/uk/league-two/fixture-congestion/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

function formatTime(raw: string) {
  return new Date(raw).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
    title: `League Two Fixtures on ${displayDate} – Kickoff Times & Overlap Analysis`,
    description: `Full EFL League Two fixture list on ${displayDate}, including kickoff times and match congestion analysis.`,
    alternates: {
      canonical: `https://venuescope.io/uk/league-two/fixture-congestion/${date}`,
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
        (competition.includes("league two") ||
          competition.includes("efl league 2")) &&
        raw.slice(0, 10) === date
      );
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.startDate ?? a.date ?? a.utcDate).getTime() -
        new Date(b.startDate ?? b.date ?? b.utcDate).getTime()
    );

  if (leagueEvents.length === 0) {
    notFound();
  }  

  const availableDates = new Set<string>();

  events.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    const competition = (e.competition ?? "").toLowerCase();

    if (
      competition.includes("league two") ||
      competition.includes("efl league 2")
    ) {
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

  const displayDate = formatDisplayDate(date);

  const hourMap = new Map<number, number>();

  leagueEvents.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    const hour = Number(
      new Date(raw).toLocaleString("en-GB", {
        hour: "2-digit",
        hour12: false,
        timeZone: "Europe/London",
      })
    );

    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
  });

  const sortedHours = [...hourMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const peak = sortedHours[0];
  const peakRatio =
    peak && leagueEvents.length > 0
      ? Math.round((peak[1] / leagueEvents.length) * 100)
      : 0;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">

      {/* HEADER */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold">
          League Two Fixtures on {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {leagueEvents.length} League Two fixture
          {leagueEvents.length !== 1 ? "s" : ""} scheduled on {displayDate}.
        </p>

        <Link
          href={`/uk/football/${date}`}
          className="underline text-sm"
        >
          View all UK football fixtures →
        </Link>
      </header>

      {/* FIXTURE LIST */}
      {leagueEvents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            League Two kickoff times — {displayDate}
          </h2>

          <p className="text-sm text-muted-foreground">
            Below is the complete League Two fixture list including confirmed kickoff times.
          </p>

          <ul className="space-y-3 text-muted-foreground">
            {leagueEvents.map((e: any) => {
              const raw = e.startDate ?? e.date ?? e.utcDate;

              return (
                <li key={e.id} className="flex justify-between border-b pb-2">
                  <span>
                    {e.homeTeam ?? "Home"} vs {e.awayTeam ?? "Away"}
                  </span>

                  {raw && (
                    <span className="text-sm">
                      {formatTime(raw)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* OVERLAP ANALYSIS */}
      {leagueEvents.length > 1 && peak && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Kickoff overlap analysis
          </h2>

          <p className="text-muted-foreground">
            The busiest kickoff window occurs at {peak[0]}:00,
            representing {peakRatio}% of fixtures.
          </p>
        </section>
      )}

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          FAQs – League Two on {displayDate}
        </h2>

        <div className="space-y-3 text-sm">
          <p>
            <strong>How many fixtures are scheduled?</strong><br />
            There are {leagueEvents.length} confirmed League Two matches.
          </p>

          <p>
            <strong>Do matches kick off at the same time?</strong><br />
            Some fixtures may begin simultaneously depending on matchday scheduling.
          </p>

          <p>
            <strong>Where are the matches played?</strong><br />
            Fixtures take place across multiple stadiums in England.
          </p>
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

      <section className="flex justify-between border-t pt-6 text-sm">

        {previousDate ? (
          <Link
            href={`/uk/league-two/fixture-congestion/${previousDate}`}
            className="underline"
          >
            ← Previous matchday
          </Link>
        ) : <span />}

        {nextDate ? (
          <Link
            href={`/uk/league-two/fixture-congestion/${nextDate}`}
            className="underline"
          >
            Next matchday →
          </Link>
        ) : <span />}

      </section>
      
      {/* BOTTOM LINKS */}
      <section className="mt-6 space-y-2 text-sm">
        <Link
          href={`/uk/league-two/fixture-congestion`}
          className="underline block"
        >
          Live League Two congestion overview
        </Link>

        <Link
          href={`/uk/premier-league/fixture-congestion/${date}`}
          className="underline block"
        >
          Premier League fixtures on {displayDate}
        </Link>
      </section>

    </main>
  );
}
