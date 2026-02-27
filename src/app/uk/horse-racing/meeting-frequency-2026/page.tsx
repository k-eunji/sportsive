// src/app/uk/horse-racing/meeting-frequency-2026/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";

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
  title:
    "UK Racecourse Meeting Frequency 2026 – Course Ranking & Volume Share",
  description:
    "Compare UK racecourses by total meeting frequency during the 2026 horse racing season.",
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

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "UK Racecourse Meeting Frequency 2026",
    description:
      "Racecourse ranking by meeting frequency across the UK 2026 season.",
    author: {
      "@type": "Organization",
      name: "VenueScope",
    },
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-14">

      {/* ===== HEADER ===== */}

      <header className="space-y-4 border-b pb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          National Course Ranking
        </p>

        <h1 className="text-3xl font-bold">
          UK Racecourse Meeting Frequency – 2026
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Comparative ranking of UK racecourses by total meeting
          volume during the 2026 season.
        </p>
      </header>

      {/* ===== KPI SUMMARY ===== */}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t pt-8">
        <Stat title="Total Meetings" value={totalMeetings} />
        <Stat title="Active Courses" value={totalCourses} />
        <Stat title="Median Meetings" value={median} />
        <Stat title="Top 10 Share" value={`${top10Share}%`} />
      </section>

      {/* ===== STRUCTURAL INSIGHT ===== */}

      <section className="text-sm text-muted-foreground leading-relaxed space-y-4 border-t pt-8">
        <h2 className="font-semibold text-black">
          Structural Centralisation
        </h2>

        <p>
          The median UK racecourse hosts{" "}
          <strong>{median}</strong> meetings annually.
          Courses above this level operate at
          elevated national scale.
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

      {/* ===== COURSE RANKING ===== */}

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
                href={`/uk/horse-racing/courses/${slugifyVenue(venue)}`}
                className={`
                  block rounded-xl px-4 py-4 transition
                  ${i < 3 ? "bg-gray-50" : "bg-white"}
                  hover:bg-gray-50
                `}
              >
                <div className="flex justify-between items-center">

                  {/* Left */}
                  <span className="text-sm">
                    <span className="text-muted-foreground mr-2">
                      #{i + 1}
                    </span>
                    {venue.replace(" Racecourse", "")}
                  </span>

                  {/* Right */}
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="tabular-nums">
                      {count} meetings
                    </span>
                    <span className="text-xs">
                      ({percentage}%)
                    </span>
                    {aboveMedian && (
                      <span className="text-xs text-muted-foreground">
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

      {/* ===== INTERNAL LINKS ===== */}

      <section className="pt-10 border-t text-sm space-y-2">
        <h2 className="font-semibold">Related 2026 Analysis</h2>
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
              Full UK Horse Racing Calendar 2026
            </Link>
          </li>
          <li>
            <Link href="/uk/horse-racing/busiest-days-2026">
              Busiest Racing Days Report
            </Link>
          </li>
          <li>
            <Link href="/uk/horse-racing/courses">
              Course Structural Density Ranking
            </Link>
          </li>
        </ul>
      </section>

      {/* ===== STRUCTURED DATA ===== */}

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