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

  return {
    title: `Premier League Matches on ${displayDate} – Full Fixture List`,
    description: `Premier League matches scheduled on ${displayDate}. Kickoff times, stadium details and national fixture share across UK football.`,
    alternates: {
      canonical: `https://venuescope.io/uk/premier-league/fixture-congestion/${date}`,
    },
    openGraph: {
      title: `Premier League Matches on ${displayDate}`,
      description: `Kickoff times and full Premier League fixture list on ${displayDate}, including UK fixture share comparison.`,
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

  /* ================= Premier League Events ================= */

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

  /* ================= UK Football Total ================= */

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
    <main className="max-w-3xl mx-auto px-6 py-14 space-y-12">

      {/* ================= HEADER ================= */}

      <header className="space-y-4">
        <h1 className="text-4xl font-bold">
          Premier League Matches on {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {leagueEvents.length} Premier League match
          {leagueEvents.length !== 1 ? "es" : ""} 
          {leagueEvents.length === 1 ? " is" : " are"} scheduled on {displayDate}.
        </p>

        <p className="text-sm text-muted-foreground">
          View all confirmed Premier League matches scheduled on {displayDate}, including kickoff times and comparison with total UK fixtures.
        </p>

      </header>

      {/* ================= FIXTURE LIST ================= */}

      <section>
        <EventList
          events={leagueEvents}
          fixedStartDate={date}
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">
          FAQs – Premier League on {displayDate}
        </h2>

        <div className="space-y-3 text-sm">
          <p>
            <strong>How many Premier League matches are scheduled?</strong><br />
            There are {leagueEvents.length} matches confirmed.
          </p>

          <p>
            <strong>What time do Premier League matches kick off?</strong><br />
            Kickoff times vary and are listed above.
          </p>
        </div>
      </section>

      {/* ================= NATIONAL SHARE INSIGHT ================= */}

      <section className="border rounded-xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">
          National competition share
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
              Premier League fixtures
            </p>
            <p className="text-2xl font-semibold">
              {leagueEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Premier League share
            </p>
            <p className="text-2xl font-semibold">
              {premierShare}%
            </p>
          </div>

        </div>

        <p className="text-sm text-muted-foreground">
          On {displayDate}, Premier League fixtures account for{" "}
          <strong>{premierShare}%</strong> of all professional football
          matches scheduled across the United Kingdom.
        </p>

      </section>

      {/* ================= INTERNAL LINKS ================= */}

      <section className="border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          Explore more fixtures on {displayDate}
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Link href={`/uk/football/${date}`} className="underline">
            All UK football fixtures →
          </Link>

          <Link href={`/uk/london/football/${date}`} className="underline">
            London football fixtures →
          </Link>

          <Link href={`/uk/sports/${date}`} className="underline">
            All UK sports fixtures →
          </Link>

          <Link href={`/uk/fixture-congestion/${date}`} className="underline">
            National congestion report →
          </Link>
        </div>
      </section>

      <DateNav
        date={date}
        basePath="/uk/premier-league/fixture-congestion"
      />

    </main>
  );
}
