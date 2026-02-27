// src/app/uk/horse-racing/next-60-days-density/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";
import { MonthDaysToggle } from "@/app/components/MonthDaysToggle";

const UK_REGIONS = ["england", "scotland", "wales", "northern ireland"];

export const metadata: Metadata = {
  title: "UK Horse Racing – Next 60 Days Density Report",
  description:
    "Short-term congestion analysis of UK horse racing meetings across the next 60 days.",
};

export default async function Page() {
  const events = await getHorseRacingEventsRaw();

  const today = new Date();
  today.setHours(0,0,0,0);
  const future = new Date();
  future.setDate(today.getDate() + 60);

  const upcoming = events.filter((e: any) => {
    const date = new Date(e.startDate);
    return (
      e.sport === "horse-racing" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      date >= today &&
      date <= future
    );
  });

  const total = upcoming.length;

  const grouped: Record<string, number> = {};
  upcoming.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    grouped[d] = (grouped[d] || 0) + 1;
  });

  const activeDays = Object.keys(grouped).length;

  const avgPerDay =
    activeDays > 0
      ? total / activeDays
      : 0;

  const sortedDays = Object.entries(grouped).sort(
    (a, b) => b[1] - a[1]
  );

  const peak = sortedDays[0] ?? null;

  /* ===== Density Index (0–100) ===== */

  const densityIndex = Math.min(
    100,
    Math.round(avgPerDay * 15 + (peak?.[1] ?? 0) * 5)
  );

  const densityLevel =
    densityIndex > 70
      ? "High"
      : densityIndex > 40
      ? "Moderate"
      : "Low";

  /* ===== High Density Days ===== */

  const highDensityDays = sortedDays.filter(
    ([, count]) => count >= avgPerDay + 2
  );

  /* ===== Rolling 30-Day Comparison ===== */

  const midDate = new Date(today);
  midDate.setDate(today.getDate() + 30);

  const first30 = upcoming.filter((e: any) => {
    const d = new Date(e.startDate);
    return d >= today && d < midDate;
  });

  const second30 = upcoming.filter((e: any) => {
    const d = new Date(e.startDate);
    return d >= midDate && d <= future;
  });

  const firstCount = first30.length;
  const secondCount = second30.length;

  const trend =
    firstCount === 0
      ? 0
      : Math.round(((secondCount - firstCount) / firstCount) * 100);

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "UK Horse Racing – Next 60 Days Density",
    description:
      "Short-term structural congestion and overlap report across UK racecourses.",
    author: {
      "@type": "Organization",
      name: "VenueScope",
    },
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-14">

      {/* HEADER */}
      <header className="space-y-4 border-b pb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Short-Term Congestion Report
        </p>

        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">
            UK Horse Racing – Next 60 Days
          </h1>

          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              densityLevel === "High"
                ? "bg-red-100 text-red-600"
                : densityLevel === "Moderate"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-600"
            }`}
          >
            {densityLevel} Density · {densityIndex}/100
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Near-term structural density and national overlap risk analysis.
        </p>
      </header>

      {/* KPI GRID */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center border-t pt-8">
        <Stat title="Total Meetings" value={total} />
        <Stat title="Active Days" value={activeDays} />
        <Stat title="Avg / Day" value={avgPerDay.toFixed(1)} />
        <Stat title="Peak Day" value={peak?.[1] ?? 0} />
        <Stat title="Density Index" value={`${densityIndex}/100`} />
      </section>

      {/* DENSITY STATUS */}
      <section className="pt-8 border-t space-y-4 text-sm text-muted-foreground">
        <p>
          Current congestion level is classified as{" "}
          <strong>{densityLevel}</strong>.
        </p>

        {peak && (
          <p>
            The highest daily load reaches{" "}
            <strong>{peak[1]}</strong> meetings on{" "}
            <strong>{peak[0]}</strong>.
          </p>
        )}

        <p>
          Compared to the first 30-day window, fixture volume is{" "}
          <strong>
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </strong>{" "}
          in the second half of the period.
        </p>
      </section>

      {/* HIGH DENSITY */}
      {highDensityDays.length > 0 && (
        <section className="pt-8 border-t space-y-6">
          <h2 className="text-lg font-semibold">
            High Congestion Days
          </h2>

          <ul className="space-y-2 text-sm">
            {highDensityDays.slice(0, 6).map(([date, count]) => (
              <li
                key={date}
                className="flex justify-between"
              >
                <span>{date}</span>
                <span className="font-medium">
                  {count} meetings
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* DAILY TOGGLE */}
      <section className="pt-8 border-t space-y-6">
        <h2 className="text-lg font-semibold">
          Full 60-Day Breakdown
        </h2>

        <MonthDaysToggle
          monthlyEvents={upcoming}
          totalMonth={total}
        />
      </section>

      {/* INTERNAL LINKS */}
      <section className="pt-8 border-t text-sm space-y-2">
        <h2 className="font-semibold">Full Structural Analysis</h2>
        <ul className="underline space-y-1">
          <li>
            <Link
              href="/uk/horse-racing"
            >
              UK Horse Racing Hub→
            </Link>
          </li>
          <li><Link href="/uk/horse-racing/calendar-2026">Annual Calendar</Link></li>
          <li><Link href="/uk/horse-racing/busiest-days-2026">Busiest Days</Link></li>
          <li><Link href="/uk/horse-racing/meeting-frequency-2026">Course Ranking</Link></li>
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