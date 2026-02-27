// src/app/uk/london/sports/month/[year]/[month]/page.tsx

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

  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const min = new Date(currentMonth);
  min.setMonth(min.getMonth() - 6);

  const max = new Date(currentMonth);
  max.setMonth(max.getMonth() + 3);

  for (let i = -2; i <= 2; i++) {
    const d = new Date(baseDate);
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, month } = await params;
  if (!isValidYearMonth(year, month)) return {};

  const displayMonth = formatMonthDisplay(year, month);

  return {
    title: `Sports Fixtures in London – ${displayMonth} (Full Monthly Report)`,
    description: `Complete analytics report of all professional sports fixtures taking place in London during ${displayMonth}.`,
    alternates: {
      canonical: `https://venuescope.io/uk/london/sports/month/${year}/${month}`,
    },
  };
}

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

  /* =========================
     FILTER LONDON
  ========================= */

  const londonEvents = events.filter((event: any) => {
    const eventMonth =
      (event.startDate ?? event.date ?? event.utcDate)?.slice(0, 7);

    return (
      event.city?.toLowerCase() === "london" &&
      eventMonth === prefix
    );
  });

  const totalFixtures = londonEvents.length;

  /* =========================
     GROUP BY DATE
  ========================= */

  const groupedByDate: Record<string, number> = {};

  londonEvents.forEach((event: any) => {
    const fullDate =
      (event.startDate ?? event.date ?? event.utcDate)?.slice(0, 10);
    if (!fullDate) return;
    groupedByDate[fullDate] =
      (groupedByDate[fullDate] || 0) + 1;
  });

  const sortedEntries = Object.entries(groupedByDate).sort();

  const busiestDay =
    [...sortedEntries].sort((a, b) => b[1] - a[1])[0] || null;

  const chartData = sortedEntries.map(([date, count]) => ({
    date: date.slice(8, 10),
    count,
    percentage:
      totalFixtures > 0
        ? Math.round((count / totalFixtures) * 100)
        : 0,
  }));

  /* =========================
     WEEKEND SPLIT
  ========================= */

  const weekendCount = londonEvents.filter((event: any) => {
    const d = new Date(
      event.startDate ?? event.date ?? event.utcDate
    );
    const day = d.getDay();
    return day === 0 || day === 6;
  }).length;

  const weekdayCount = totalFixtures - weekendCount;

  const weekendShare =
    totalFixtures > 0
      ? Math.round((weekendCount / totalFixtures) * 100)
      : 0;

  /* =========================
     SPORT DISTRIBUTION
  ========================= */

  const sportMap: Record<string, number> = {};

  londonEvents.forEach((event: any) => {
    const sport = event.sport ?? "Other";
    sportMap[sport] = (sportMap[sport] || 0) + 1;
  });

  const sportDistribution = Object.entries(sportMap)
    .sort((a, b) => b[1] - a[1])
    .map(([sport, count]) => ({
      sport,
      count,
      percentage:
        totalFixtures > 0
          ? Math.round((count / totalFixtures) * 100)
          : 0,
    }));

  const topSport = sportDistribution[0] ?? null;

  /* =========================
     VENUE DISTRIBUTION
  ========================= */

  const venueMap: Record<string, number> = {};

  londonEvents.forEach((event: any) => {
    if (!event.venue) return;
    venueMap[event.venue] =
      (venueMap[event.venue] || 0) + 1;
  });

  const topVenues = Object.entries(venueMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* =========================
     PREVIOUS MONTH CHANGE
  ========================= */

  const previousMonthDate = new Date(Number(year), Number(month) - 2);
  const prevPrefix = `${previousMonthDate.getFullYear()}-${String(
    previousMonthDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const previousMonthFixtures = events.filter((event: any) => {
    const eventMonth =
      (event.startDate ?? event.date ?? event.utcDate)?.slice(0, 7);

    return (
      event.city?.toLowerCase() === "london" &&
      eventMonth === prevPrefix
    );
  }).length;

  const monthChange =
    previousMonthFixtures > 0
      ? Math.round(
          ((totalFixtures - previousMonthFixtures) /
            previousMonthFixtures) *
            100
        )
      : null;

  /* =========================
     UK SHARE
  ========================= */

  const ukMonthFixtures = events.filter((event: any) => {
    const eventMonth =
      (event.startDate ?? event.date ?? event.utcDate)?.slice(0, 7);
    return eventMonth === prefix;
  }).length;

  const londonShareOfUK =
    ukMonthFixtures > 0
      ? Math.round((totalFixtures / ukMonthFixtures) * 100)
      : 0;

  const monthRange = getMonthRange(year, month);

  return (
    <main className="max-w-5xl mx-auto px-6 py-14 space-y-16">

      <header>
        <h1 className="text-3xl font-bold">
          Sports Fixtures in London – {displayMonth}
        </h1>
        <p className="text-muted-foreground text-sm">
          Complete monthly analytics report
        </p>
      </header>

      {/* SUMMARY */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Fixtures" value={totalFixtures} />
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

      {/* CONTEXT */}
      <section className="rounded-2xl border p-6 bg-background shadow-sm space-y-3 text-sm text-muted-foreground">
        {monthChange !== null && (
          <p>
            Fixture volume{" "}
            <strong>
              {monthChange > 0 ? "increased" : "decreased"}
            </strong>{" "}
            by <strong>{Math.abs(monthChange)}%</strong>{" "}
            compared to the previous month.
          </p>
        )}
        <p>
          London represents{" "}
          <strong>{londonShareOfUK}%</strong> of all UK
          sports fixtures in {displayMonth}.
        </p>
        {topSport && (
          <p>
            The most active sport was{" "}
            <strong>{topSport.sport}</strong>{" "}
            accounting for{" "}
            <strong>{topSport.percentage}%</strong> of
            monthly fixtures.
          </p>
        )}
      </section>

      <DailyVolumeChart data={chartData} />
      {sportDistribution.length > 0 && (
        <>
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Distribution by Sport – {displayMonth}
            </h2>

            <SportDistributionChart data={sportDistribution} />
          </section>

          <section className="text-sm text-muted-foreground leading-relaxed">
            <p>
              In <strong>{displayMonth}</strong>, London hosted{" "}
              <strong>{totalFixtures}</strong> professional sports fixtures
              across multiple disciplines. The busiest day occurred on{" "}
              <strong>
                {busiestDay ? formatFullDate(busiestDay[0]) : "N/A"}
              </strong>.
            </p>

            <p className="mt-3">
              The most active sport during the month was{" "}
              <strong>{sportDistribution[0].sport}</strong>, accounting for{" "}
              <strong>{sportDistribution[0].percentage}%</strong> of all
              scheduled fixtures in the capital.
            </p>
          </section>
        </>
      )}

      {topVenues.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Top Stadium Utilisation
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

      {/* DAILY INDEX */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Daily Fixture Index
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          {sortedEntries.map(([date, count]) => (
            <li key={date}>
              <Link href={`/uk/london/sports/${date}`} className="underline">
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
                href={`/uk/london/sports/month/${y}/${m}`}
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

      {/* FAQ */}
      <section className="mt-16 space-y-4 text-sm">
        <h2 className="text-xl font-semibold">
          FAQs – Sports in London in {displayMonth}
        </h2>

        <p>
          <strong>How many sports fixtures take place?</strong><br />
          {totalFixtures} professional fixtures are scheduled.
        </p>

        <p>
          <strong>Which sport is most active?</strong><br />
          {topSport?.sport ?? "Multiple sports"} leads the schedule.
        </p>

        <p>
          <strong>Are most fixtures on weekends?</strong><br />
          {weekendShare}% of events take place on Saturdays and Sundays.
        </p>
      </section>
      
      {/* ================= STRUCTURED DATA ================= */}

      {/* DATASET */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: `London Sports Fixtures Dataset – ${displayMonth}`,
            description: `Structured monthly dataset of professional sports fixtures in London during ${displayMonth}.`,
            url: `https://venuescope.io/uk/london/sports/month/${year}/${month}`,
            temporalCoverage: `${prefix}-01/${prefix}-31`,
            spatialCoverage: {
              "@type": "Place",
              name: "London, United Kingdom"
            },
            variableMeasured: [
              "Total Fixtures",
              "Weekend Share",
              "Sport Distribution",
              "Venue Utilisation"
            ]
          })
        }}
      />

      {/* ITEM LIST – DAILY INDEX */}
      {sortedEntries.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `Daily Sports Fixtures in London – ${displayMonth}`,
              itemListElement: sortedEntries.map(
                ([date, count], index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: `${formatFullDate(date)} – ${count} fixtures`,
                  url: `https://venuescope.io/uk/london/sports/${date}`
                })
              )
            })
          }}
        />
      )}

      {/* FAQ STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `How many sports fixtures take place in London in ${displayMonth}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${totalFixtures} professional sports fixtures are scheduled in London during ${displayMonth}.`
                }
              },
              {
                "@type": "Question",
                name: `Which sport is most active in London in ${displayMonth}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${
                    topSport?.sport ?? "Multiple sports"
                  } has the highest fixture volume during this month.`
                }
              },
              {
                "@type": "Question",
                name: `Are most sports fixtures played on weekends?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${weekendShare}% of fixtures take place on Saturdays and Sundays.`
                }
              }
            ]
          })
        }}
      />
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