//src/app/sport/_components/HorseRacingOverlapReport2026.tsx

"use client";

import Link from "next/link";

function slugifyVenue(name: string) {
  return name
    .toLowerCase()
    .replace(" racecourse", "")
    .replace(" race course", "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function HorseRacingOverlapReport2026({
  events,
}: {
  events: any[];
}) {

  const racing2026 = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);
    return year === "2026";
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

  /* ================= WEEKDAY ================= */

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

  const weekendDays = ["Saturday", "Sunday"];

  const weekendCount = sortedWeekdays
    .filter((w) => weekendDays.includes(w.day))
    .reduce((sum, w) => sum + w.count, 0);

  const weekendPercentage =
    totalMeetings > 0
      ? ((weekendCount / totalMeetings) * 100).toFixed(1)
      : "0.0";

  /* ================= COURSE MAP ================= */

  const courseMap: Record<string, number> = {};

  racing2026.forEach((e: any) => {
    if (!e.venue) return;
    courseMap[e.venue] = (courseMap[e.venue] || 0) + 1;
  });

  const topCourses = Object.entries(courseMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <section className="space-y-12">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <Stat title="Total Meetings" value={totalMeetings} />
        <Stat title="Peak Session" value={peakSession?.session ?? "-"} />
        <Stat title="Peak Session %" value={`${peakSession?.percentage ?? 0}%`} />
        <Stat title="Peak Day Volume" value={peakDay?.[1] ?? 0} />
        <Stat title="Weekend Share" value={`${weekendPercentage}%`} />
      </div>

      <section className="space-y-4 text-sm text-muted-foreground">
        <p>
          {peakSession?.session} sessions represent {peakSession?.percentage}% of meetings.
        </p>

        <p>
          Weekend fixtures account for {weekendPercentage}% of the national calendar.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Session Distribution</h3>

        {sortedSessions.map((s) => (
          <div key={s.session} className="flex justify-between border-b py-1 text-sm">
            <span>{s.session}</span>
            <span>{s.count} ({s.percentage}%)</span>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Weekday Distribution</h3>

        {sortedWeekdays.map((w) => (
          <div key={w.day} className="flex justify-between border-b py-1 text-sm">
            <span>{w.day}</span>
            <span>{w.count} ({w.percentage}%)</span>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Most Active Racecourses</h3>

        {topCourses.map(([venue, count]) => (
          <div key={venue} className="flex justify-between border-b py-1 text-sm">

            <Link
              href={`/sport/horse-racing?tab=course&course=${slugifyVenue(venue)}`}
              className="underline"
            >
              {venue.replace(" Racecourse", "")}
            </Link>

            <span>{count}</span>

          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Top Overlap Days</h3>

        {sortedDays.slice(0, 5).map(([date, count]) => (
          <div key={date} className="flex justify-between border-b py-1 text-sm">
            <span>{date}</span>
            <span>{count}</span>
          </div>
        ))}
      </section>

    </section>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="border rounded-xl p-4">
      <p className="text-xs uppercase text-muted-foreground">{title}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}