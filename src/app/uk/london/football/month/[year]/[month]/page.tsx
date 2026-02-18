//src/app/uk/london/football/month/[year]/[month]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

import DailyVolumeChart from "@/app/components/DailyVolumeChart";
import WeekendSplitChart from "@/app/components/WeekendSplitChart";
import SportDistributionChart from "@/app/components/SportDistributionChart";

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
  const baseDate = new Date(Number(year), Number(month) - 1);

  const months = [];

  for (let i = -2; i <= 2; i++) {
    const d = new Date(baseDate);
    d.setMonth(d.getMonth() + i);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");

    months.push({ year: y, month: m });
  }

  return months;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, month } = await params;
  if (!isValidYearMonth(year, month)) return {};

  const displayMonth = formatMonthDisplay(year, month);

  return {
    title: `London Football Fixtures – ${displayMonth} (Full Match List & Stats)`,
    description: `Full list of London football fixtures in ${displayMonth}. View match volume, busiest days, league distribution and stadium usage across the capital.`,
    alternates: {
      canonical: `https://venuescope.io/uk/london/football/month/${year}/${month}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const { year, month } = await params;
  if (!isValidYearMonth(year, month)) notFound();

  const displayMonth = formatMonthDisplay(year, month);
  const prefix = `${year}-${month}`;

  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), 1);

  const PAST_MONTHS = 6;
  const FUTURE_MONTHS = 3;

  const min = new Date(base);
  min.setMonth(min.getMonth() - PAST_MONTHS);

  const max = new Date(base);
  max.setMonth(max.getMonth() + FUTURE_MONTHS);

  const requested = new Date(Number(year), Number(month) - 1, 1);

  if (requested < min || requested > max) {
    notFound();
  }

  const monthRange = getMonthRange(year, month);

  const events = await getAllEventsRaw("180d");

  const londonFootballEvents = events.filter((e: any) => {
    const eventMonth = (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);
    return (
      e.sport?.toLowerCase() === "football" &&
      e.city?.toLowerCase() === "london" &&
      eventMonth === prefix
    );
  });

  const totalMatches = londonFootballEvents.length;

  /* =========================
     DATE GROUPING
  ========================= */

  const groupedByDate: Record<string, number> = {};

  londonFootballEvents.forEach((event: any) => {
    const fullDate =
      (event.startDate ?? event.date ?? event.utcDate)?.slice(0, 10);
    if (!fullDate) return;
    groupedByDate[fullDate] = (groupedByDate[fullDate] || 0) + 1;
  });

  const sortedEntries = Object.entries(groupedByDate).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const busiestDay =
    [...sortedEntries].sort((a, b) => b[1] - a[1])[0] || null;

  const weekendMatches = sortedEntries
    .filter(([date]) => {
      const d = new Date(date);
      const day = d.getDay();
      return day === 0 || day === 6;
    })
    .reduce((sum, [, count]) => sum + count, 0);

  const weekdayMatches = totalMatches - weekendMatches;

  const weekendShare =
    totalMatches > 0
      ? Math.round((weekendMatches / totalMatches) * 100)
      : 0;

  /* =========================
     LEAGUE DISTRIBUTION
  ========================= */

  const leagueMap: Record<string, number> = {};

  londonFootballEvents.forEach((event: any) => {
    if (!event.league) return; // 🔥 Other 제거
    leagueMap[event.league] = (leagueMap[event.league] || 0) + 1;
  });

  const leagueChartData = Object.entries(leagueMap)
    .sort((a, b) => b[1] - a[1])
    .map(([league, count]) => ({
      sport: league,
      count,
    }));

  /* =========================
     CLUB DISTRIBUTION
  ========================= */

  const clubMap: Record<string, number> = {};

  londonFootballEvents.forEach((event: any) => {
    if (!event.homeTeam) return;
    clubMap[event.homeTeam] = (clubMap[event.homeTeam] || 0) + 1;
  });

  const topClubs = Object.entries(clubMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* =========================
     STADIUM DISTRIBUTION
  ========================= */

  const stadiumMap: Record<string, number> = {};

  londonFootballEvents.forEach((event: any) => {
    if (!event.venue) return;
    stadiumMap[event.venue] = (stadiumMap[event.venue] || 0) + 1;
  });

  const stadiumDistribution = Object.entries(stadiumMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* =========================
     CHART DATA
  ========================= */

  const chartData = sortedEntries.map(([date, count]) => ({
    date: date.slice(8, 10),
    count,
  }));

  const weekendChartData = [
    { name: "Weekend", value: weekendMatches },
    { name: "Weekday", value: weekdayMatches },
  ];

  return (
    <main className="max-w-5xl mx-auto px-5 py-12 space-y-16">

      <header>
        <h1 className="text-3xl md:text-4xl font-bold">
          London Football Fixtures – {displayMonth}
        </h1>
        <p className="text-muted-foreground text-sm">
          Complete match schedule and monthly distribution analysis
        </p>
      </header>

      {/* SUMMARY */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Fixtures" value={totalMatches} />
        <SummaryCard
          title="Busiest Matchday"
          value={busiestDay ? busiestDay[1] : 0}
          subtitle={
            busiestDay ? formatFullDate(busiestDay[0]) : "N/A"
          }

        />
        <SummaryCard
          title="Weekend Share"
          value={`${weekendShare}%`}
        />
      </section>

      {/* DAILY VOLUME */}
      <section>
        <DailyVolumeChart data={chartData} />
      </section>

      {/* WEEKEND SPLIT */}
      <section>
        <WeekendSplitChart data={weekendChartData} />
      </section>

      <section className="text-sm text-muted-foreground leading-relaxed">
        <p>
          In <strong>{displayMonth}</strong>, London hosts{" "}
          <strong>{totalMatches}</strong> professional football fixtures
          across multiple competitions. The busiest matchday falls on{" "}
          <strong>
            {busiestDay ? formatFullDate(busiestDay[0]) : "N/A"}
          </strong>, with strong weekend concentration representing{" "}
          <strong>{weekendShare}%</strong> of the monthly schedule.
        </p>
      </section>

      {/* LEAGUE DISTRIBUTION */}
      {leagueChartData.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            League Distribution – {displayMonth}
          </h2>
          <SportDistributionChart data={leagueChartData} />
        </section>
      )}

      {/* TOP CLUBS */}
      {topClubs.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Most Active London Clubs – {displayMonth}
          </h2>
          <ul className="space-y-2">
            {topClubs.map(([club, count]) => (
              <li key={club} className="flex justify-between border-b py-2">
                <span>{club}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* STADIUMS */}
      {stadiumDistribution.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Top Stadium Utilisation
          </h2>
          <ul className="space-y-2">
            {stadiumDistribution.map(([venue, count]) => (
              <li key={venue} className="flex justify-between border-b py-2">
                <span>{venue}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* DAILY INDEX */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Daily Fixture Index
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          {sortedEntries.map(([date, count]) => (
            <li key={date}>
              <Link href={`/uk/london/football/${date}`} className="underline">
                {formatFullDate(date)} – {count}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* MONTH NAVIGATION */}
      <section className="pt-8 border-t">
        <h2 className="text-lg font-semibold mb-4">
          Browse Nearby Months
        </h2>

        <div className="flex flex-wrap gap-3 text-sm">
          {monthRange.map(({ year: y, month: m }) => {
            const label = formatMonthDisplay(String(y), m);

            const isCurrent =
              Number(y) === Number(year) && m === month;

            return (
              <Link
                key={`${y}-${m}`}
                href={`/uk/london/football/month/${y}/${m}`}
                className={`px-4 py-2 rounded-lg border ${
                  isCurrent
                    ? "bg-black text-white border-black"
                    : "hover:bg-gray-100"
                }`}
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
