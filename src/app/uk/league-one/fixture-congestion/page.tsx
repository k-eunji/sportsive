///src/app/uk/league-one/fixture-congestion/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title:
    "League One Fixture Congestion & Matchday Overview",
  description:
    "League One fixture congestion overview including kickoff overlap analysis, matchday density and date-based archive access.",
  alternates: {
    canonical:
      "https://venuescope.io/uk/league-one/fixture-congestion",
  },
};

function formatDisplayDate(date: Date) {
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

export default async function Page() {
  const events = await getAllEventsRaw("180d");

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const displayDate = formatDisplayDate(today);

  const leagueEvents = events
    .filter((e: any) => {
      const rawDate = e.startDate ?? e.date ?? e.utcDate;
      if (!rawDate) return false;

      const eventKey = rawDate.slice(0, 10);
      const competition = (e.competition ?? "").toLowerCase();

      return (
        (competition.includes("league one") ||
          competition.includes("efl league 1")) &&
        eventKey === todayKey
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

  /* ======================
    All League One Dates
  ====================== */

  const leagueOneDates = Array.from(
    new Set(
      events
        .filter((e: any) => {
          const raw = e.startDate ?? e.date ?? e.utcDate;
          if (!raw) return false;

          const competition = (e.competition ?? "").toLowerCase();

          return (
            competition.includes("league one") ||
            competition.includes("efl league 1")
          );
        })
        .map((e: any) =>
          (e.startDate ?? e.date ?? e.utcDate).slice(0, 10)
        )
    )
  )
    .sort((a, b) => b.localeCompare(a)) // 최신순
    .slice(0, 10);

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

  const congestionLevel =
    peak && peak[1] >= 6
      ? "High"
      : peak && peak[1] >= 3
      ? "Moderate"
      : "Low";

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">

      {/* ================= HEADER ================= */}

      <header className="space-y-6 border-b border-border/30">
        <h1 className="text-4xl font-bold leading-tight">
          League One Fixture — {displayDate}
        </h1>

        {leagueEvents.length === 0 ? (
          <p className="text-muted-foreground">
            No League One fixtures are scheduled today.
          </p>
        ) : (
          <p className="text-muted-foreground">
            {leagueEvents.length} League One fixture
            {leagueEvents.length !== 1 ? "s" : ""}{" "}
            are scheduled today.
          </p>
        )}
      </header>

      {/* ================= KPI ================= */}
      <section className="border rounded-xl p-8 space-y-6">

        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total fixtures
            </p>
            <p className="text-3xl font-semibold">
              {leagueEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Peak kickoff hour
            </p>
            <p className="text-3xl font-semibold">
              {peak ? `${peak[0]}:00` : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Peak share
            </p>
            <p className="text-3xl font-semibold">
              {peak ? `${peakRatio}%` : "—"}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Overall congestion level:{" "}
          <strong>{congestionLevel}</strong>
        </p>

      </section>

      <section className="space-y-4 text-sm text-muted-foreground">
        <p>
          This page provides an overview of League One fixture congestion,
          highlighting kickoff overlap and matchday scheduling density
          across England.
        </p>

        <p>
          Use the date links below to explore historical and upcoming
          League One fixtures in detail.
        </p>
      </section>

      {/* ================= FIXTURE LIST ================= */}

      {leagueEvents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Today’s fixture list
          </h2>

          <ul className="space-y-3 text-muted-foreground">
            {leagueEvents.map((e: any) => {
              const raw = e.startDate ?? e.date ?? e.utcDate;

              return (
                <li key={e.id} className="flex justify-between border-b pb-2">
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

      {/* ================= RECENT DATES ================= */}

      <section className="space-y-4 border rounded-xl p-6">
        <h2 className="text-lg font-semibold">
          Browse League One fixtures by date
        </h2>

        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {leagueOneDates.map((date) => (
            <Link
              key={date}
              href={`/uk/league-one/fixture-congestion/${date}`}
              className="underline"
            >
              League One fixtures – {formatDisplayDate(new Date(date))}

            </Link>
          ))}
        </div>

      </section>


      {/* ================= NAVIGATION ================= */}
      <section>
        <Link
          href="/ops"
          className="inline-block px-5 py-3 rounded-md bg-black text-white text-sm font-medium"
        >
          Open Operations Dashboard →
        </Link>
      </section>

      <section className="space-y-2 text-sm">
        <Link href="/uk/premier-league/fixture-congestion" className="underline block">
          Premier League congestion overview →
        </Link>

        <Link href="/uk/league-two/fixture-congestion" className="underline block">
          League Two congestion overview →
        </Link>
      </section>


    </main>
  );
}
