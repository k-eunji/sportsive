// src/app/date/[date]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEvents } from "@/lib/events/getAllEvents";
import SportDistributionChart from "@/app/components/SportDistributionChart";
import { EventList } from "@/app/components/EventList";
import DateFilterBar from "../components/DateFilterBar";
import { parseEventDate } from "@/lib/eventTime";

function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export default async function DatePage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{
    country?: string;
    region?: string;
    city?: string;
    sport?: string;
  }>;
}) {
  const { date } = await params;

  const todayStr = new Date().toISOString().slice(0, 10);

  const isToday = date === todayStr;
  const isPast = date < todayStr;
  const isFuture = date > todayStr;
  const resolvedSearchParams = await searchParams;

  if (!isValidDate(date)) notFound();

  const normalize = (v?: string) =>
    v?.toLowerCase().trim() ?? "";

  const country = resolvedSearchParams?.country;
  const region = resolvedSearchParams?.region;
  const city = resolvedSearchParams?.city;
  const sport =
    resolvedSearchParams?.sport === "all"
      ? undefined
      : resolvedSearchParams?.sport;
      
  const UK_SET = new Set([
    "england",
    "scotland",
    "wales",
    "northern ireland",
  ]);

  const { events } = await getAllEvents("180d");

  const dateBaseEvents = events.filter((e: any) => {
    const key = (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);
    return key === date;
  });

  const dateEvents = dateBaseEvents.filter((e: any) => {
    const regionLower = normalize(e.region);

    if (country === "uk" && !UK_SET.has(regionLower)) return false;
    if (country === "ireland" && regionLower !== "ireland") return false;
    if (region && regionLower !== normalize(region)) return false;
    if (city && normalize(e.city) !== normalize(city)) return false;
    if (sport && normalize(e.sport) !== normalize(sport)) return false;

    return true;
  });
  let finalEvents = dateEvents;

  // 필터 때문에 결과가 0이면 → all 데이터 사용
  if (dateEvents.length === 0 && dateBaseEvents.length > 0) {
    finalEvents = dateBaseEvents;
  }

  // 진짜 이벤트 없는 날짜면 → 404
  if (finalEvents.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  /* ================= BASIC METRICS ================= */

  const totalEvents = finalEvents.length;

  const uniqueCities = new Set(
    finalEvents.map((e: any) => e.city).filter(Boolean)
  ).size;

  const uniqueVenues = new Set(
    finalEvents.map((e: any) => e.venue).filter(Boolean)
  ).size;

  const density =
    uniqueVenues > 0
      ? (totalEvents / uniqueVenues).toFixed(1)
      : "0";

  /* ================= SPORT DISTRIBUTION ================= */

  const sportCounts: Record<string, number> = {};

  finalEvents.forEach((e: any) => {
    const sport = normalize(e.sport);
    sportCounts[sport] = (sportCounts[sport] || 0) + 1;
  });

  const sportDistribution = Object.entries(sportCounts).map(
    ([sport, count]) => ({
      sport,
      count,
      percentage: Math.round(
        (count / totalEvents) * 100
      ),
    })
  );

  /* ================= REGION DISTRIBUTION ================= */

  const regionCounts: Record<string, number> = {};

  finalEvents.forEach((e: any) => {
    const region = normalize(e.region);
    if (!region) return;
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });

  const regionDistribution = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1]);

  /* ================= CITY RANKING ================= */

  const cityCounts: Record<string, number> = {};

  finalEvents.forEach((e: any) => {
    if (!e.city) return;
    cityCounts[e.city] =
      (cityCounts[e.city] || 0) + 1;
  });

  const busiestCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCityCount = busiestCities[0]?.[1] ?? 0;

  const topCityShare =
    totalEvents > 0
      ? Math.round((maxCityCount / totalEvents) * 100)
      : 0;

  const multipleLeaders =
    busiestCities.filter(([_, count]) => count === maxCityCount).length > 1;  

  /* ================= START TIME DISTRIBUTION ================= */

  const timeCounts: Record<string, number> = {};

  finalEvents.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    const d = parseEventDate(raw);
    if (!d) return;

    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");

    const timeKey = `${hours}:${minutes}`;

    timeCounts[timeKey] = (timeCounts[timeKey] || 0) + 1;
  });

  const timeDistribution = Object.entries(timeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([time, count]) => ({
      time,
      count,
      percentage: Math.round((count / totalEvents) * 100),
    }));

  const peakTime = timeDistribution[0] ?? null;
  /* ================= PREV / NEXT ================= */

  const filteredEventsForDates = dateBaseEvents.filter((e: any) => {
    const regionLower = normalize(e.region);

    if (country === "uk" && !UK_SET.has(regionLower))
      return false;

    if (country === "ireland" && regionLower !== "ireland")
      return false;

    if (region && regionLower !== normalize(region))
      return false;

    if (city && normalize(e.city) !== normalize(city))
      return false;

    if (sport && normalize(e.sport) !== normalize(sport))
      return false;

    return true;
  });

  const availableDates = Array.from(
    new Set(
      filteredEventsForDates
        .map((e: any) =>
          (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10)
        )
        .filter(Boolean)
    )
  ).sort();

  const liveCount = isToday
    ? finalEvents.filter((e: any) => {
        const now = new Date();
        const start = parseEventDate(e.startDate ?? e.date ?? e.utcDate);
        if (!start) return false;
        const diff = (now.getTime() - start.getTime()) / (1000 * 60);
        return diff >= 0 && diff <= 120; // 시작 후 2시간 이내
      }).length
    : 0;

  const upcoming24h = isToday
    ? finalEvents.filter((e: any) => {
        const start = parseEventDate(e.startDate ?? e.date ?? e.utcDate);
        if (!start) return false;
        const now = new Date();
        const diff = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diff > 0 && diff <= 24;
      }).length
    : 0;  
  
  const congestionWarning =
    isToday && totalEvents >= 15;  

  const monthKey = date.slice(0, 7);

  const monthEvents = filteredEventsForDates.filter((e: any) =>
    (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7) === monthKey
  );

  const monthDailyCounts: Record<string, number> = {};

  monthEvents.forEach((e: any) => {
    const d = (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);
    if (!d) return;
    monthDailyCounts[d] = (monthDailyCounts[d] || 0) + 1;
  });

  const sortedMonthDays = Object.entries(monthDailyCounts)
    .sort((a, b) => b[1] - a[1]);

  const monthCounts = Object.values(monthDailyCounts);

  const monthMedian =
    monthCounts.length > 0
      ? [...monthCounts].sort((a, b) => a - b)[
          Math.floor(monthCounts.length / 2)
        ]
      : 0;

  const deltaVsMedian =
    monthMedian > 0
      ? Math.round(((totalEvents - monthMedian) / monthMedian) * 100)
      : 0;

  const rank =
    isPast
      ? sortedMonthDays.findIndex(([d]) => d === date) + 1
      : null;
        
  const currentIndex =
    availableDates.indexOf(date);

  const previousDate =
    currentIndex > 0
      ? availableDates[currentIndex - 1]
      : null;

  const nextDate =
    currentIndex !== -1 &&
    currentIndex < availableDates.length - 1
      ? availableDates[currentIndex + 1]
      : null;

  const hasCountry = !!country;
  const hasRegion = !!region;
  const hasCity = !!city;
  const hasSport = !!sport;  
  
  const showRegionStats = !hasSport && !hasCity;
  const showSportStats = !hasSport;
  const showCityStats = !hasCity;

  const showCityMetric = !hasCity;

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">

      <DateFilterBar
        date={date}
        events={dateBaseEvents}
      />
      {/* ================= HEADER ================= */}

      <header className="space-y-4">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Explore all professional sporting events taking place on {displayDate}.
          Filter by country, region, city or sport to narrow the schedule and
          identify peak activity across venues.
        </p>
        <h1 className="text-3xl font-bold">
          All Fixtures — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {totalEvents} professional sporting events
          taking place across {uniqueCities} cities.
        </p>
      </header>

      {isToday && (
        <section className="rounded-2xl p-6 bg-yellow-50 border border-yellow-200 space-y-2">
          <p className="font-semibold">Live Overview</p>
          <p>{liveCount} fixtures currently in play</p>
          <p>{upcoming24h} fixtures in next 24 hours</p>
          {congestionWarning && (
            <p className="text-red-600 font-medium">
              High congestion day
            </p>
          )}
        </section>
      )}

      {isPast && rank && (
        <section className="rounded-2xl p-6 bg-blue-50 border border-blue-200">
          <p>
            Ranked <strong>#{rank}</strong> busiest day of the month.
          </p>
        </section>
      )}

      {monthMedian > 0 && (
        <section className="rounded-2xl p-6 bg-muted/40 border border-border/30">
          <p className="text-sm">
            Typical day this month: <strong>{monthMedian}</strong> fixtures.
          </p>

          {deltaVsMedian > 0 && (
            <p className="text-sm">
              This day runs <strong>{deltaVsMedian}% above</strong> the monthly median.
            </p>
          )}

          {deltaVsMedian < 0 && (
            <p className="text-sm">
              This day runs <strong>{Math.abs(deltaVsMedian)}% below</strong> the monthly median.
            </p>
          )}
        </section>
      )}

      {isToday && peakTime && (
        <section className="rounded-2xl p-6 bg-red-50 border border-red-200">
          <p className="font-semibold mb-2">Peak start time</p>
          <p className="text-xl font-bold">
            {peakTime.time}
          </p>
          <p>
            {peakTime.count} fixtures (
            {peakTime.percentage}% of the day)
          </p>
        </section>
      )}
      
      {/* ================= SNAPSHOT ================= */}

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total fixtures
            </p>
            <p className="text-2xl font-semibold">
              {totalEvents}
            </p>
          </div>

          {showCityMetric && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Active cities
              </p>
              <p className="text-2xl font-semibold">
                {uniqueCities}
              </p>
            </div>
            )}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Active venues
            </p>
            <p className="text-2xl font-semibold">
              {uniqueVenues}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Avg fixtures / venue
            </p>
            <p className="text-2xl font-semibold">
              {density}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Average number of fixtures hosted per active venue.
            </p>
          </div>

        </div>
      </section>

      
      {/* ================= REGION DISTRIBUTION ================= */}

      {showRegionStats && regionDistribution.length > 0 && (
        <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">
          <h2 className="text-lg font-semibold mb-6">
            Regional activity
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {regionDistribution.map(([region, count]) => (
              <div key={region}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {region}
                </p>
                <p className="text-2xl font-semibold">
                  {count}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* ================= SPORT MIX ================= */}

      {showSportStats && sportDistribution.length > 1 && (
        <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">

          <h2 className="text-lg font-semibold mb-6">
            Sport distribution
          </h2>

          <SportDistributionChart data={sportDistribution} />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mt-6">
            {sportDistribution.map((item) => (
              <div key={item.sport}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {item.sport}
                </p>
                <p className="text-xl font-semibold">
                  {item.count}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.percentage}%
                </p>
              </div>
            ))}
          </div>

        </section>
      )}

      {/* ================= BUSIEST CITIES ================= */}

      {showCityStats && (
        <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">
          <h2 className="text-lg font-semibold mb-6">
            City activity
          </h2>

          {busiestCities.length > 0 && (
            <>
              {/* Only highlight if there is a clear leader */}
              {!multipleLeaders && maxCityCount > 1 && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Most active city
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    {topCityShare}% of total fixtures
                  </p>

                  <div className="flex items-baseline justify-between">
                    <h3 className="text-3xl font-bold tracking-tight">
                      {busiestCities[0][0]}
                    </h3>
                    <span className="text-xl font-semibold">
                      {busiestCities[0][1]} fixtures
                    </span>
                  </div>
                </div>
              )}

              {/* Simple clean list */}
              <ul className="space-y-2">
                {busiestCities.map(([city, count]) => (
                  <li
                    key={city}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="font-medium">
                      {city}
                    </span>

                    <span className="text-sm text-muted-foreground">
                      {count} {count === 1 ? "fixture" : "fixtures"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
      {/* ================= FULL LIST ================= */}

      <section>
        <h2 className="text-xl font-semibold mb-6">
          Full fixture list — {displayDate}
        </h2>

        <EventList
          events={finalEvents}
          fixedStartDate={date}
        />
      </section>

      {/* ================= DATE NAV ================= */}

      <section className="pt-8 border-t flex justify-between text-sm">

        {previousDate ? (
          <Link
            href={`/date/${previousDate}`}
            className="underline"
          >
            ← {previousDate}
          </Link>
        ) : <span />}

        {nextDate ? (
          <Link
            href={`/date/${nextDate}`}
            className="underline"
          >
            {nextDate} →
          </Link>
        ) : <span />}

      </section>
      
      {finalEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              finalEvents
                .filter((event: any) => event.startDate || event.date || event.utcDate)
                .map((event: any) => ({
                  "@context": "https://schema.org",
                  "@type": "SportsEvent",
                  name:
                    event.homeTeam && event.awayTeam
                      ? `${event.homeTeam} vs ${event.awayTeam}`
                      : event.title ?? "Sports Event",
                  startDate: event.startDate ?? event.date ?? event.utcDate,
                  eventAttendanceMode:
                    "https://schema.org/OfflineEventAttendanceMode",
                  eventStatus:
                    "https://schema.org/EventScheduled",
                  location: {
                    "@type": "Place",
                    name: event.venue ?? "Sports Venue",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: event.city ?? "",
                      addressCountry: event.region ?? "",
                    },
                  },
                  sport: event.sport ?? "Sports",
                }))
            ),
          }}
        />
      )}
    </main>
  );
}