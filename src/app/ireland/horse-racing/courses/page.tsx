//src/app/ireland/horse-racing/courses/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";

const IRELAND_REGIONS = [
  "ireland",
  "republic of ireland",
];

function slugifyVenue(name: string) {
  return name
    .toLowerCase()
    .replace(" racecourse", "")
    .replace(" race course", "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export const metadata: Metadata = {
  title:
    "Ireland Horse Racing Courses 2026 – Ranking, Congestion & Meeting Volume",
  description:
    "Compare Ireland racecourses in 2026 by meeting volume, congestion index, weekend concentration and structural density.",
};

export default async function Page() {
  const events = await getHorseRacingEventsRaw();

  /* ===== Filter 2026 Ireland ===== */

  const racing2026 = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);
    return (
      IRELAND_REGIONS.includes(e.region?.toLowerCase()) &&
      year === "2026" &&
      e.venue
    );
  });

  const totalMeetings = racing2026.length;

  /* ===== Group by venue ===== */

  const venueData: Record<
    string,
    {
      total: number;
      saturday: number;
      dates: Set<string>;
    }
  > = {};

  racing2026.forEach((e: any) => {
    const venue = e.venue;
    const date = (e.startDate ?? "").slice(0, 10);

    if (!venueData[venue]) {
      venueData[venue] = {
        total: 0,
        saturday: 0,
        dates: new Set<string>(),
      };
    }

    venueData[venue].total += 1;

    if (new Date(e.startDate).getDay() === 6) {
      venueData[venue].saturday += 1;
    }

    venueData[venue].dates.add(date);
  });

  /* ===== Derived Metrics ===== */

  const courses = Object.entries(venueData).map(([venue, data]) => {
    const activeDays = data.dates.size;

    const avgPerDay =
      activeDays > 0
        ? Math.round(data.total / activeDays)
        : 0;

    const saturdayShare =
      data.total > 0
        ? Math.round((data.saturday / data.total) * 100)
        : 0;

    const congestionScore = Math.min(
      100,
      Math.round(avgPerDay * 10 + saturdayShare)
    );

    const share =
      totalMeetings > 0
        ? Number(((data.total / totalMeetings) * 100).toFixed(1))
        : 0;

    return {
      venue,
      total: data.total,
      activeDays,
      avgPerDay,
      saturdayShare,
      congestionScore,
      share,
    };
  });

  const byVolume = [...courses].sort((a, b) => b.total - a.total);

  const sortedTotals = courses
    .map(c => c.total)
    .sort((a,b)=>a-b);

  const median =
    sortedTotals.length === 0
      ? 0
      : sortedTotals.length % 2 === 0
      ? Math.round(
          (sortedTotals[sortedTotals.length / 2 - 1] +
            sortedTotals[sortedTotals.length / 2]) / 2
        )
      : sortedTotals[Math.floor(sortedTotals.length / 2)];
      
  const totalCourses = courses.length;

  const largest = byVolume.length > 0 ? byVolume[0] : null;

  const top10Share =
    totalMeetings > 0
      ? Math.round(
          (byVolume
            .slice(0,10)
            .reduce((sum,c)=>sum+c.total,0)
            / totalMeetings) * 100
        )
      : 0;

  return (
    <main className="max-w-5xl mx-auto px-6 py-14 space-y-16">

      {/* ===== HEADER ===== */}

      <header className="space-y-4 border-b pb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Course Ranking Report
        </p>

        <h1 className="text-4xl font-semibold tracking-tight">
          Ireland Horse Racing Courses – 2026 Structural Analysis
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Comparative analysis of Ireland racecourses based on fixture
          volume, operational spread, weekend concentration and
          congestion intensity.
        </p>
      </header>
      
      {/* ===== KPI CARDS ===== */}

      <section className="grid md:grid-cols-3 gap-6 pt-8 border-t">

        <div className="border rounded-2xl p-6">
          <p className="text-xs uppercase text-muted-foreground">
            Total Meetings
          </p>
          <p className="text-3xl font-semibold mt-2">
            {totalMeetings}
          </p>
        </div>

        <div className="border rounded-2xl p-6">
          <p className="text-xs uppercase text-muted-foreground">
            Active Courses
          </p>
          <p className="text-3xl font-semibold mt-2">
            {totalCourses}
          </p>
        </div>

        <div className="border rounded-2xl p-6">
          <p className="text-xs uppercase text-muted-foreground">
            Largest Share
          </p>
          <p className="text-3xl font-semibold mt-2">
            {largest ? `${largest.share}%` : "-"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {largest
              ? largest.venue.replace(" Racecourse", "")
              : ""}
          </p>
        </div>

        <div className="border rounded-2xl p-6">
          <p className="text-xs uppercase text-muted-foreground">
            Median Meetings / Course
          </p>
          <p className="text-3xl font-semibold mt-2">
            {median}
          </p>
        </div>

      </section>

      <section className="pt-8 border-t text-sm text-muted-foreground space-y-3">
        <h2 className="font-semibold text-black">
          Fixture Centralisation
        </h2>

        <p>
          The top 10 racecourses account for <strong>{top10Share}%</strong>
          of all Ireland race meetings in 2026, indicating
          {top10Share > 50
            ? " a highly centralised national fixture model."
            : " a relatively distributed scheduling structure."}
        </p>
      </section>

      <section className="pt-8 border-t text-sm text-muted-foreground space-y-3">
        <h2 className="font-semibold text-black">
          National Benchmark Context
        </h2>

        <p>
          The median Ireland racecourse hosts <strong>{median}</strong> meetings annually.
          Courses significantly above this level operate at elevated structural density.
        </p>
      </section>

      {/* ===== EXPLANATION ===== */}

      <section className="text-sm text-muted-foreground space-y-3 border-t pt-8">
        <h2 className="font-semibold text-black">
          How Is Structural Density Measured?
        </h2>
        <p>
          The congestion index combines average meetings per active racing
          day with Saturday concentration to reflect structural intensity.
          Higher values indicate tighter scheduling patterns.
        </p>
      </section>

      {/* ===== SUMMARY ===== */}

      <section className="text-sm text-muted-foreground">
        <p>
          The 2026 season includes <strong>{totalMeetings}</strong> race
          meetings across <strong>{totalCourses}</strong> Ireland racecourses.
        </p>

        <p className="text-sm mt-3">
          View the full seasonal breakdown in the{" "}
          <Link
            href="/ireland/horse-racing/calendar-2026"
            className="underline hover:opacity-70"
          >
            2026 Ireland Racing Calendar
          </Link>.
        </p>
      </section>

      {/* ===== MINIMAL DATA LIST ===== */}

      <section className="pt-20 border-t">
        <h2 className="text-2xl font-semibold mb-12">
          Complete Course Comparison
        </h2>

        <div className="hidden md:grid md:grid-cols-12 gap-4 pb-3 text-[11px] uppercase tracking-wide text-muted-foreground">
          <div className="md:col-span-1">Rank</div>
          <div className="md:col-span-5">Course</div>
          <div className="md:col-span-2 text-left">Avg / Day</div>
          <div className="md:col-span-2 text-left">Saturday %</div>
          <div className="md:col-span-2 text-left">Congestion Index</div>
        </div>

        <div className="divide-y divide-gray-100">

          {byVolume.map((c, i) => (
            <Link
              key={c.venue}
              href={`/ireland/horse-racing/courses/${slugifyVenue(c.venue)}`}
              className="group block py-6 transition-colors hover:bg-gray-50/60"
            >
              <div className="grid md:grid-cols-12 items-center gap-4">

                <div className="md:col-span-1 text-sm text-muted-foreground">
                  {i + 1}
                </div>

                <div className="md:col-span-5">
                  <div className="flex items-center gap-2 font-medium break-words">
                    {c.venue.replace(" Racecourse", "")}
                    <span className="opacity-0 group-hover:opacity-100 transition text-xs">
                      →
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {c.total} meetings · {c.share}%
                  </div>
                </div>

                <div className="md:col-span-2 text-sm tabular-nums">
                  {c.avgPerDay}
                </div>

                <div className="md:col-span-2 text-sm tabular-nums">
                  {c.saturdayShare}%
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums">
                      {c.congestionScore}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-800 rounded-full"
                        style={{ width: `${c.congestionScore}%` }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </Link>
          ))}

        </div>
      </section>

      <section className="pt-8 border-t text-sm space-y-2">
        <h2 className="font-semibold">Explore Ireland Racing</h2>
        <ul className="underline space-y-1">
          <li>
            <Link href="/ireland/horse-racing">
              Ireland Horse Racing Hub→
            </Link>
          </li>
          <li>
            <Link href="/ireland/horse-racing/calendar-2026">
              Full 2026 Calendar Overview
            </Link>
          </li>
        </ul>
      </section>
    
    </main>
  );
}