//src/app/sport/_components/HorseRacingOverview.tsx

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

export default function HorseRacingOverview({
  events,
}: {
  events: any[];
}) {

  const searchParams = useSearchParams();
  const course = searchParams?.get("course");
  /* ================= FILTER ================= */

  const racing = events;

  const totalMeetings = racing.length;

  /* ================= DAY MAP ================= */

  const dayMap: Record<string, number> = {};

  racing.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    if (!d) return;
    dayMap[d] = (dayMap[d] || 0) + 1;
  });

  const activeDays = Object.keys(dayMap).length;

  const avgPerDay =
    activeDays > 0
      ? (totalMeetings / activeDays).toFixed(1)
      : "0";

  const sortedDays = Object.entries(dayMap)
    .sort((a, b) => b[1] - a[1]);

  const busiestDay = sortedDays[0];

  /* ================= MONTH ================= */

  const monthMap: Record<string, number> = {};

  racing.forEach((e: any) => {
    const m = (e.startDate ?? "").slice(0, 7);
    if (!m) return;
    monthMap[m] = (monthMap[m] || 0) + 1;
  });

  const sortedMonths = Object.entries(monthMap)
    .sort((a, b) => b[1] - a[1]);

  const peakMonth = sortedMonths[0];

  const orderedMonths = Object.keys(monthMap).sort();

  /* ================= COURSE ================= */

  const courseMap: Record<string, number> = {};

  racing.forEach((e: any) => {
    if (!e.venue) return;
    courseMap[e.venue] = (courseMap[e.venue] || 0) + 1;
  });

  const sortedCourses = Object.entries(courseMap)
    .sort((a, b) => b[1] - a[1]);

  const topCourses = sortedCourses.slice(0, 6);

  const totalCourses = sortedCourses.length;

  /* ================= DENSITY SIGNAL ================= */

  const density =
    activeDays > 0
      ? totalMeetings / activeDays
      : 0;

  const densitySignal =
    density > 4
      ? "High fixture congestion"
      : density > 2
      ? "Moderate national load"
      : "Distributed schedule";

  /* ================= SUMMARY ================= */

  const summary = `
  Across the UK and Ireland racing calendar, 
  ${totalMeetings} meetings are scheduled across 
  ${activeDays} active racing days.

  The busiest day records ${busiestDay?.[1] ?? 0} 
  concurrent meetings on ${busiestDay?.[0] ?? "-"}.

  The highest monthly volume occurs in ${peakMonth?.[0] ?? "-"} 
  with ${peakMonth?.[1] ?? 0} meetings.

  Racing activity is distributed across 
  ${totalCourses} active racecourses.
  `.trim();

  return (
    <div className="space-y-12">

      {/* ================= EXECUTIVE SUMMARY ================= */}

      <section className="rounded-2xl bg-muted/40 p-8">
        <h2 className="text-lg font-semibold mb-4">
          Structural Snapshot
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </section>

      {/* ================= METRICS ================= */}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">

        <Metric
          title="Total Meetings"
          value={totalMeetings}
        />

        <Metric
          title="Active Racing Days"
          value={activeDays}
        />

        <Metric
          title="Avg Meetings / Day"
          value={avgPerDay}
          hint={densitySignal}
        />

        <Metric
          title="Active Racecourses"
          value={totalCourses}
        />

      </section>

      {/* ================= STRUCTURAL SIGNALS ================= */}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">
          Density Signals
        </h3>

        <div className="flex flex-wrap gap-2">

          {density > 4 && (
            <Signal label="High Fixture Congestion" />
          )}

          {density <= 4 && density > 2 && (
            <Signal label="Moderate Density Calendar" />
          )}

          {density <= 2 && (
            <Signal label="Distributed Racing Schedule" />
          )}

          {busiestDay && (
            <Signal label={`Peak Day ${busiestDay[1]} meetings`} />
          )}

          {peakMonth && (
            <Signal label={`Peak Month ${peakMonth[0]}`} />
          )}

        </div>
      </section>

      {/* ================= MONTH NAVIGATION ================= */}

      <section className="space-y-6 border-t pt-8">

        <h3 className="text-xl font-semibold">
          Browse by Month
        </h3>

        <div className="space-y-3">

          {orderedMonths.map((monthKey) => {

            const count = monthMap[monthKey];

            const monthName = new Date(`${monthKey}-01`)
              .toLocaleString("en-GB", {
                month: "long",
                year: "numeric",
              });

            return (
              <Link
                key={monthKey}
                href={`?tab=calendar&month=${monthKey}${course ? `&course=${course}` : ""}`}
                className="flex justify-between items-center px-4 py-3 rounded-lg hover:bg-muted/40 transition"
              >
                <span>{monthName}</span>

                <span className="text-sm text-muted-foreground">
                  {count} meetings
                </span>
              </Link>
            );
          })}

        </div>

      </section>

      {/* ================= COURSE NAVIGATION ================= */}

      <section className="space-y-6 border-t pt-8">

        <h3 className="text-xl font-semibold">
          Leading Racecourses
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          {topCourses.map(([venue, count]) => (

            <Link
              key={venue}
              href={`?tab=courses&course=${slugifyVenue(venue)}`}
              className="flex justify-between items-center border rounded-xl px-5 py-4 hover:bg-gray-50 transition"
            >

              <span>
                {venue.replace(" Racecourse", "")}
              </span>

              <span className="text-sm text-muted-foreground">
                {count} meetings
              </span>

            </Link>

          ))}

        </div>

      </section>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function Metric({
  title,
  value,
  hint,
}: {
  title: string;
  value: any;
  hint?: string;
}) {
  return (
    <div className="border rounded-2xl p-6 bg-white">
      <p className="text-xs uppercase text-muted-foreground">
        {title}
      </p>

      <p className="text-3xl font-semibold mt-2">
        {value}
      </p>

      {hint && (
        <p className="text-xs text-muted-foreground mt-2">
          {hint}
        </p>
      )}
    </div>
  );
}

function Signal({ label }: { label: string }) {
  return (
    <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
      {label}
    </span>
  );
}