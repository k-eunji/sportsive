// src/app/ireland/horse-racing/calendar-2026/page.tsx

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
    "Ireland Horse Racing Calendar 2026 – Total Meetings, Busiest Days & Overlap Analysis",
  description:
    "Complete 2026 horse racing calendar for Ireland. Analyse total race meetings, busiest days, monthly distribution and peak racing periods.",
};

export default async function Page() {

  const events = await getHorseRacingEventsRaw();

  const irelandEvents = events.filter((e: any) => {
    const region = (e.region ?? "")
      .toString()
      .trim()
      .toLowerCase();

    return IRELAND_REGIONS.includes(region);
  });

  const racing2026 = irelandEvents.filter((e: any) => {
    const d = new Date(e.startDate ?? e.date);
    const year = d.getFullYear();
    const month = d.getMonth();

    return year === 2026 && month >= 1;
  });

  const totalMeetings = racing2026.length;

  const groupedByDate: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    groupedByDate[d] = (groupedByDate[d] || 0) + 1;
  });

  const activeDays = Object.keys(groupedByDate).length;

  const sortedDays = Object.entries(groupedByDate).sort(
    (a, b) => b[1] - a[1]
  );

  const busiestDay = sortedDays[0] ?? null;

  const avgPerDay =
    activeDays > 0
      ? Math.round(totalMeetings / activeDays)
      : 0;

  const saturdayMeetings = racing2026.filter((e: any) => {
    const d = new Date(e.startDate);
    return d.getDay() === 6;
  }).length;

  const saturdayShare =
    totalMeetings > 0
      ? Math.round((saturdayMeetings / totalMeetings) * 100)
      : 0;

  const monthMap: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    const m = (e.startDate ?? "").slice(0, 7);
    monthMap[m] = (monthMap[m] || 0) + 1;
  });

  const peakMonth = Object.entries(monthMap)
    .sort((a, b) => b[1] - a[1])[0];

  const congestionScore = Math.min(
    100,
    Math.round(avgPerDay * 10 + saturdayShare)
  );

  const orderedMonths = Array.from({ length: 11 }).map((_, i) => {
    const month = String(i + 2).padStart(2, "0");
    const key = `2026-${month}`;
    return {
      key,
      month,
      count: monthMap[key] || 0,
    };
  });

  const venueMap: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    if (!e.venue) return;
    venueMap[e.venue] = (venueMap[e.venue] || 0) + 1;
  });

  const sortedVenues = Object.entries(venueMap).sort(
    (a, b) => b[1] - a[1]
  );

  const topCourses = sortedVenues.slice(0, 8);

  const top5Share =
    totalMeetings > 0
      ? Math.round(
          (sortedVenues.slice(0, 5)
            .reduce((sum, v) => sum + v[1], 0) /
            totalMeetings) *
            100
        )
      : 0;

  const highCongestionDays = sortedDays
    .filter(d => d[1] >= avgPerDay + 2)
    .slice(0, 5);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">

      {/* BACK */}
      <div>
        <Link
          href="/ireland/horse-racing"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Ireland Horse Racing Hub
        </Link>
      </div>

      {/* FILTER BAR (sport 페이지와 동일) */}
      <SportFilterBar
        slug="horse-racing"
        events={irelandEvents}
      />

      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          Ireland Horse Racing Calendar 2026
        </h1>

        <p className="text-muted-foreground">
          {totalMeetings} meetings · {activeDays} racing days · structural calendar analysis
        </p>
      </header>

      {/* SUMMARY */}
      <section className="text-sm leading-relaxed text-muted-foreground max-w-3xl">
        <p>
          The 2026 Ireland racing calendar includes{" "}
          <strong>{totalMeetings}</strong> meetings across{" "}
          <strong>{activeDays}</strong> active racing days.
          Average daily density stands at{" "}
          <strong>{avgPerDay}</strong> meetings per day,
          with Saturday fixtures accounting for{" "}
          <strong>{saturdayShare}%</strong>.
        </p>
      </section>

      {/* ===== SPORT PAGE CONTENT (TABS + CALENDAR) ===== */}

      <HorseRacingSportPage
        events={irelandEvents}
        tab="calendar"
        course={null}
      />

      {/* ===== MONTHLY SEO LINKS ===== */}

      <section className="space-y-6 pt-8 border-t">
        <h2 className="text-xl font-semibold">
          Monthly Ireland Racing Schedule
        </h2>

        <div className="space-y-3">

          {orderedMonths
            .filter(m => m.count > 0)
            .map(({ key, month, count }) => {

              const monthName = new Date(`${key}-01`)
                .toLocaleString("en-GB", {
                  month: "long",
                });

              return (
                <Link
                  key={key}
                  href={`/ireland/horse-racing/month/2026/${month}`}
                  className="flex justify-between items-center py-3 border-b border-border/40 hover:opacity-70 transition"
                >
                  <span className="text-sm font-medium">
                    {monthName}
                  </span>

                  <span className="text-sm tabular-nums text-muted-foreground">
                    {count} meetings
                  </span>
                </Link>
              );
            })}

        </div>
      </section>

    </main>
  );
}