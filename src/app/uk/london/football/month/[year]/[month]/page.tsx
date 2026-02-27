//src/app/uk/london/football/month/[year]/[month]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

import DailyVolumeChart from "@/app/components/DailyVolumeChart";
import CompetitionShareChart from "@/app/components/CompetitionShareChart";

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
    title: `Football Matches in London – ${displayMonth} (Full Schedule)`,
    description: `See all football matches in London in ${displayMonth}. View Premier League, EFL and other fixtures with match dates and stadium details.`,
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
    COMPETITION DISTRIBUTION
  ========================= */

  const competitionMap: Record<string, number> = {};

  londonFootballEvents.forEach((event: any) => {
    if (!event.competition) return;
    competitionMap[event.competition] =
      (competitionMap[event.competition] || 0) + 1;
  });

  const competitionChartData = Object.entries(competitionMap)
    .sort((a, b) => b[1] - a[1])
    .map(([competition, count]) => ({
      sport: competition, // Chart에서 nameKey="sport" 쓰고 있으니까 유지
      count,
      percentage:
        totalMatches > 0
          ? Math.round((count / totalMatches) * 100)
          : 0,
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
    percentage:
      totalMatches > 0
        ? Math.round((count / totalMatches) * 100)
        : 0,
  }));
  /* =========================
    PREVIOUS MONTH COMPARISON
  ========================= */

  const previousMonthDate = new Date(Number(year), Number(month) - 2);
  const prevPrefix = `${previousMonthDate.getFullYear()}-${String(
    previousMonthDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const previousMonthMatches = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      e.sport?.toLowerCase() === "football" &&
      e.city?.toLowerCase() === "london" &&
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

  /* =========================
    LONDON SHARE OF UK
  ========================= */

  const ukMonthMatches = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      e.sport?.toLowerCase() === "football" &&
      eventMonth === prefix
    );
  }).length;

  const londonShareOfUK =
    ukMonthMatches > 0
      ? Math.round((totalMatches / ukMonthMatches) * 100)
      : 0;    

  return (
    <main className="max-w-5xl mx-auto px-5 py-12 space-y-16">

      <header>
        <h1 className="text-3xl md:text-4xl font-bold">
          Football Matches in London – {displayMonth}
        </h1>
        <p className="text-muted-foreground text-sm">
          Complete match schedule for football in London this month
        </p>
      </header>

      <section className="text-sm text-muted-foreground leading-relaxed">
        <p>
          Looking for football matches in London in {displayMonth}? 
          This page lists every professional football game taking place 
          across London stadiums during the month.
        </p>
        <p>
          This monthly London football schedule includes home and away fixtures 
          involving London-based clubs competing in the Premier League, 
          EFL Championship, League One and League Two.
        </p>
      </section>

      {/* GLOBAL REPORT CTA */}
      <section className="bg-gray-50 border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            Explore the full UK multi-sport analytics dashboard
          </p>
          <p className="text-xs text-muted-foreground">
            Compare regions, competitions, stadium utilisation and monthly distribution across all sports.
          </p>
        </div>

        <Link
          href="/reports"
          className="inline-block px-4 py-2 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800"
        >
          Open Full Reports Dashboard →
        </Link>
      </section>


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

      {/* MONTHLY CONTEXT */}
      <section className="rounded-2xl border p-6 bg-background shadow-sm">

        <h2 className="text-xl font-semibold mb-4">
          Monthly Context
        </h2>

        <div className="space-y-3 text-sm text-muted-foreground">

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
            <strong>{londonShareOfUK}%</strong> of all UK football
            fixtures in {displayMonth}.
          </p>

        </div>

      </section>
      
      {/* DAILY VOLUME */}
      <section>
        <DailyVolumeChart data={chartData} />
      </section>

      {/* COMPETITION SHARE */}
      {competitionChartData.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Competition Distribution – {displayMonth}
          </h2>

          <CompetitionShareChart data={competitionChartData} />
        </section>
      )}

      <section className="text-sm text-muted-foreground leading-relaxed">
        <p>
          In <strong>{displayMonth}</strong>, London hosts{" "}
          <strong>{totalMatches}</strong> professional football fixtures
          across multiple competitions. The busiest matchday falls on{" "}
          <strong>
            {busiestDay ? formatFullDate(busiestDay[0]) : "N/A"}
          </strong>.{" "}
          {competitionChartData.length > 0 && (
            <>
              The largest share of fixtures comes from{" "}
              <strong>{competitionChartData[0].sport}</strong>, accounting for{" "}
              <strong>{competitionChartData[0].percentage}%</strong> of the monthly schedule.
            </>
          )}
        </p>
      </section>

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
      <section className="text-sm text-muted-foreground leading-relaxed">
        <p>
          Whether you're planning a weekend trip or checking upcoming games,
          this page helps you see what football is on in London in {displayMonth}.
        </p>
      </section>
      <section className="mt-16 space-y-4 text-sm">
        <h2 className="text-xl font-semibold">
          FAQs – Football in London in {displayMonth}
        </h2>

        <p>
          <strong>How many football matches are played in London in {displayMonth}?</strong><br />
          There are {totalMatches} professional fixtures scheduled across London stadiums.
        </p>

        <p>
          <strong>Which London teams play at home this month?</strong><br />
          Home fixtures for London-based clubs are listed in the daily index above.
        </p>

        <p>
          <strong>Are most London football matches played on weekends?</strong><br />
          {weekendShare}% of fixtures take place on Saturdays and Sundays.
        </p>
      </section>
      {/* ================= DATASET ================= */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: `London Football Fixtures Dataset – ${displayMonth}`,
            description: `Structured dataset of all professional football matches taking place in London during ${displayMonth}.`,
            url: `https://venuescope.io/uk/london/football/month/${year}/${month}`,
            temporalCoverage: `${prefix}-01/${prefix}-31`,
            spatialCoverage: {
              "@type": "Place",
              name: "London, United Kingdom"
            },
            variableMeasured: [
              "Total Matches",
              "Weekend Share",
              "League Distribution",
              "Club Activity",
              "Stadium Utilisation"
            ]
          })
        }}
      />

      {sortedEntries.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `Daily Football Matches in London – ${displayMonth}`,
              itemListElement: sortedEntries.map(
                ([date, count], index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: `${formatFullDate(date)} – ${count} matches`,
                  url: `https://venuescope.io/uk/london/football/${date}`
                })
              )
            })
          }}
        />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `How many football matches are played in London in ${displayMonth}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${totalMatches} professional football fixtures are scheduled in London during ${displayMonth}.`
                }
              },
              {
                "@type": "Question",
                name: `Which London clubs are most active in ${displayMonth}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `The most active London clubs are determined by home fixture volume during this month.`
                }
              },
              {
                "@type": "Question",
                name: `Are most London football matches played on weekends?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${weekendShare}% of matches take place on Saturdays and Sundays.`
                }
              }
            ]
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "UK Football",
                item: "https://venuescope.io/uk/football"
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "London Football",
                item: "https://venuescope.io/uk/london/football"
              },
              {
                "@type": "ListItem",
                position: 3,
                name: displayMonth,
                item: `https://venuescope.io/uk/london/football/month/${year}/${month}`
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
