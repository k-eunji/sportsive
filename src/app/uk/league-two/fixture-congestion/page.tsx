// src/app/uk/league-two/fixture-congestion/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title:
    "League Two Fixture Congestion & Matchday Overview",
  description:
    "League Two fixture congestion overview including kickoff overlap analysis, scheduling density and date-based archive access.",
  alternates: {
    canonical:
      "https://venuescope.io/uk/league-two/fixture-congestion",
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
        (competition.includes("league two") ||
          competition.includes("efl league 2")) &&
        eventKey === todayKey
      );
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.startDate ?? a.date ?? a.utcDate).getTime() -
        new Date(b.startDate ?? b.date ?? b.utcDate).getTime()
    );

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

  /* ======================
    All League Two Dates
  ====================== */

  const leagueTwoDates = Array.from(
    new Set(
      events
        .filter((e: any) => {
          const raw = e.startDate ?? e.date ?? e.utcDate;
          if (!raw) return false;

          const competition = (e.competition ?? "").toLowerCase();

          return (
            competition.includes("league two") ||
            competition.includes("efl league 2")
          );
        })
        .map((e: any) =>
          (e.startDate ?? e.date ?? e.utcDate).slice(0, 10)
        )
    )
  )
    .filter((date) => date >= todayKey) // 미래만 보고 싶으면 유지
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 10); // 최대 10개


  return (
    <main className="max-w-3xl mx-auto px-6 py-14 space-y-10">

      {/* HEADER */}
      <header className="space-y-4 border-b border-border/30">
        <h1 className="text-4xl font-bold leading-tight">
          League Two Fixture Overview — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {leagueEvents.length} League Two fixture
          {leagueEvents.length !== 1 ? "s" : ""} scheduled today.
        </p>
      </header>

      {/* KPI */}
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

      </section>

      {/* SEO TEXT */}
      <section className="space-y-4 text-sm text-muted-foreground">
        <p>
          This page provides an overview of League Two fixture congestion,
          highlighting kickoff overlap and matchday scheduling density
          across English football.
        </p>

        <p>
          Explore upcoming and recent matchdays using the date links below.
        </p>
      </section>

      {/* TODAY LIST */}
      {leagueEvents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Today’s League Two fixtures
          </h2>

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

      {/* DATE HUB */}
      <section className="space-y-4 border rounded-xl p-6">
        <h2 className="text-lg font-semibold">
          Browse League Two fixtures by date
        </h2>

        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {leagueTwoDates.map((date) => (
            <Link
              key={date}
              href={`/uk/league-two/fixture-congestion/${date}`}
              className="underline"
            >
              League Two fixtures – {formatDisplayDate(new Date(date))}

            </Link>
          ))}
        </div>

      </section>

      {/* INTERNAL CLUSTER */}
      <section className="space-y-2 text-sm">
        <Link href="/uk/premier-league/fixture-congestion" className="underline block">
          Premier League congestion overview →
        </Link>

        <Link href="/uk/league-one/fixture-congestion" className="underline block">
          League One congestion overview →
        </Link>
      </section>

      {/* CTA */}
      <section>
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
