// src/app/sport/_components/GenericSportPage.tsx

"use client";

import { useMemo } from "react";
import { SportMonthDaysToggle } from "@/app/components/SportMonthDaysToggle";

export default function GenericSportPage({
  slug,
  events,
  selectedMonth,
}: {
  slug: string;
  events: any[];
  selectedMonth: string | null;
}) {
  const total = events.length;

  /* =========================
     GLOBAL GROUPING + INTELLIGENCE
  ========================= */

  const {
    monthMap,
    activeDays,
    peakMonth,
    peakDayGlobal,
    activitySpread,
    topVenueShare,
    topCityShare,
    temporalClusterShare,
    topVenueCount,
    topCityCount,
    topTwoMonthCount,
  } = useMemo(() => {
    const monthMap: Record<string, any[]> = {};
    const dayMap: Record<string, number> = {};
    const cityCount: Record<string, number> = {};
    const venueCount: Record<string, number> = {};
    const activeDays = new Set<string>();

    events.forEach((e: any) => {
      const raw = e.startDate ?? e.date ?? e.utcDate;
      if (!raw) return;

      const day = raw.slice(0, 10);
      const month = raw.slice(0, 7);

      activeDays.add(day);

      if (!monthMap[month]) monthMap[month] = [];
      monthMap[month].push(e);

      dayMap[day] = (dayMap[day] || 0) + 1;

      if (e.city)
        cityCount[e.city] = (cityCount[e.city] || 0) + 1;

      if (e.venue)
        venueCount[e.venue] = (venueCount[e.venue] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthMap).sort();

    const peakMonth =
      sortedMonths.length > 0
        ? sortedMonths
            .map((m) => [m, monthMap[m]] as const)
            .sort((a, b) => b[1].length - a[1].length)[0]
        : null;

    const peakDayGlobal =
      Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0] ?? null;

    /* =========================
       INTELLIGENCE CALCULATIONS
    ========================= */

    const calendarSpan = 180; // 현재 180d fetch 기준
    const activitySpread =
      calendarSpan > 0
        ? ((activeDays.size / calendarSpan) * 100).toFixed(1)
        : "0";

    const topVenue =
      Object.values(venueCount).sort((a, b) => b - a)[0] ?? 0;

    const topVenueShare =
      total > 0
        ? ((topVenue / total) * 100).toFixed(1)
        : "0";

    const topCity =
      Object.values(cityCount).sort((a, b) => b - a)[0] ?? 0;

    const topCityShare =
      total > 0
        ? ((topCity / total) * 100).toFixed(1)
        : "0";

    // Temporal clustering: 상위 2개월이 차지하는 비율
    const monthCounts = Object.values(monthMap)
      .map((arr) => arr.length)
      .sort((a, b) => b - a);

    const topTwoMonths =
      (monthCounts[0] ?? 0) + (monthCounts[1] ?? 0);

    const temporalClusterShare =
      total > 0
        ? ((topTwoMonths / total) * 100).toFixed(1)
        : "0";

    return {
      monthMap,
      activeDays,
      peakMonth,
      peakDayGlobal,
      activitySpread,
      topVenueShare,
      topCityShare,
      temporalClusterShare,
      topVenueCount: topVenue,
      topCityCount: topCity,
      topTwoMonthCount: topTwoMonths,
    };
  }, [events]);

  const sortedMonths = Object.keys(monthMap).sort();

  const avgPerActiveDay =
    activeDays.size > 0
      ? (total / activeDays.size).toFixed(1)
      : "0";

  const activeDaysCount = activeDays.size;
  const spreadPercent = parseFloat(activitySpread);
  const venuePercent = parseFloat(topVenueShare);
  const cityPercent = parseFloat(topCityShare);
  const clusterPercent = parseFloat(temporalClusterShare);

  let interpretation = "";

  if (spreadPercent < 15) {
    interpretation += `This sport runs on relatively few calendar days (${activeDaysCount} of 180). `;
  } else if (spreadPercent < 40) {
    interpretation += `This sport shows moderate calendar activity. `;
  } else {
    interpretation += `This sport runs consistently across the calendar. `;
  }

  if (clusterPercent > 50) {
    interpretation += `More than half of fixtures are concentrated within two peak months. `;
  }

  if (venuePercent > 40) {
    interpretation += `A single venue dominates the schedule. `;
  } else if (venuePercent < 15) {
    interpretation += `Fixtures are distributed across multiple venues. `;
  }

  if (cityPercent > 40) {
    interpretation += `Activity is heavily concentrated in one city.`;
  }   
  /* =========================
     MONTH-SPECIFIC CALCULATION
  ========================= */

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
      Object.entries(monthDayMap).sort(
        (a, b) => b[1] - a[1]
      )[0] ?? null;
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <>
      {!selectedMonth && (
        <>

          {/* EXECUTIVE SUMMARY */}
          <section className="rounded-2xl bg-gradient-to-br from-muted/40 to-muted/10 p-8">
            <h3 className="text-lg font-semibold">
              Executive Summary
            </h3>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {interpretation}
            </p>

            <p className="text-xs text-muted-foreground">
              Data window: next 180 days · {total} total fixtures analysed
            </p>
          </section>

          {/* STRUCTURAL SIGNALS */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">
              Structural Signals
            </h3>

            <div className="flex flex-wrap gap-2">
              {spreadPercent < 15 && (
                <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  Low Calendar Density
                </span>
              )}

              {clusterPercent > 50 && (
                <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  High Temporal Clustering
                </span>
              )}

              {venuePercent < 15 && (
                <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  Distributed Venues
                </span>
              )}

              {venuePercent > 40 && (
                <span className="text-xs px-3 py-1 rounded-full border">
                  Venue Concentration
                </span>
              )}
            </div>
          </section>

          {/* SNAPSHOT */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center p-6">
            <Metric title="Total Fixtures" value={total} />
            <Metric title="Active Days" value={activeDays.size} />
            <Metric title="Avg / Active Day" value={avgPerActiveDay} />
            <Metric
              title="Peak Month"
              value={peakMonth ? peakMonth[0] : "-"}
            />
          </section>

          {/* INTELLIGENCE PROFILE */}
          <section className="rounded-2xl p-6 space-y-6 bg-background shadow-sm">
            <h3 className="font-semibold">
              Structural Profile
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <Metric
                title="Active Days"
                value={`${activeDays.size} / 180 days (${activitySpread}%)`}
                explanation={`Fixtures were played on ${activeDays.size} of the last 180 days.`}
              />

              <Metric
                title="Busiest Venue"
                value={`${topVenueCount} fixtures (${topVenueShare}%)`}
                explanation={`The single most used venue hosted ${topVenueCount} of ${total} fixtures.`}
              />

              <Metric
                title="Busiest City"
                value={`${topCityCount} fixtures (${topCityShare}%)`}
                explanation={`The most active city accounts for ${topCityCount} of ${total} fixtures.`}
              />

              <Metric
                title="Top 2 Months"
                value={`${topTwoMonthCount} fixtures (${temporalClusterShare}%)`}
                explanation={`${topTwoMonthCount} of ${total} fixtures occurred within the two busiest months.`}
              />
            </div>

            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground leading-relaxed">
              {interpretation}
            </div>
          </section>

          {/* MONTHLY DISTRIBUTION */}
          <section className="space-y-6 pt-6 border-t">
            <h3 className="text-xl font-semibold tracking-tight">
              Monthly Distribution
            </h3>

            <div className="space-y-3">
              {sortedMonths.map((monthKey) => {
                const monthEvents = monthMap[monthKey];
                if (!monthEvents) return null;

                const monthName = new Date(`${monthKey}-01`)
                  .toLocaleString("en-GB", {
                    month: "long",
                    year: "numeric",
                  });

                return (
                  <a
                    key={monthKey}
                    href={`?month=${monthKey}`}
                    className="flex justify-between items-center px-4 py-3 rounded-lg hover:bg-muted/40 transition cursor-pointer"
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
        </>
      )}

      {selectedMonth && (
        <>
          {/* MONTH SNAPSHOT */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center p-6">
            <Metric
              title="Month Fixtures"
              value={monthEvents.length}
            />
            <Metric
              title="Active Days"
              value={monthActiveDays}
            />
            <Metric
              title="Avg / Active Day"
              value={monthAvg}
            />
            <Metric
              title="Peak Day"
              value={
                peakDayInMonth
                  ? peakDayInMonth[0]
                  : "-"
              }
            />
          </section>

          {/* DAILY BREAKDOWN */}
          <section className="pt-8">
            <h3 className="text-lg font-semibold mb-4">
              {selectedMonth} — Daily Breakdown
            </h3>

            <SportMonthDaysToggle
              monthlyEvents={monthEvents}
              totalMonth={monthEvents.length}
              sportSlug={slug}
            />
          </section>
        </>
      )}
    </>
  );
}

function Metric({
  title,
  value,
  explanation,
}: {
  title: string;
  value: any;
  explanation?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </p>

      <p className="text-2xl font-semibold">
        {value}
      </p>

      {explanation && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {explanation}
        </p>
      )}
    </div>
  );
}