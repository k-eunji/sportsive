// src/app/reports/ReportsDashboard.tsx

"use client";

import { useMemo, useState } from "react";
import DailyVolumeChart from "@/app/components/DailyVolumeChart";
import WeekendSplitChart from "@/app/components/WeekendSplitChart";
import SportDistributionChart from "@/app/components/SportDistributionChart";
import { useEffect } from "react";
import { getClientId } from "@/lib/clientId";

function formatMonthDisplay(year: string, month: string) {
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
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

export default function ReportsDashboard({ events }: { events: any[] }) {
  const [region, setRegion] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [sport, setSport] = useState<string>("all");
  const [year] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );

  const prefix = `${year}-${month}`;
  const displayMonth = formatMonthDisplay(year, month);

  /* =========================
     REGION LIST
  ========================= */

  const regions = useMemo(() => {
    return Array.from(
      new Set(events.map((e) => e.region).filter(Boolean))
    ).sort();
  }, [events]);

  const sports = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map((e) => e.sport?.toLowerCase().trim())
          .filter(Boolean)
      )
    ).sort();
  }, [events]);

  /* =========================
     CITY LIST (region 기반)
  ========================= */

  const cities = useMemo(() => {
    if (!region) return [];

    return Array.from(
      new Set(
        events
          .filter((e) => e.region === region)
          .map((e) => e.city)
          .filter(Boolean)
      )
    ).sort();
  }, [events, region]);

  /* =========================
     FILTER EVENTS
  ========================= */

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const eventMonth =
        (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

      return (
        (!region || e.region === region) &&
        (!city || e.city === city) &&
        (sport === "all" ||
          e.sport?.toLowerCase() === sport) &&

        eventMonth === prefix
      );
    });
  }, [events, region, city, sport, prefix]);

  const totalMatches = filtered.length;

  /* =========================
    WEEKEND SHARE
  ========================= */

  const weekendCount = filtered.filter((e) => {
    const d = new Date(
      (e.startDate ?? e.date ?? e.utcDate)
    );
    const day = d.getDay();
    return day === 0 || day === 6;
  }).length;

  const weekendShare =
    totalMatches > 0
      ? Math.round((weekendCount / totalMatches) * 100)
      : 0;


  /* =========================
    REPORT VIEW LOG
  ========================= */

  useEffect(() => {
    const clientId = getClientId();
    if (!clientId) return;

    fetch("/api/log/report-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        region,
        city,
        sport,
        year,
        month,
      }),
    }).catch(() => {});
  }, [region, city, sport, year, month]);


  /* =========================
     GROUP BY DATE
  ========================= */

  const groupedByDate: Record<string, number> = {};

  filtered.forEach((event) => {
    const fullDate =
      (event.startDate ?? event.date ?? event.utcDate)?.slice(0, 10);
    if (!fullDate) return;
    groupedByDate[fullDate] =
      (groupedByDate[fullDate] || 0) + 1;
  });

  const sortedEntries = Object.entries(groupedByDate).sort();

  const chartData = sortedEntries.map(([date, count]) => {
    const share =
      totalMatches > 0
        ? Math.round((count / totalMatches) * 100)
        : 0;

    return {
      date: date.slice(8, 10),
      count,
      percentage: share,
    };
  });

  const distributionData = (() => {
    const entries = Object.entries(
      filtered.reduce<Record<string, number>>((acc, e: any) => {
        const key =
          sport === "all"
            ? e.sport
            : sport === "horse racing"
              ? e.payload?.course || "Unknown Course"
              : e.league || e.competition || "Other";

        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]);

    const TOP_N = 6;
    const top = entries.slice(0, TOP_N);
    const rest = entries.slice(TOP_N);
    const otherTotal = rest.reduce((sum, [, count]) => sum + count, 0);

    const weekendData = [
      {
        name: "Weekend",
        value: weekendCount,
        percentage: weekendShare,
      },
      {
        name: "Weekday",
        value: totalMatches - weekendCount,
        percentage: 100 - weekendShare,
      },
    ];


    const finalData = [
      ...top,
      ...(otherTotal > 0
        ? [["Other", otherTotal] as [string, number]]
        : []),
    ];

    return finalData.map(([label, count]) => {
      const share =
        totalMatches > 0
          ? Math.round((count / totalMatches) * 100)
          : 0;

      return {
        sport: label,
        count,
        percentage: share,
      };
    });

  })();


  return (
    <main className="max-w-5xl mx-auto px-5 py-12 space-y-12">

      {/* FILTER BAR */}
      <section className="flex gap-4 flex-wrap">

        {/* REGION */}
        <select
          value={region ?? ""}
          onChange={(e) => {
            setRegion(e.target.value || null);
            setCity(null);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* CITY */}
        <select
          value={city ?? ""}
          onChange={(e) =>
            setCity(e.target.value || null)
          }
          className="border px-3 py-2 rounded"
          disabled={!region}
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* SPORT */}
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All Sports</option>
            {sports.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
        </select>

        {/* MONTH */}
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const m = String(i + 1).padStart(2, "0");
            return (
              <option key={m} value={m}>
                {m}
              </option>
            );
          })}
        </select>
      </section>

      {/* HEADER */}
      <header>
        <h1>
          {sport === "all" ? "Sports Fixtures" : `${sport} Fixtures`} 
          in {city ?? region ?? "the UK"} — {displayMonth}
        </h1>

        <p className="text-muted-foreground text-sm">
          Complete match schedule and monthly distribution analysis
        </p>
      </header>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Fixtures" value={totalMatches} />
        <SummaryCard
          title="Active Days"
          value={sortedEntries.length}
        />
        <SummaryCard
          title="Avg per Active Day"
          value={
            sortedEntries.length > 0
              ? (totalMatches / sortedEntries.length).toFixed(1)
              : 0
          }
        />
      </section>

      {/* DAILY VOLUME */}
      <section>
        <DailyVolumeChart data={chartData} />
      </section>

      {/* WEEKEND SPLIT */}
      <section>
        <WeekendSplitChart
          data={[
            {
              name: "Weekend",
              value: weekendCount,
              percentage: weekendShare,
            },
            {
              name: "Weekday",
              value: totalMatches - weekendCount,
              percentage: 100 - weekendShare,
            },
          ]}
        />


        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          In <strong>{displayMonth}</strong>,{" "}
          <strong>{region ?? "selected regions"}</strong>{" "}
          hosted <strong>{totalMatches}</strong>{" "}
          {sport === "all" ? "professional fixtures" : `${sport} fixtures`}.{" "}
          <strong>{weekendCount}</strong> (
          <strong>{weekendShare}%</strong>) were played on weekends.
        </p>

      </section>

      {/* DISTRIBUTION */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          {sport === "all"
            ? "Distribution by Sport"
            : sport === "horse racing"
              ? "Distribution by Course"
              : "Distribution by Competition"}
        </h2>

        <SportDistributionChart data={distributionData} />

      </section>

      {sport !== "all" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {sport === "horse racing"
              ? "Top Racecourses"
              : "Top Competitions"}
          </h2>

          <ul className="space-y-2">
            {Object.entries(
              filtered.reduce<Record<string, number>>((acc, e: any) => {
                const key =
                  sport === "horse racing"
                    ? e.payload?.course || "Unknown Course"
                    : e.league || e.competition || "Other";

                if (!key) return acc;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([label, count]) => {
                const share =
                  totalMatches > 0
                    ? Math.round((count / totalMatches) * 100)
                    : 0;

                return (
                  <li
                    key={label}
                    className="flex justify-between border-b py-2"
                  >
                    <span>{label}</span>
                    <span className="font-semibold">
                      {count} ({share}%)
                    </span>
                  </li>
                );
              })}

          </ul>
        </section>    
      )}

      {sport !== "all" && sport !== "horse racing" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Top Stadium Utilisation
          </h2>

          <ul className="space-y-2">
            {Object.entries(
              filtered.reduce<
                Record<string, { count: number; homeTeams: Set<string> }>
              >((acc, e: any) => {
                const venue = e.venue;
                if (!venue) return acc;

                const homeTeam =
                  e.homeTeam ||
                  e.home_team ||
                  e.teams?.home ||
                  null;

                if (!acc[venue]) {
                  acc[venue] = {
                    count: 0,
                    homeTeams: new Set(),
                  };
                }

                acc[venue].count += 1;

                if (homeTeam) {
                  acc[venue].homeTeams.add(homeTeam);
                }

                return acc;
              }, {})
            )
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 8)
              .map(([venue, data]) => (
                <li
                  key={venue}
                  className="flex justify-between border-b py-2"
                >
                  <span>
                    {venue}
                    {data.homeTeams.size > 0 && (
                      <span className="text-sm text-gray-500 ml-2">
                        (
                        {[...data.homeTeams].join(", ")}
                        )
                      </span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {data.count} (
                    {totalMatches > 0
                      ? Math.round((data.count / totalMatches) * 100)
                      : 0}
                    %)
                  </span>

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
            <li key={date} className="flex justify-between border-b py-2">
              <span>{date}</span>
              <span className="font-semibold">{count}</span>
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}