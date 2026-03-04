// src/app/sport/_components/FootballSportPage.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { SportMonthDaysToggle } from "@/app/components/SportMonthDaysToggle";

export default function FootballSportPage({
  events,
  selectedMonth,
}: {
  events: any[];
  selectedMonth: string | null;
}) {

  const router = useRouter();
  const rawSearchParams = useSearchParams();
  const searchParams = rawSearchParams ?? new URLSearchParams();

  const competition = rawSearchParams?.get("competition") ?? "";

  const competitions = useMemo(() => {
    return Array.from(
      new Set(events.map((e) => e.competition).filter(Boolean))
    ).sort();
  }, [events]);

  const filteredEvents = competition
    ? events.filter((e) => e.competition === competition)
    : events;
  
  const totalFixtures = filteredEvents.length;  

  /* =========================
     LEAGUE & VENUE COUNTS
  ========================= */

  const monthMap: Record<string, any[]> = {};

  filteredEvents.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    const month = raw.slice(0, 7);

    if (!monthMap[month]) monthMap[month] = [];
    monthMap[month].push(e);
  });

  const sortedMonths = Object.keys(monthMap).sort();
  const leagueCounts: Record<string, number> = {};
  const venueCounts: Record<string, number> = {};
  const hourCounts: Record<string, number> = {};
  

  filteredEvents.forEach((e: any) => {
    if (e.competition) {
      leagueCounts[e.competition] =
        (leagueCounts[e.competition] || 0) + 1;
    }

    if (e.venue) {
      venueCounts[e.venue] =
        (venueCounts[e.venue] || 0) + 1;
    }

    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const hour = d.getHours().toString().padStart(2, "0");
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    }
  });

  /* =========================
     DERIVED METRICS
  ========================= */

  const uniqueVenues = Object.keys(venueCounts).length;

  const avgPerVenue =
    uniqueVenues > 0
      ? (totalFixtures / uniqueVenues).toFixed(1)
      : "0";

  const weekendCount = filteredEvents.filter((e: any) => {
    const d = new Date(e.startDate ?? e.date ?? e.utcDate);
    const day = d.getDay();
    return day === 0 || day === 6;
  }).length;

  const weekendShare =
    totalFixtures > 0
      ? Math.round((weekendCount / totalFixtures) * 100)
      : 0;

  /* ===== 정렬 ===== */

  const venueDensity =
    uniqueVenues > 0 ? totalFixtures / uniqueVenues : 0;

  const venueInsight =
    venueDensity > 5
      ? "High stadium reuse"
      : venueDensity > 2
      ? "Moderate venue rotation"
      : "Highly distributed schedule";

  const weekendInsight =
    weekendShare > 65
      ? "Strong weekend concentration"
      : weekendShare > 50
      ? "Balanced weekend structure"
      : "Midweek-heavy pattern";

  const volumeInsight =
    totalFixtures > 150
      ? "High fixture density"
      : totalFixtures > 80
      ? "Moderate volume"
      : "Low schedule volume";

  // 🔥 League는 제한 없음
  const sortedLeagues = Object.entries(leagueCounts)
    .sort((a, b) => b[1] - a[1]);

  // 🔥 Stadium은 상위 5개만
  const sortedVenues = Object.entries(venueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topLeagueCount = sortedLeagues[0]?.[1] ?? 0;

  const leagueShare =
    totalFixtures > 0
      ? Math.round((topLeagueCount / totalFixtures) * 100)
      : 0;

  const peakHourEntry =
    Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0] ?? null;

  let monthEvents: any[] = [];
  let monthActiveDays = 0;
  let monthAvg = "0";
  let peakDayInMonth: [string, number] | null = null;

  if (selectedMonth) {
    monthEvents = monthMap[selectedMonth] ?? [];

    const monthDayMap: Record<string, number> = {};
    const daySet = new Set<string>();

    monthEvents.forEach((e: any) => {
      const raw = e.startDate ?? e.date ?? e.utcDate;
      if (!raw) return;

      const day = raw.slice(0, 10);
      daySet.add(day);
      monthDayMap[day] = (monthDayMap[day] || 0) + 1;
    });

    monthActiveDays = daySet.size;

    monthAvg =
      monthActiveDays > 0
        ? (monthEvents.length / monthActiveDays).toFixed(1)
        : "0";

    peakDayInMonth =
      Object.entries(monthDayMap)
        .sort((a, b) => b[1] - a[1])[0] ?? null;
  }    

  const monthDensity =
    monthActiveDays > 0
      ? monthEvents.length / monthActiveDays
      : 0;

  const monthDensityInsight =
    monthDensity > 3
      ? "Highly concentrated matchdays"
      : monthDensity > 1.5
      ? "Moderate daily load"
      : "Light daily spread";

  const activityInsight =
    monthActiveDays > 20
      ? "Matches spread across most days"
      : monthActiveDays > 10
      ? "Clustered activity"
      : "Limited active days";

  // ===== STRUCTURAL SIGNALS =====

  // 캘린더 분산 정도 (활성 일수 비율)
  const spreadPercent =
    monthActiveDays > 0
      ? Math.round((monthActiveDays / 30) * 100)
      : 0;

  // 경기 밀집도 (일 평균 기준)
  const clusterPercent =
    monthDensity > 0
      ? Math.round((monthDensity / 10) * 100)
      : 0;

  // 경기장 집중도
  const venuePercent =
    venueDensity > 0
      ? Math.round((venueDensity / 10) * 100)
      : 0;    

  /* =========================
     SUMMARY
  ========================= */

  const summary = `
  Across the next 180 days, football schedules ${totalFixtures} fixtures.

  ${weekendCount} matches (${weekendShare}%) take place at weekends.

  The busiest competition accounts for ${topLeagueCount} fixtures (${leagueShare}% of total).

  Peak kickoff hour is ${peakHourEntry?.[0] ?? "--"}:00 
  with ${peakHourEntry?.[1] ?? 0} fixtures.

  Fixtures are distributed across ${uniqueVenues} stadiums,
  averaging ${avgPerVenue} matches per venue.
  `.trim();
  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-12">

      {/* EXECUTIVE SUMMARY */}
      <section className="rounded-2xl bg-muted/40 p-8">
        <h2 className="text-lg font-semibold mb-4">
          Structural Summary
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </section>

      {/* KEY METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Metric
          title="Fixture Volume"
          value={totalFixtures}
          hint={volumeInsight}
        />
        <Metric
          title="Weekend Bias"
          value={`${weekendShare}%`}
          hint={weekendInsight}
        />
        <Metric
          title="Venue Concentration"
          value={venueDensity.toFixed(1)}
          hint={venueInsight}
        />
        <Metric
          title="Active Stadiums"
          value={uniqueVenues}
          hint="Unique venues in use"
        />
      </section>
      {selectedMonth && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Metric
            title="Active Days"
            value={monthActiveDays}
            hint={activityInsight}
          />
          <Metric
            title="Daily Density"
            value={monthDensity.toFixed(1)}
            hint={monthDensityInsight}
          />
          <Metric
            title="Peak Day"
            value={peakDayInMonth ? peakDayInMonth[0] : "-"}
            hint="Highest fixture concentration"
          />
        </section>
      )}

      {/* STRUCTURAL SIGNALS */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">
          Structural Signals
        </h3>

        <div className="flex flex-wrap gap-2">
          {spreadPercent < 40 && (
            <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
              Low Calendar Density
            </span>
          )}

          {clusterPercent > 60 && (
            <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
              High Temporal Clustering
            </span>
          )}

          {venuePercent < 30 && (
            <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
              Distributed Venues
            </span>
          )}

          {venuePercent > 70 && (
            <span className="text-xs px-3 py-1 rounded-full border">
              Venue Concentration
            </span>
          )}
        </div>
      </section>

      {/* LEAGUE DISTRIBUTION (전체 표시) */}
      {sortedLeagues.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-6">
            League Distribution
          </h2>

          <ul className="space-y-3 text-sm">
            {sortedLeagues.map(([league, count]) => {

              const params = new URLSearchParams(searchParams.toString());
              params.set("competition", league);

              return (
                <a
                  key={league}
                  href={`?${params.toString()}`}
                  className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-muted/40 transition cursor-pointer"
                >
                  <span>{league}</span>

                  <span className="font-semibold flex items-center gap-2">
                    {count} ({Math.round((count / totalFixtures) * 100)}%)
                    <span className="text-base opacity-60">›</span>
                  </span>
                </a>
              );
            })}
          </ul>
        </section>
      )}

      {/* STADIUM UTILISATION (Top 5만 표시 + %) */}
      {sortedVenues.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-6">
            Stadium Utilisation (Top 5)
          </h2>

          <ul className="space-y-3 text-sm">
            {sortedVenues.map(([venue, count]) => (
              <li
                key={venue}
                className="flex justify-between py-2"
              >
                <span>{venue}</span>
                <span className="font-semibold">
                  {count} (
                  {Math.round((count / totalFixtures) * 100)}%)
                </span>
              </li>
            ))}
          </ul>

          {uniqueVenues > 5 && (
            <p className="text-xs text-muted-foreground mt-3">
              Showing top 5 of {uniqueVenues} active stadiums.
            </p>
          )}
        </section>
      )}

      {/* KICKOFF TIME ANALYSIS */}
      {peakHourEntry && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Kickoff Time Analysis
          </h2>

          <p className="text-sm text-muted-foreground">
            The most common kickoff hour is{" "}
            <strong>{peakHourEntry[0]}:00</strong>,
            accounting for{" "}
            <strong>
              {peakHourEntry[1]} fixtures (
              {Math.round(
                (peakHourEntry[1] / totalFixtures) * 100
              )}%)
            </strong>{" "}
            of the schedule.
          </p>
        </section>
      )}

      {/* MONTHLY DISTRIBUTION */}
      {!selectedMonth && (
        <section className="space-y-6 pt-6 border-t">
          <h3 className="text-xl font-semibold tracking-tight">
            Monthly Distribution
          </h3>

          <div className="space-y-3">
            {sortedMonths.map((monthKey) => {

              const params = new URLSearchParams(searchParams.toString());
              params.set("month", monthKey);

              const monthEvents = monthMap[monthKey];

              const monthName = new Date(`${monthKey}-01`)
                .toLocaleString("en-GB", {
                  month: "long",
                  year: "numeric",
                });

              return (
                <a
                  key={monthKey}
                  href={`?${params.toString()}`}
                  className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-muted/40 transition cursor-pointer"
                >
                  <div className="text-sm font-medium">
                    {monthName}
                  </div>

                  <span className="flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
                    {monthEvents.length} fixtures
                    <span className="text-base opacity-60">›</span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {selectedMonth && (
        <>
          <section className="pt-8">
            <h3 className="text-lg font-semibold mb-4">
              {selectedMonth} — Daily Breakdown
            </h3>

            <SportMonthDaysToggle
              monthlyEvents={monthEvents}
              totalMonth={monthEvents.length}
              sportSlug="football"
              mode={competition ? "toggle" : "link"}
            />
          </section>
        </>
      )}
    </div>
    
  );
}

/* =========================
   METRIC COMPONENT
========================= */

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
    <div className="rounded-2xl bg-muted/40 p-6 flex flex-col gap-2 min-h-[140px]">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="text-3xl font-semibold tracking-tight">
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