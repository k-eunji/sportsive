// src/app/ireland/horse-racing/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";

const IRELAND_REGIONS = [
  "ireland",
  "republic of ireland",
];

export const metadata: Metadata = {
  title: "Ireland Horse Racing Fixtures 2026 – Full Calendar & Race Dates",
  description:
    "Complete overview of Ireland horse racing fixtures in 2026, including monthly breakdown and racecourse schedules.",
};

function slugifyVenue(name: string) {
  return name
    .toLowerCase()
    .replace(" racecourse", "")
    .replace(" race course", "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default async function Page() {
  const events = await getHorseRacingEventsRaw();

  const racing2026 = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);
    return (
      e.sport === "horse-racing" &&
      IRELAND_REGIONS.includes(e.region?.toLowerCase()) &&
      year === "2026"
    );
  });

  const totalMeetings = racing2026.length;

  /* ===== Group by Date ===== */

  const groupedByDate: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    groupedByDate[d] = (groupedByDate[d] || 0) + 1;
  });

  const busiest = Object.entries(groupedByDate)
    .sort((a, b) => b[1] - a[1])[0];

  /* ===== Group by Venue ===== */

  const venueMap: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    if (!e.venue) return;
    venueMap[e.venue] = (venueMap[e.venue] || 0) + 1;
  });

  const sortedVenues = Object.entries(venueMap)
    .sort((a, b) => b[1] - a[1]);

  const totalCourses = sortedVenues.length;

  const topCourses = sortedVenues.slice(0, 6);

  /* ===== Structured Data ===== */

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Ireland Horse Racing Fixtures 2026",
    description:
      "National overview of Ireland horse racing meetings and racecourse schedules.",
    author: {
      "@type": "Organization",
      name: "VenueScope",
    },
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-14 space-y-14">

      {/* ===== HEADER ===== */}

      <header className="space-y-4 border-b pb-8">

        <div className="text-xs text-muted-foreground">
          Also view{" "}
          <Link
            href="/uk/horse-racing"
            className="underline hover:opacity-70"
          >
            UK Horse Racing 2026
          </Link>
        </div>

        <h1 className="text-3xl font-bold">
          Ireland Horse Racing Fixtures – 2026
        </h1>

        <p className="text-muted-foreground max-w-2xl">
          Complete overview of all scheduled horse racing meetings
          across Ireland during the 2026 season, including monthly
          race dates and course schedules.
        </p>

      </header>
      {/* ===== KPI GRID ===== */}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <Stat title="Total Meetings" value={totalMeetings} />
        <Stat title="Active Racecourses" value={totalCourses} />
        <Stat title="Busiest Day" value={busiest?.[0] ?? "-"} />
        <Stat title="Peak Day Volume" value={busiest?.[1] ?? 0} />
      </section>

      {/* ===== MONTHLY ENTRY ===== */}
      <section className="pt-10 border-t space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Monthly Fixtures – 2026
          </h2>

          <Link
            href="/ireland/horse-racing/calendar-2026"
            className="text-sm underline hover:opacity-70 transition"
          >
            View full 2026 calendar →
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
          {Array.from({ length: 12 }).map((_, i) => {
            const month = String(i + 1).padStart(2, "0");
            return (
              <Link
                key={month}
                href={`/ireland/horse-racing/month/2026/${month}`}
                className="text-center p-3 rounded-lg bg-white hover:bg-gray-50 transition"
              >
                {month}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== TOP RACECOURSES ===== */}

      <section className="pt-10 border-t space-y-6">
        <h2 className="text-xl font-semibold">
          Leading Irish Racecourses – 2026
        </h2>

        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {topCourses.map(([venue]) => (
            <li key={venue}>
              <Link
                href={`/ireland/horse-racing/courses/${slugifyVenue(venue)}`}
                className="underline"
              >
                {venue.replace(" Racecourse", "")}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/ireland/horse-racing/courses"
          className="text-sm underline"
        >
          View all Ireland racecourses →
        </Link>
      </section>

      {/* ===== INTERNAL LINKS ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleData),
        }}
      />

    </main>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="border rounded-2xl p-6 bg-white">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="text-3xl font-semibold mt-2">
        {value}
      </p>
    </div>
  );
}