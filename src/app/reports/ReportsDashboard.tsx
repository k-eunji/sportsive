// src/app/reports/ReportsDashboard.tsx

"use client";

import { useMemo, useState } from "react";
import DailyVolumeChart from "@/app/components/DailyVolumeChart";
import WeekendSplitChart from "@/app/components/WeekendSplitChart";
import SportDistributionChart from "@/app/components/SportDistributionChart";
import { useEffect } from "react";
import { getClientId } from "@/lib/clientId";
import Link from "next/link";

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

export default function ReportsDashboard({
  events,
  initialRegion,
  initialCity,
  initialSport,
  initialYear,
  initialMonth,
  countryScope,
}: {
  events: any[];
  initialRegion?: string | null;
  initialCity?: string | null;
  initialSport?: string;
  initialYear?: string;
  initialMonth?: string;
  countryScope?: "uk" | "ireland" | null;
}) {
  const now = new Date();

  const [country, setCountry] = useState<"uk" | "ireland" | "all">(
    countryScope ?? "all"
  );

  const [region, setRegion] = useState<string | null>(
    initialRegion ?? null
  );

  const [city, setCity] = useState<string | null>(
    initialCity ?? null
  );

  const [sport, setSport] = useState<string>(
    initialSport ?? "all"
  );

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    if (initialYear && initialMonth) {
      return `${initialYear}-${initialMonth}`;
    }

    const now = new Date();
    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  const prefix = selectedMonth;

  const [year, month] = selectedMonth.split("-");
  
  const displayMonth = formatMonthDisplay(year, month);
  const normalize = (v?: string) =>
    v?.toLowerCase().trim() ?? "";

  const UK_SET = new Set([
    "england",
    "scotland",
    "wales",
    "northern ireland",
  ]);
  
  const availableMonths = useMemo(() => {
    const months = Array.from(
      new Set(
        events
          .filter((e) => {
            const eventMonth =
              (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

            const regionLower = normalize(e.region);

            const isInScope =
              country === "uk"
                ? UK_SET.has(regionLower)
                : country === "ireland"
                ? regionLower === "ireland"
                : true;

            return (
              isInScope &&
              (!region ||
                normalize(e.region) === normalize(region)) &&
              (!city || e.city === city) &&
              (sport === "all" ||
                e.sport?.toLowerCase() === sport)
            );
          })
          .map((e) =>
            (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7)
          )
          .filter(Boolean)
      )
    ).sort();

    const now = new Date();
    const min = new Date(now);
    min.setMonth(min.getMonth() - 12);

    const max = new Date(now);
    max.setMonth(max.getMonth() + 12);

    return months.filter((m) => {
      const [y, mo] = m.split("-");
      const d = new Date(Number(y), Number(mo) - 1);
      return d >= min && d <= max;
    });
  }, [events, country, region, city, sport]);
  /* =========================
     REGION LIST
  ========================= */

  const regions = useMemo(() => {
    if (country === "ireland") {
      return ["ireland"];
    }

    if (country === "uk") {
      return Array.from(
        new Set(
          events
            .filter((e) => {
              const eventMonth =
                (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

              return (
                UK_SET.has(normalize(e.region)) &&
                eventMonth === prefix &&
                (sport === "all" ||
                  e.sport?.toLowerCase() === sport)
              );
            })
            .map((e) => e.region)
            .filter(Boolean)
        )
      ).sort();
    }

    return Array.from(
      new Set(
        events
          .filter((e) => {
            const eventMonth =
              (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

            return (
              eventMonth === prefix &&
              (sport === "all" ||
                e.sport?.toLowerCase() === sport)
            );
          })
          .map((e) => e.region)
          .filter(Boolean)
      )
    ).sort();
  }, [events, country, sport, prefix]);

  const sports = useMemo(() => {
    return Array.from(
      new Set(
        events
          .filter((e) => {
            const eventMonth =
              (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

            const regionLower = normalize(e.region);

            const isInScope =
              country === "uk"
                ? UK_SET.has(regionLower)
                : country === "ireland"
                ? regionLower === "ireland"
                : true;

            return (
              isInScope &&
              eventMonth === prefix &&
              (!region ||
                normalize(e.region) === normalize(region)) &&
              (!city || e.city === city)
            );
          })
          .map((e) => e.sport?.toLowerCase().trim())
          .filter(Boolean)
      )
    ).sort();
  }, [events, country, region, city, prefix]);
  

  /* =========================
     CITY LIST (region 기반)
  ========================= */

  const cities = useMemo(() => {
    if (!region) return [];

    return Array.from(
      new Set(
        events
          .filter((e) => {
            const eventMonth =
              (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

            return (
              normalize(e.region) === normalize(region) &&
              eventMonth === prefix &&
              (sport === "all" ||
                e.sport?.toLowerCase() === sport)
            );
          })
          .map((e) => e.city)
          .filter(Boolean)
      )
    ).sort();
  }, [events, region, sport, prefix]);
  /* =========================
     FILTER EVENTS
  ========================= */

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const eventMonth =
        (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

      const regionLower = normalize(e.region);

      // 🔥 UK 정의
      const isInScope =
        country === "uk"
          ? UK_SET.has(regionLower)
          : country === "ireland"
          ? regionLower === "ireland"
          : true;

      return (
        isInScope &&
        (!region ||
          normalize(e.region) === normalize(region)) &&
        (!city || e.city === city) &&
        (sport === "all" ||
          e.sport?.toLowerCase() === sport) &&
        eventMonth === prefix
      );
    });
  }, [events, region, city, sport, prefix, country]);

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
    setRegion(null);
    setCity(null);
  }, [countryScope]);  

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
            : sport === "horse-racing"
            ? e.payload?.course || "Unknown Course"
            : sport === "football" || sport === "basketball"
            ? e.league || e.competition || "Other"
            : e.sport;
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]);

    const TOP_N = 6;
    const top = entries.slice(0, TOP_N);
    const rest = entries.slice(TOP_N);
    const otherTotal = rest.reduce((sum, [, count]) => sum + count, 0);

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

  const busiestDay =
    [...sortedEntries].sort((a, b) => b[1] - a[1])[0] || null;
  
  const cityRanking = Object.entries(
    filtered.reduce<Record<string, number>>((acc, e: any) => {
      if (!e.city) return acc;
      acc[e.city] = (acc[e.city] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const showBusiestCity =
    sport === "all" &&
    !city;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">

      <Link
        href="/"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Back to fixture explorer
      </Link>

      {/* FILTER BAR */}
      <section className="flex flex-wrap gap-2 py-1 border-b border-zinc-200">

        {/* COUNTRY */}
        <select
          value={country}
          onChange={(e) => {
            const value = e.target.value as "uk" | "ireland" | "all";
            setCountry(value);

            if (value === "ireland") {
              setRegion("ireland");   // ✅ 자동 선택
            } else {
              setRegion(null);
            }

            setCity(null);
          }}
          className="
          bg-white
          border border-zinc-200
          rounded-md
          px-3 py-1.5
          text-sm
          text-zinc-700
          hover:border-zinc-300
          focus:outline-none
          focus:ring-1
          focus:ring-zinc-300
          transition
          "
        >
          <option value="all">All Countries</option>
          <option value="uk">United Kingdom</option>
          <option value="ireland">Ireland</option>
        </select>

        {/* REGION */}
        <select
          value={region ?? ""}
          disabled={country === "ireland"}
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
          className="
          bg-white
          border border-zinc-200
          rounded-md
          px-3 py-1.5
          text-sm
          text-zinc-700
          hover:border-zinc-300
          focus:outline-none
          focus:ring-1
          focus:ring-zinc-300
          transition
          "
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
          className="
          bg-white
          border border-zinc-200
          rounded-md
          px-3 py-1.5
          text-sm
          text-zinc-700
          hover:border-zinc-300
          focus:outline-none
          focus:ring-1
          focus:ring-zinc-300
          transition
          "
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
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="
          bg-white
          border border-zinc-200
          rounded-md
          px-3 py-1.5
          text-sm
          text-zinc-700
          hover:border-zinc-300
          focus:outline-none
          focus:ring-1
          focus:ring-zinc-300
          transition
          "
        >
          {availableMonths.map((m) => {
            const [y, mo] = m.split("-");
            return (
              <option key={m} value={m}>
                {formatMonthDisplay(y, mo)}
              </option>
            );
          })}
        </select>
      </section>

      {/* HEADER */}
      <header className="space-y-3">

        <h1 className="text-2xl md:text-2xl font-bold tracking-tight leading-tight">
          {sport === "all"
            ? "Sports Fixture Volume & Distribution"
            : `${sport} Fixture Volume`}
        </h1>

        <p className="text-lg text-muted-foreground">
          {city ??
            region ??
            (country === "uk"
              ? "United Kingdom"
              : country === "ireland"
              ? "Ireland"
              : "All Countries")} — {displayMonth}
        </p>
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

      {/* 🔥 ALL SPORTS MONTH STYLE BLOCK */}
      {sport === "all" && totalMatches > 0 && (
        <section className="rounded-2xl border p-6 bg-background shadow-sm text-sm space-y-3">
          <p>
            In <strong>{displayMonth}</strong>, a total of{" "}
            <strong>{totalMatches}</strong> professional sports fixtures
            were staged across the selected area.
          </p>

          {busiestDay && (
            <p>
              The busiest day was{" "}
              <strong>{busiestDay[0]}</strong> with{" "}
              <strong>{busiestDay[1]}</strong> fixtures.
            </p>
          )}

          <p>
            Weekend fixtures represent{" "}
            <strong>{weekendShare}%</strong> of the schedule.
          </p>
        </section>
      )}

      {/* DAILY VOLUME */}
      <section>
        {totalMatches === 0 ? (
          <p className="text-sm text-muted-foreground">
            No fixtures found for this selection.
          </p>
        ) : (
          <DailyVolumeChart data={chartData} />
        )}
      </section>
      
      {/* WEEKEND SPLIT */}
      <section>
        {totalMatches > 0 && (
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
        )}
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
        {totalMatches > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {sport === "all"
                ? "Distribution by Sport"
                : sport === "horse-racing"
                ? "Distribution by Course"
                : sport === "football" || sport === "basketball"
                ? "Distribution by Competition"
                : "Distribution by Sport"}
            </h2>
            <SportDistributionChart data={distributionData} />

            {sport === "all" && totalMatches > 0 && (
              <section className="text-sm text-muted-foreground leading-relaxed">
                <p>
                  In <strong>{displayMonth}</strong>, a total of{" "}
                  <strong>{totalMatches}</strong> professional sports fixtures
                  were staged across the selected area. The busiest day fell on{" "}
                  <strong>
                    {busiestDay ? busiestDay[0] : "N/A"}
                  </strong>.
                </p>

                {distributionData[0] && (
                  <p className="mt-3">
                    The leading sport during the month was{" "}
                    <strong>{distributionData[0].sport}</strong>, accounting for{" "}
                    <strong>{distributionData[0].percentage}%</strong> of all
                    scheduled fixtures.
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </section>

      {(sport === "football" || sport === "basketball" || sport === "horse-racing") && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {sport === "horse-racing"
              ? "Top Racecourses"
              : "Top Competitions"}
          </h2>

          <ul className="space-y-2">
            {Object.entries(
              filtered.reduce<Record<string, number>>((acc, e: any) => {
                const key =
                  sport === "horse-racing"
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

      {sport !== "all" && sport !== "horse-racing" && (
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

      {showBusiestCity && cityRanking.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Busiest Cities
          </h2>
          <ul className="space-y-2">
            {cityRanking.map(([city, count]) => (
              <li key={city} className="flex justify-between border-b py-2">
                <span>{city}</span>
                <span className="font-semibold">
                  {count} (
                  {totalMatches > 0
                    ? Math.round((count / totalMatches) * 100)
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
        <ul className="space-y-2">

          {sortedEntries.map(([date, count]) => {

            const displayDate = new Date(date).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <li key={date}>
                <Link
                  href={{
                    pathname: `/date/${date}`,
                    query: {
                      ...(country !== "all" && { country }),
                      ...(region && { region }),
                      ...(city && { city }),
                      ...(sport !== "all" && { sport }),
                    },
                  }}
                  className="
                  flex items-center justify-between
                  px-4 py-3
                  rounded-xl
                  border border-gray-200
                  bg-white
                  hover:border-gray-300
                  hover:shadow-sm
                  transition
                  "
                >

                  <span className="font-semibold">
                    {displayDate}
                  </span>

                  <span className="text-sm text-muted-foreground">
                    {count} fixtures →
                  </span>

                </Link>
              </li>
            );

          })}

        </ul>
      </section>

      {/* PLATFORM CTA */}
      <section className="mt-16">
        <div className="rounded-2xl border p-8 bg-white shadow-sm text-center space-y-4">
          <h1 className="text-3xl font-bold">
            UK Fixture Density Dashboard — {displayMonth}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Browse fixtures by city, filter by date range, or discover what’s happening across the UK & Ireland.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-black text-white px-6 py-3 text-sm font-semibold hover:bg-black/90 transition"
          >
            Open full fixture explorer →
          </Link>
        </div>
      </section>

    </div>
  );
}