// src/app/uk/sports/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";
import { DateNav } from "@/app/components/DateNav";
import Link from "next/link";
import SportDistributionChart from "@/app/components/SportDistributionChart";
import OpsCta from "@/app/components/OpsCta";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

type Props = {
  params: Promise<{ date: string }>;
};

function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function formatDisplayDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const displayDate = formatDisplayDate(date);

  return {
    title: `Sports Fixtures in the UK — ${displayDate} | VenueScope`,
    description: `Professional sports fixtures taking place across the UK on ${displayDate}, organised by city and venue.`,
    alternates: {
      canonical: `https://venuescope.io/uk/sports/${date}`,
    },
  };
}

export default async function UKSportsByDatePage({ params }: Props) {
  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");

  const dateEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  if (dateEvents.length === 0) {
    notFound();
  }

  const availableDates = new Set<string>();

  events.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    if (UK_REGIONS.includes(e.region?.toLowerCase())) {
      availableDates.add(raw.slice(0, 10));
    }
  });

  const sortedDates = Array.from(availableDates).sort();

  const currentIndex = sortedDates.indexOf(date);

  const previousDate =
    currentIndex > 0 ? sortedDates[currentIndex - 1] : null;

  const nextDate =
    currentIndex !== -1 && currentIndex < sortedDates.length - 1
      ? sortedDates[currentIndex + 1]
      : null;

  /* ================= GROUP BY SPORT ================= */

  const groupedBySport: Record<string, any[]> = {};

  dateEvents.forEach((event: any) => {
    const sport = event.sport ?? "Other Sports";
    if (!groupedBySport[sport]) groupedBySport[sport] = [];
    groupedBySport[sport].push(event);
  });

  const SPORT_PRIORITY = [
    "football",
    "rugby",
    "cricket",
    "tennis",
    "basketball",
    "horse racing",
    "dart",
  ];

  const sortedSports = Object.entries(groupedBySport).sort((a, b) => {
    const indexA = SPORT_PRIORITY.indexOf(a[0]?.toLowerCase());
    const indexB = SPORT_PRIORITY.indexOf(b[0]?.toLowerCase());

    const priorityA = indexA === -1 ? 999 : indexA;
    const priorityB = indexB === -1 ? 999 : indexB;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a[0].localeCompare(b[0]);
  });

  /* ================= SPORT DISTRIBUTION ================= */

  const sportCounts: Record<string, number> = {};
  dateEvents.forEach((event: any) => {
    const sport = event.sport?.toLowerCase() ?? "other";
    sportCounts[sport] = (sportCounts[sport] || 0) + 1;
  });

  const totalSports = dateEvents.length;

  const sportDistribution = Object.entries(sportCounts).map(
    ([sport, count]) => ({
      sport,
      count,
      percentage:
        totalSports > 0
          ? Math.round((count / totalSports) * 100)
          : 0,
    })
  );

  /* ================= NEXT EVENTS ================= */

  const upcomingUKEvents = events
    .filter((e: any) => {
      const eventDate = e.startDate ?? e.date ?? e.utcDate;
      if (!eventDate) return false;

      return (
        UK_REGIONS.includes(e.region?.toLowerCase()) &&
        new Date(eventDate) > new Date(date)
      );
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.startDate ?? a.date ?? a.utcDate).getTime() -
        new Date(b.startDate ?? b.date ?? b.utcDate).getTime()
    );

  const nextEvents = upcomingUKEvents.slice(0, 5);

  /* ================= NEW ANALYTICS ================= */

  // 1️⃣ Regional breakdown
  const regionCounts: Record<string, number> = {};
  dateEvents.forEach((event: any) => {
    const region = event.region?.toLowerCase();
    if (!region) return;
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });

  // 2️⃣ City ranking
  const cityCounts: Record<string, number> = {};
  dateEvents.forEach((event: any) => {
    const city = event.city;
    if (!city) return;
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  const busiestCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 3️⃣ Venue count
  const uniqueVenues = new Set(
    dateEvents.map((e: any) => e.venue).filter(Boolean)
  ).size;

  // 4️⃣ Monthly ranking (UK level)
  const monthPrefix = date.slice(0, 7);

  const monthEvents = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventMonth === monthPrefix
    );
  });

  const monthGrouped: Record<string, number> = {};

  monthEvents.forEach((e: any) => {
    const d =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);
    if (!d) return;
    monthGrouped[d] = (monthGrouped[d] || 0) + 1;
  });

  const sortedMonthDays = Object.entries(monthGrouped)
    .sort((a, b) => b[1] - a[1]);

  const rank =
    sortedMonthDays.findIndex(([d]) => d === date) + 1;

  const totalDays = sortedMonthDays.length;

  const displayDate = formatDisplayDate(date);

  /* ================= UI ================= */

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Sports Fixtures in the UK — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          There are {dateEvents.length} professional sporting events
          taking place across the United Kingdom on {displayDate}.
        </p>

        {rank > 0 && (
          <p className="text-sm text-muted-foreground">
            This is the <strong>{getOrdinal(rank)}</strong> busiest UK sports
            matchday of {totalDays} this month.
          </p>
        )}

        {uniqueVenues > 0 && (
          <p className="text-sm text-muted-foreground">
            Fixtures are being hosted across <strong>{uniqueVenues}</strong> venues nationwide.
          </p>
        )}
      </header>

      {/* ===== Regional Distribution ===== */}

      {Object.keys(regionCounts).length > 0 && (
        <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">
          <h2 className="text-lg font-semibold mb-4">
            Regional distribution
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {Object.entries(regionCounts).map(([region, count]) => (
              <div key={region}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {region}
                </p>
                <p className="text-2xl font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Busiest Cities ===== */}

      {busiestCities.length > 0 && (
        <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">
          <h2 className="text-lg font-semibold mb-4">
            Busiest cities today
          </h2>

          <ul className="space-y-2 text-sm">
            {busiestCities.map(([city, count], i) => (
              <li key={city} className="flex justify-between border-b py-2">
                <span>
                  {i + 1}. {city}
                </span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ================= EXPORT ================= */}

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">

        <h2 className="text-sm font-semibold uppercase tracking-wide">
          Export Schedule
        </h2>

        <div className="flex gap-4 flex-wrap">

          <a
            href={`/api/export/uk-sports?date=${date}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition shadow-md"
          >
            ⬇ Download Full Fixture List (CSV)
          </a>

          <a
            href={`/api/export/uk-sports?date=${date}&format=ics`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium hover:bg-muted transition"
          >
            📅 Add All Events to Calendar (.ics)
          </a>
        </div>

        <div className="mt-4">
          <OpsCta />
        </div>
      </section>

      {/* ================= SPORT SHARE ANALYSIS ================= */}

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">
        <h2 className="text-lg font-semibold">
          Sport distribution – UK fixtures
        </h2>

        {/* 🔥 도넛 차트 */}
        {sportDistribution.length > 0 && (
          <SportDistributionChart data={sportDistribution} />
        )}

        {/* 숫자 요약 */}
        {sportDistribution.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            {sportDistribution.map((item) => (
              <div key={item.sport}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {item.sport}
                </p>
                <p className="text-xl md:text-2xl font-semibold">
                  {item.count}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {item.percentage}%
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Fixtures on {displayDate}
        </h2>

        {/* Sport markers explanation */}
        <div className="mt-5 mb-3 text-xs text-muted-foreground space-y-1">
          <div className="font-medium text-foreground/70">
            Sport markers
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>F</strong> Football</span>
            <span><strong>R</strong> Rugby</span>
            <span><strong>B</strong> Basketball</span>
            <span><strong>C</strong> Cricket</span>
            <span><strong>H</strong> Horse racing</span>
            <span><strong>T</strong> Tennis</span>
            <span><strong>D</strong> Darts</span>
          </div>
        </div>

        <div className="space-y-10">
          {sortedSports.map(([sport, events]) => (
            <div key={sport} className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                {sport} ({events.length})
              </h3>

              <EventList
                events={events}
                fixedStartDate={date}
              />
            </div>
          ))}
        </div>
      </section>

      {dateEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              dateEvents
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
                  organizer: {
                    "@type": "Organization",
                    name: "VenueScope",
                    url: "https://venuescope.io",
                  },
                }))
            ),
          }}
        />
      )}

      <section className="flex justify-between border-t pt-6 text-sm">

        {previousDate ? (
          <Link
            href={`/uk/sports/${previousDate}`}
            className="underline"
          >
            ← Previous matchday
          </Link>
        ) : <span />}

        {nextDate ? (
          <Link
            href={`/uk/sports/${nextDate}`}
            className="underline"
          >
            Next matchday →
          </Link>
        ) : <span />}

      </section>

      <section className="pt-8">
        <Link href="/uk/live-sports-today">
          View today’s UK fixtures →
        </Link>
      </section>

      <section className="mt-6 space-y-2 text-sm">
        <Link
          href={`/uk/football/${date}`}
          className="underline block"
        >
          Football fixtures on {displayDate}
        </Link>

        <Link
          href={`/uk/london/sports/${date}`}
          className="underline block"
        >
          London fixtures on {displayDate}
        </Link>

        <Link
          href={`/uk/manchester/sports/${date}`}
          className="underline block"
        >
          Manchester fixtures on {displayDate}
        </Link>
      </section>
    </main>
  );
}
