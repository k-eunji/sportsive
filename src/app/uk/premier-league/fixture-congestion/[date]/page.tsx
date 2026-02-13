//src/app/uk/premier-league/fixture-congestion/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";
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
    title: `Premier League Fixture Congestion — ${displayDate}`,
    description: `Premier League fixture congestion analysis for ${displayDate}, including kickoff overlap and scheduling density.`,
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
      const rawDate = e.startDate ?? e.date ?? e.utcDate;
      if (!rawDate) return false;

      const eventKey = rawDate.slice(0, 10);
      const competition = (e.competition ?? "").toLowerCase();

      return (
        competition.includes("premier") &&
        competition.includes("league") &&
        eventKey === date
      );
    })
    .sort((a: any, b: any) => {
      const aDate = new Date(a.startDate ?? a.date ?? a.utcDate).getTime();
      const bDate = new Date(b.startDate ?? b.date ?? b.utcDate).getTime();
      return aDate - bDate;
    });

  /* ======================
     Hourly Analysis
  ====================== */

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

  const displayDate = formatDisplayDate(date);

  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);

  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  const previousDate = previous.toISOString().slice(0, 10);
  const nextDate = next.toISOString().slice(0, 10);

  const todayKey = new Date().toISOString().slice(0, 10);
  const isPast = date < todayKey;
  const isToday = date === todayKey;
  const isFuture = date > todayKey;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">

      {/* ================= HEADER ================= */}

      <header className="space-y-6">
        <h1 className="text-4xl font-bold leading-tight">
          Premier League Fixture Congestion — {displayDate}
        </h1>

        {leagueEvents.length === 0 ? (
          <p className="text-muted-foreground">
            {isPast && "No Premier League fixtures were held on this date."}
            {isToday && "No Premier League fixtures are scheduled today."}
            {isFuture && "No Premier League fixtures are scheduled on this date."}
          </p>
        ) : (
          <p className="text-muted-foreground">
            {isPast &&
              `${leagueEvents.length} Premier League fixture${
                leagueEvents.length !== 1 ? "s" : ""
              } were held on this date.`}

            {isToday &&
              `${leagueEvents.length} Premier League fixture${
                leagueEvents.length !== 1 ? "s" : ""
              } are scheduled today.`}

            {isFuture &&
              `${leagueEvents.length} Premier League fixture${
                leagueEvents.length !== 1 ? "s" : ""
              } are scheduled on this date.`}
          </p>
        )}

      </header>

      {/* ================= PEAK ================= */}

      {leagueEvents.length > 1 && peak && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Kickoff overlap analysis
          </h2>

          <p className="text-muted-foreground">
            {isPast
              ? `The highest recorded overlap occurred at ${peak[0]}:00`
              : `The primary overlap window occurs at ${peak[0]}:00`}
            {" "}({peakRatio}% of fixtures)
          </p>

        </section>
      )}

      {/* ================= FULL FIXTURE LIST ================= */}

      {leagueEvents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Full fixture list
          </h2>

          <ul className="space-y-3 text-muted-foreground">
            {leagueEvents.map((e: any) => {
              const raw = e.startDate ?? e.date ?? e.utcDate;

              return (
                <li
                  key={e.id}
                  className="flex justify-between border-b pb-2"
                >
                  <span>
                    {e.homeTeam ?? e.home ?? "Home"} vs{" "}
                    {e.awayTeam ?? e.away ?? "Away"}
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

      {/* ================= NAVIGATION ================= */}

      <section className="flex justify-between border-t pt-6 text-sm">
        <Link
          href={`/uk/premier-league/fixture-congestion/${previousDate}`}
          className="underline"
        >
          ← Previous day
        </Link>

        <Link
          href={`/uk/premier-league/fixture-congestion/${nextDate}`}
          className="underline"
        >
          Next day →
        </Link>
      </section>

      <section>
        <Link
          href="/uk/premier-league/fixture-congestion"
          className="underline underline-offset-4"
        >
          View live Premier League congestion overview →
        </Link>
      </section>

      {/* ================= CTA ================= */}

      <section className="space-y-6">

        <Link
          href="/ops"
          className="inline-block px-5 py-3 rounded-md bg-black text-white text-sm font-medium"
        >
          Open Operations Dashboard →
        </Link>

      </section>
      

    </main>
  );
}
