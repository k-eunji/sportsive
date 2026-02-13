//src/app/uk/premier-league/fixture-congestion/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

export const metadata: Metadata = {
  title:
    "Premier League Fixture Congestion Today | Kickoff Overlap Analysis",
  description:
    "Live Premier League fixture congestion report, highlighting peak kickoff overlap windows and scheduling density across England.",
  alternates: {
    canonical:
      "https://venuescope.io/uk/premier-league/fixture-congestion",
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

export default async function Page() {
  const events = await getAllEventsRaw("180d");

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const displayDate = formatDisplayDate(today);

  const leagueEvents = events.filter((e: any) => {
    const rawDate = e.startDate ?? e.date ?? e.utcDate;
    if (!rawDate) return false;

    const eventKey = rawDate.slice(0, 10);
    const competition = (e.competition ?? "").toLowerCase();

    return (
        competition.includes("premier") &&
        competition.includes("league") &&
        eventKey === todayKey
    );
    });

  const hourMap = new Map<number, number>();

  leagueEvents.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    const d = new Date(raw);
    if (isNaN(d.getTime())) return;

    const hour = Number(
      d.toLocaleString("en-GB", {
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
    peak && peak[1] >= 4
      ? "High"
      : peak && peak[1] >= 2
      ? "Moderate"
      : "Low";

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">

      <header className="space-y-6 border-b border-border/30">
        <h1 className="text-4xl font-bold leading-tight">
          Premier League Fixture Congestion — {displayDate}
        </h1>

        <p className="text-muted-foreground leading-relaxed">
          A total of {leagueEvents.length} Premier League fixtures are scheduled today.
        </p>
      </header>

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
          Overall congestion level: <strong>{congestionLevel}</strong>
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">
          Kickoff overlap analysis
        </h2>

        {peak && (
          <p className="text-muted-foreground leading-relaxed">
            The busiest kickoff window occurs at {peak[0]}:00 with {peak[1]} concurrent fixtures.
          </p>
        )}
      </section>

      <section>
        <Link
          href="/uk/fixture-congestion"
          className="underline underline-offset-4"
        >
          View national UK congestion overview →
        </Link>
      </section>

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
