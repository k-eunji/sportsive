// src/app/uk/football/month/[year]/[month]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

import DailyVolumeChart from "@/app/components/DailyVolumeChart";
import CompetitionShareChart from "@/app/components/CompetitionShareChart";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

type Props = {
  params: Promise<{ year: string; month: string }>;
};

function isValidYearMonth(year: string, month: string) {
  return /^\d{4}$/.test(year) && /^(0[1-9]|1[0-2])$/.test(month);
}

function formatMonthDisplay(year: string, month: string) {
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

function getMonthRange(year: string, month: string) {
  const base = new Date(Number(year), Number(month) - 1);
  const months = [];

  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const min = new Date(currentMonth);
  min.setMonth(min.getMonth() - 6);

  const max = new Date(currentMonth);
  max.setMonth(max.getMonth() + 3);

  for (let i = -2; i <= 2; i++) {
    const d = new Date(base);
    d.setMonth(d.getMonth() + i);

    if (d >= min && d <= max) {
      months.push({
        year: d.getFullYear(),
        month: String(d.getMonth() + 1).padStart(2, "0"),
      });
    }
  }

  return months;
}

/* ================= METADATA ================= */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, month } = await params;
  if (!isValidYearMonth(year, month)) return {};

  const displayMonth = formatMonthDisplay(year, month);

  return {
    title: `UK Football Fixtures – ${displayMonth} (Full Monthly Report)`,
    description: `Comprehensive monthly analytics report of professional football matches across the United Kingdom during ${displayMonth}.`,
    alternates: {
      canonical: `https://venuescope.io/uk/football/month/${year}/${month}`,
    },
  };
}

/* ================= PAGE ================= */

export default async function Page({ params }: Props) {
  const { year, month } = await params;
  if (!isValidYearMonth(year, month)) notFound();

  const requested = new Date(Number(year), Number(month) - 1, 1);

  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const PAST_MONTHS = 6;
  const FUTURE_MONTHS = 3;

  const min = new Date(currentMonth);
  min.setMonth(min.getMonth() - PAST_MONTHS);

  const max = new Date(currentMonth);
  max.setMonth(max.getMonth() + FUTURE_MONTHS);

  if (requested < min || requested > max) {
    notFound();
  }

  const displayMonth = formatMonthDisplay(year, month);
  const prefix = `${year}-${month}`;

  const events = await getAllEventsRaw("180d");

  /* ================= FILTER ================= */

  const ukFootballEvents = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      e.sport?.toLowerCase() === "football" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventMonth === prefix
    );
  });

  const totalMatches = ukFootballEvents.length;

  /* ================= DATE GROUPING ================= */

  const groupedByDate: Record<string, number> = {};

  ukFootballEvents.forEach((e: any) => {
    const d =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);
    if (!d) return;
    groupedByDate[d] = (groupedByDate[d] || 0) + 1;
  });

  const sortedEntries = Object.entries(groupedByDate).sort();
  const activeDays = sortedEntries.length;

  const busiestDay =
    [...sortedEntries].sort((a, b) => b[1] - a[1])[0] || null;

  const chartData = sortedEntries.map(([date, count]) => ({
    date: date.slice(8, 10),
    count,
    percentage:
      totalMatches > 0
        ? Math.round((count / totalMatches) * 100)
        : 0,
  }));

  /* ================= WEEKEND ================= */

  const weekendMatches = ukFootballEvents.filter((e: any) => {
    const d = new Date(
      e.startDate ?? e.date ?? e.utcDate
    );
    const day = d.getDay();
    return day === 0 || day === 6;
  }).length;

  const weekendShare =
    totalMatches > 0
      ? Math.round((weekendMatches / totalMatches) * 100)
      : 0;

  /* ================= COMPETITION ================= */

  const competitionMap: Record<string, number> = {};

  ukFootballEvents.forEach((e: any) => {
    if (!e.competition) return;
    competitionMap[e.competition] =
      (competitionMap[e.competition] || 0) + 1;
  });

  const competitionDistribution = Object.entries(competitionMap)
    .sort((a, b) => b[1] - a[1])
    .map(([competition, count]) => ({
      sport: competition, // Chart nameKey 유지
      count,
      percentage:
        totalMatches > 0
          ? Math.round((count / totalMatches) * 100)
          : 0,
    }));
  /* ================= CITY RANKING ================= */

  const cityMap: Record<string, number> = {};
  ukFootballEvents.forEach((e: any) => {
    if (!e.city) return;
    cityMap[e.city] = (cityMap[e.city] || 0) + 1;
  });

  const topCities = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* ================= VENUE ================= */

  const venueMap: Record<string, number> = {};
  ukFootballEvents.forEach((e: any) => {
    if (!e.venue) return;
    venueMap[e.venue] = (venueMap[e.venue] || 0) + 1;
  });

  const topVenues = Object.entries(venueMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* ================= PREVIOUS MONTH ================= */

  const prevDate = new Date(Number(year), Number(month) - 2);
  const prevPrefix = `${prevDate.getFullYear()}-${String(
    prevDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const previousMonthMatches = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      e.sport?.toLowerCase() === "football" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventMonth === prevPrefix
    );
  }).length;

  const monthChange =
    previousMonthMatches > 0
      ? Math.round(
          ((totalMatches - previousMonthMatches) /
            previousMonthMatches) *
            100
        )
      : null;

  const monthRange = getMonthRange(year, month);

  /* ================= UI ================= */

  return (
    <main className="max-w-5xl mx-auto px-6 py-14 space-y-16">

      <header>
        <h1 className="text-3xl font-bold">
          UK Football Fixtures – {displayMonth}
        </h1>
        <p className="text-muted-foreground text-sm">
          National monthly football analytics report
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Matches" value={totalMatches} />
        <SummaryCard title="Active Days" value={activeDays} />
        <SummaryCard
          title="Busiest Matchday"
          value={busiestDay ? busiestDay[1] : 0}
          subtitle={
            busiestDay ? formatFullDate(busiestDay[0]) : "N/A"
          }
        />
      </section>

      {monthChange !== null && (
        <p className="text-sm text-muted-foreground">
          Match volume {monthChange > 0 ? "increased" : "decreased"} by{" "}
          <strong>{Math.abs(monthChange)}%</strong> compared to the previous month.
        </p>
      )}

      <DailyVolumeChart data={chartData} />

      {competitionDistribution.length > 0 && (
        <>
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Competition Distribution – {displayMonth}
            </h2>

            <CompetitionShareChart data={competitionDistribution} />
          </section>

          <section className="text-sm text-muted-foreground leading-relaxed">
            <p>
              In <strong>{displayMonth}</strong>, a total of{" "}
              <strong>{totalMatches}</strong> professional football matches were
              played across England, Scotland, Wales and Northern Ireland. The
              busiest matchday fell on{" "}
              <strong>
                {busiestDay ? formatFullDate(busiestDay[0]) : "N/A"}
              </strong>.
            </p>

            <p className="mt-3">
              The most active competition during this month was{" "}
              <strong>{competitionDistribution[0].sport}</strong>, accounting for{" "}
              <strong>
                {competitionDistribution[0].percentage}%
              </strong>{" "}
              of all UK fixtures.
            </p>
          </section>
        </>
      )}
      {topCities.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Busiest Cities
          </h2>
          <ul className="space-y-2">
            {topCities.map(([city, count]) => (
              <li key={city} className="flex justify-between border-b py-2">
                <span>{city}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topVenues.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Top Stadiums
          </h2>
          <ul className="space-y-2">
            {topVenues.map(([venue, count]) => (
              <li key={venue} className="flex justify-between border-b py-2">
                <span>{venue}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ================= DAILY INDEX ================= */}

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Daily Match Index
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          {sortedEntries.map(([date, count]) => (
            <li key={date}>
              <Link
                href={`/uk/football/${date}`}
                className="underline"
              >
                {formatFullDate(date)} – {count}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ================= MONTH NAV ================= */}

      <section className="pt-8 border-t">
        <h2 className="text-lg font-semibold mb-4">
          Browse Nearby Months
        </h2>
        <div className="flex flex-wrap gap-3 text-sm">
          {monthRange.map(({ year: y, month: m }) => {
            const label = formatMonthDisplay(String(y), m);
            return (
              <Link
                key={`${y}-${m}`}
                href={`/uk/football/month/${y}/${m}`}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                {label}
              </Link>
            );
          })}
        </div>
      </section>

    </main>
  );
}

/* ================= CARD ================= */

function SummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: any;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border p-5 bg-white shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {title}
      </p>
      <p className="text-4xl font-bold mt-2">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}