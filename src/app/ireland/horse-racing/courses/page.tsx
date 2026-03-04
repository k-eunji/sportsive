//src/app/ireland/horse-racing/courses/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";

import SportFilterBar from "@/app/sport/_components/SportFilterBar";
import HorseRacingSportPage from "@/app/sport/_components/HorseRacingSportPage";

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

  /* ===== IRELAND FILTER ===== */

  const irelandEvents = events.filter((e: any) =>
    IRELAND_REGIONS.includes(e.region?.toLowerCase())
  );

  const racing2026 = irelandEvents.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);
    return year === "2026" && e.venue;
  });

  const totalMeetings = racing2026.length;

  /* ===== GROUP BY VENUE ===== */

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

  /* ===== METRICS ===== */

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

  const sortedTotals = courses.map(c => c.total).sort((a,b)=>a-b);

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
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">

      {/* BACK */}

      <div>
        <Link
          href="/ireland/horse-racing"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Ireland Horse Racing Hub
        </Link>
      </div>

      {/* FILTER BAR */}

      <SportFilterBar
        slug="horse-racing"
        events={irelandEvents}
      />

      {/* HEADER */}

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

      {/* KPI */}

      <section className="grid md:grid-cols-3 gap-6 pt-8 border-t">

        <Stat title="Total Meetings" value={totalMeetings} />
        <Stat title="Active Courses" value={totalCourses} />
        <Stat
          title="Largest Share"
          value={largest ? `${largest.share}%` : "-"}
          note={largest?.venue.replace(" Racecourse","")}
        />
        <Stat
          title="Median Meetings / Course"
          value={median}
        />

      </section>

      {/* ANALYSIS */}

      <section className="pt-8 border-t text-sm text-muted-foreground space-y-3">

        <h2 className="font-semibold text-black">
          Fixture Centralisation
        </h2>

        <p>
          The top 10 racecourses account for <strong>{top10Share}%</strong>
          of all Ireland race meetings in 2026.
        </p>

      </section>

      {/* ===== SPORT PAGE CONTENT ===== */}

      <HorseRacingSportPage
        events={irelandEvents}
        tab="courses"
        course={null}
      />

      {/* INTERNAL LINKS */}

      <section className="pt-8 border-t text-sm space-y-2">

        <h2 className="font-semibold">
          Explore Ireland Racing
        </h2>

        <ul className="underline space-y-1">

          <li>
            <Link href="/ireland/horse-racing">
              Ireland Horse Racing Hub →
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

function Stat({ title, value, note }: any) {
  return (
    <div className="border rounded-2xl p-6">
      <p className="text-xs uppercase text-muted-foreground">
        {title}
      </p>
      <p className="text-3xl font-semibold mt-2">
        {value}
      </p>
      {note && (
        <p className="text-xs text-muted-foreground mt-1">
          {note}
        </p>
      )}
    </div>
  );
}