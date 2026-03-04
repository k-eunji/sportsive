// src/app/sport/_components/HorseRacingCalendar2026.tsx

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MonthDaysToggle } from "@/app/components/MonthDaysToggle";

function slugifyVenue(name: string) {
  return name
    .toLowerCase()
    .replace(" racecourse", "")
    .replace(" race course", "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function HorseRacingCalendar2026({
  events,
}: {
  events: any[];
}) {

  const searchParams = useSearchParams();

  const selectedMonth = searchParams?.get("month");
  const course = searchParams?.get("course");

  const normalizedCourse = course
    ? slugifyVenue(course)
    : null;
  /* ================= FILTER ================= */

  const racing2026 = events.filter((e: any) => {
    const date = e.startDate;
    if (!date) return false;

    const year = date.slice(0, 4);
    const venueSlug = slugifyVenue(e.venue ?? "");

    return (
      year === "2026" &&
      (!normalizedCourse || venueSlug === normalizedCourse)
    );
  });
  const totalMeetings = racing2026.length;

  /* ================= GROUP BY DATE ================= */

  const groupedByDate: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    const d = e.startDate.slice(0,10);
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

  /* ================= SATURDAY ================= */

  const saturdayMeetings = racing2026.filter((e: any) => {
    const d = new Date(e.startDate);
    return d.getDay() === 6;
  }).length;

  const saturdayShare =
    totalMeetings > 0
      ? Math.round((saturdayMeetings / totalMeetings) * 100)
      : 0;

  const congestionScore = Math.min(
    100,
    Math.round(avgPerDay * 10 + saturdayShare)
  );

  /* ================= MONTH MAP ================= */

  const monthMap: Record<string, any[]> = {};

  racing2026.forEach((e: any) => {

    const date = e.startDate ?? e.date ?? e.utcDate;
    if (!date) return;

    const m = e.startDate.slice(0,7);

    if (!monthMap[m]) monthMap[m] = [];
    monthMap[m].push(e);

  });

  const peakMonth = Object.entries(monthMap)
    .sort((a: any, b: any) => b[1].length - a[1].length)[0];

  const orderedMonths = Object.keys(monthMap).sort();

  /* ================= REGIONAL ================= */

  const regionMap: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    const r = (e.region ?? "").toLowerCase();
    regionMap[r] = (regionMap[r] || 0) + 1;
  });

  const regionShare = Object.entries(regionMap).map(([region, count]) => ({
    region,
    count,
    share:
      totalMeetings > 0
        ? Math.round((count / totalMeetings) * 100)
        : 0,
  }));

  /* ================= VENUE ================= */

  const venueMap: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    if (!e.venue) return;
    venueMap[e.venue] = (venueMap[e.venue] || 0) + 1;
  });

  const sortedVenues = Object.entries(venueMap).sort(
    (a, b) => b[1] - a[1]
  );

  const topCourses = sortedVenues.slice(0, 8);

  /* ================= HIGH CONGESTION ================= */

  const highCongestionDays = sortedDays
    .filter(d => d[1] >= avgPerDay + 2)
    .slice(0, 5);

  /* ================= MONTH VIEW ================= */

  if (selectedMonth) {

    let monthEvents = monthMap[selectedMonth] ?? [];

    if (normalizedCourse) {
      monthEvents = monthEvents.filter(
        (e: any) => slugifyVenue(e.venue ?? "") === normalizedCourse
      );
    }

    const monthTitle = new Date(`${selectedMonth}-01`)
      .toLocaleString("en-GB", {
        month: "long",
        year: "numeric",
      });

    return (
      <section className="max-w-4xl mx-auto px-6 py-14 space-y-10">

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-semibold">
            {monthTitle} – Race Meetings
          </h2>

          <Link
            href={`?tab=calendar${course ? `&course=${course}` : ""}`}
            className="text-sm underline text-muted-foreground"
          >
            ← Back to months
          </Link>

        </div>

        <MonthDaysToggle
          monthlyEvents={monthEvents}
          totalMonth={monthEvents.length}
          mode={normalizedCourse ? "toggle" : "link"}
        />
      </section>
    );
  }

  /* ================= DEFAULT CALENDAR PAGE ================= */

  return (
    <section className="space-y-12">

      {/* HEADER */}

      <header className="space-y-4 border-b pb-8">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          Annual Structural Report
        </p>

        <h2 className="text-3xl font-semibold tracking-tight">
          UK Horse Racing Calendar 2026
        </h2>

        {course && (
          <p className="text-sm text-muted-foreground">
            Showing meetings for <strong>{course.replace("-", " ")}</strong>
          </p>
        )}
      </header>

      {/* SUMMARY */}

      <section className="text-sm text-muted-foreground">
        {totalMeetings} meetings across {activeDays} racing days.
        Average {avgPerDay} meetings per day.
      </section>

      {/* MONTH LIST */}

      <section className="space-y-6 pt-6 border-t">

        <h2 className="text-xl font-semibold">
          Browse by Month
        </h2>

        <div className="space-y-3">

          {orderedMonths.map((monthKey) => {

            const count = monthMap[monthKey].length;

            const monthName = new Date(`${monthKey}-01`)
              .toLocaleString("en-GB", {
                month: "long",
                year: "numeric",
              });

            return (
              <Link
                key={monthKey}
                href={`?tab=calendar&month=${monthKey}${course ? `&course=${course}` : ""}`}
                className="flex justify-between items-center py-3 border-b hover:opacity-70 transition"
              >
                <span className="font-medium">
                  {monthName}
                </span>

                <span className="text-sm text-muted-foreground">
                  {count} meetings
                </span>
              </Link>
            );
          })}

        </div>

      </section>

      {/* REGIONAL */}

      <section className="pt-10 border-t space-y-6">

        <h2 className="text-xl font-semibold">
          Regional Distribution
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          {regionShare.map((r) => (

            <div
              key={r.region}
              className="flex justify-between border rounded-xl px-5 py-4"
            >
              <span className="capitalize font-medium">
                {r.region}
              </span>

              <span className="text-sm text-muted-foreground">
                {r.count} · {r.share}%
              </span>

            </div>

          ))}

        </div>

      </section>

      {/* LEADING COURSES */}

      <section className="pt-10 border-t space-y-6">

        <h2 className="text-xl font-semibold">
          Leading UK Racecourses
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          {topCourses.map(([venue, count]) => (

            <Link
              key={venue}
              href={`/sport/horse-racing?tab=course&course=${slugifyVenue(venue)}`}
              className="flex justify-between border rounded-xl px-5 py-4 hover:bg-gray-50 transition"
            >

              <span>
                {venue.replace(" Racecourse", "")}
              </span>

              <span>
                {count}
              </span>

            </Link>

          ))}

        </div>

      </section>

    </section>
  );
}