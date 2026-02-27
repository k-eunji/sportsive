// src/app/uk/horse-racing/overlap-report-2026/page.tsx

import type { Metadata } from "next";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";
import Link from "next/link";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
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
  title: "UK Horse Racing Overlap Report 2026",
  description:
    "National overlap intensity analysis of concurrent UK horse racing meetings across 2026.",
};

export default async function Page() {
  const events = await getHorseRacingEventsRaw();

  const racing2026 = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);
    return (
      e.sport === "horse-racing" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      year === "2026"
    );
  });

  const totalMeetings = racing2026.length;

  /* ================= SESSION DISTRIBUTION ================= */

  const sessionMap: Record<string, number> = {};

  racing2026.forEach((e: any) => {
    const session =
      e.sessionTime ||
      e.payload?.sessionTime ||
      "Unknown";

    sessionMap[session] =
      (sessionMap[session] || 0) + 1;
  });

  const sortedSessions = Object.entries(sessionMap)
    .map(([session, count]) => ({
      session,
      count,
      percentage:
        totalMeetings > 0
          ? ((count / totalMeetings) * 100).toFixed(1)
          : "0.0",
    }))
    .sort((a, b) => b.count - a.count);

  const peakSession = sortedSessions[0];

  /* ================= DAILY OVERLAP ================= */

  const dayMap: Record<string, number> = {};

  racing2026.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    dayMap[d] = (dayMap[d] || 0) + 1;
  });

  const sortedDays = Object.entries(dayMap)
    .sort((a, b) => b[1] - a[1]);

  const peakDay = sortedDays[0];

  /* ================= WEEKDAY DISTRIBUTION ================= */

  const weekdayMap: Record<string, number> = {};

  racing2026.forEach((e: any) => {
    const date = new Date(e.startDate);
    const weekday = date.toLocaleString("en-GB", {
      weekday: "long",
    });

    weekdayMap[weekday] =
      (weekdayMap[weekday] || 0) + 1;
  });

  const sortedWeekdays = Object.entries(weekdayMap)
    .map(([day, count]) => ({
      day,
      count,
      percentage:
        totalMeetings > 0
          ? ((count / totalMeetings) * 100).toFixed(1)
          : "0.0",
    }))
    .sort((a, b) => b.count - a.count);

  /* ================= OVERLAP INDEX ================= */

  const avgSession =
    sortedSessions.reduce(
      (sum, s) => sum + s.count,
      0
    ) / (sortedSessions.length || 1);

  const overlapIndex = Math.min(
    100,
    Math.round(
      (Number(peakSession?.count ?? 0) /
        (avgSession || 1)) *
        25
    )
  );

  const overlapLevel =
    overlapIndex > 70
      ? "High"
      : overlapIndex > 40
      ? "Moderate"
      : "Low";

  /* ================= STRUCTURED DATA ================= */

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "UK Horse Racing Overlap Report 2026",
    description:
      "National concurrency and overlap intensity analysis of UK race meetings.",
    author: {
      "@type": "Organization",
      name: "VenueScope",
    },
  };

  const weekendDays = ["Saturday", "Sunday"];

  const weekendCount = sortedWeekdays
    .filter(w => weekendDays.includes(w.day))
    .reduce((sum, w) => sum + w.count, 0);

  const weekendPercentage =
    totalMeetings > 0
      ? ((weekendCount / totalMeetings) * 100).toFixed(1)
      : "0.0";

  const courseMap: Record<string, number> = {};

  racing2026.forEach((e: any) => {
    if (!e.venue) return;
    courseMap[e.venue] = (courseMap[e.venue] || 0) + 1;
  });

  const topCourses = Object.entries(courseMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);    

  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-14">

      {/* HEADER */}
      <header className="space-y-4 border-b pb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          National Session Overlap Analysis
        </p>

        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">
            UK Horse Racing Overlap – 2026
          </h1>

          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              overlapLevel === "High"
                ? "bg-red-100 text-red-600"
                : overlapLevel === "Moderate"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-600"
            }`}
          >
            {overlapLevel} Overlap · {overlapIndex}/100
          </span>
        </div>
      </header>

      {/* KPI GRID */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t pt-8">
        <Stat title="Total Meetings" value={totalMeetings} />
        <Stat title="Peak Session" value={peakSession?.session ?? "-"} />
        <Stat title="Peak Session %" value={`${peakSession?.percentage ?? 0}%`} />
        <Stat title="Peak Day Volume" value={peakDay?.[1] ?? 0} />
        <Stat title="Weekend Share" value={`${weekendPercentage}%`} />
      </section>

      <section className="pt-8 border-t text-sm text-muted-foreground space-y-4">
        <h2 className="text-lg font-semibold text-black">
          Structural Insight
        </h2>

        <p>
          {peakSession?.session} sessions account for{" "}
          {peakSession?.percentage}% of total meetings,
          indicating national scheduling concentration.
        </p>

        <p>
          Weekend fixtures represent {weekendPercentage}% of the
          annual calendar, highlighting peak spectator windows.
        </p>
      </section>

      {/* SESSION DISTRIBUTION */}
      <section className="pt-8 border-t space-y-6">
        <h2 className="text-lg font-semibold">
          Session Distribution
        </h2>

        <ul className="space-y-2 text-sm">
          {sortedSessions.map((s) => (
            <li key={s.session} className="flex justify-between">
              <span>{s.session}</span>
              <span className="font-medium">
                {s.count} meetings ({s.percentage}%)
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* WEEKDAY DISTRIBUTION */}
      <section className="pt-8 border-t space-y-6">
        <h2 className="text-lg font-semibold">
          Weekday Distribution
        </h2>

        <ul className="space-y-2 text-sm">
          {sortedWeekdays.map((w) => (
            <li key={w.day} className="flex justify-between">
              <span>{w.day}</span>
              <span className="font-medium">
                {w.count} meetings ({w.percentage}%)
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-8 border-t space-y-6">
        <h2 className="text-lg font-semibold">
          Most Active Racecourses
        </h2>

        <ul className="space-y-2 text-sm">
          {topCourses.map(([venue, count]) => (
            <li key={venue} className="flex justify-between">
              <Link
                href={`/uk/horse-racing/courses/${slugifyVenue(venue)}`}
                className="underline hover:opacity-70"
              >
                {venue.replace(" Racecourse", "")}
              </Link>
              <span className="font-medium">
                {count} meetings
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* TOP 5 DAYS */}
      <section className="pt-8 border-t space-y-6">
        <h2 className="text-lg font-semibold">
          Top 5 Overlap Days
        </h2>

        <ul className="space-y-2 text-sm">
          {sortedDays.slice(0, 5).map(([date, count]) => (
            <li key={date} className="flex justify-between">
              <span>{date}</span>
              <span className="font-medium">
                {count} meetings
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-8 border-t text-sm space-y-2">
        <h2 className="font-semibold">Related 2026 Reports</h2>
        <ul className="underline space-y-1">
          <li>
            <Link
              href="/uk/horse-racing"
            >
              UK Horse Racing Hub→
            </Link>
          </li>
          <li>
            <Link href="/uk/horse-racing/calendar-2026">
              Full 2026 Calendar Overview
            </Link>
          </li>
          <li>
            <Link href="/uk/horse-racing/busiest-days-2026">
              Busiest Racing Days
            </Link>
          </li>
          <li>
            <Link href="/uk/horse-racing/meeting-frequency-2026">
              Course Frequency Ranking
            </Link>
          </li>
        </ul>
      </section>
      
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