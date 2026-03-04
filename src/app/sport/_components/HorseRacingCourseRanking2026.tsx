//src/app/sport/_components/HorseRacingCourseRanking2026.tsx

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

export default function HorseRacingMeetingFrequency2026({
  events,
}: {
  events: any[];
}) {
  const racing2026 = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);
    return year === "2026";
  });

  const totalMeetings = racing2026.length;

  const venueMap: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    if (!e.venue) return;
    venueMap[e.venue] = (venueMap[e.venue] || 0) + 1;
  });

  const sortedVenues = Object.entries(venueMap).sort(
    (a, b) => b[1] - a[1]
  );

  const totalCourses = sortedVenues.length;

  const totals = sortedVenues.map(([, c]) => c).sort((a, b) => a - b);

  const median =
    totals.length === 0
      ? 0
      : totals.length % 2 === 0
      ? Math.round(
          (totals[totals.length / 2 - 1] +
            totals[totals.length / 2]) / 2
        )
      : totals[Math.floor(totals.length / 2)];

  const top10Share =
    totalMeetings > 0
      ? Math.round(
          (sortedVenues
            .slice(0, 10)
            .reduce((sum, [, c]) => sum + c, 0) /
            totalMeetings) *
            100
        )
      : 0;

  return (
    <div className="space-y-14">

      {/* KPI */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t pt-8">
        <Stat title="Total Meetings" value={totalMeetings} />
        <Stat title="Active Courses" value={totalCourses} />
        <Stat title="Median Meetings" value={median} />
        <Stat title="Top 10 Share" value={`${top10Share}%`} />
      </section>

      {/* Structural Insight */}
      <section className="text-sm text-muted-foreground leading-relaxed space-y-4 border-t pt-8">
        <h2 className="font-semibold text-black">
          Structural Centralisation
        </h2>

        <p>
          The median UK racecourse hosts{" "}
          <strong>{median}</strong> meetings annually.
        </p>

        <p>
          The top 10 racecourses account for{" "}
          <strong>{top10Share}%</strong> of total meetings,
          indicating a
          {top10Share > 50
            ? " highly centralised fixture model."
            : " relatively distributed scheduling structure."}
        </p>
      </section>

      {/* Ranking */}
      <section className="pt-10 border-t space-y-6">
        <h2 className="text-xl font-semibold">
          Complete Course Ranking – 2026
        </h2>

        <div className="space-y-3">
          {sortedVenues.map(([venue, count], i) => {
            const percentage =
              totalMeetings > 0
                ? ((count / totalMeetings) * 100).toFixed(1)
                : "0.0";

            const aboveMedian = count > median;

            return (
              <Link
                key={venue}
                href={`/sport/horse-racing?tab=course&course=${slugifyVenue(venue)}`}
                className="block rounded-xl px-4 py-4 bg-white hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    <span className="text-muted-foreground mr-2">
                      #{i + 1}
                    </span>
                    {venue.replace(" Racecourse", "")}
                  </span>

                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="tabular-nums">
                      {count} meetings
                    </span>
                    <span className="text-xs">
                      ({percentage}%)
                    </span>
                    {aboveMedian && (
                      <span className="text-xs">
                        above median
                      </span>
                    )}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
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