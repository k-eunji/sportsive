//src/app/uk/premier-league/month/[year]/[month]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import ReportsDashboard from "@/app/reports/ReportsDashboard";

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

/* ================= METADATA ================= */

export async function generateMetadata({
  params,
}: {
  params: { year: string; month: string };
}): Promise<Metadata> {

  const { year, month } = params;

  if (!isValidYearMonth(year, month)) return {};

  const displayMonth = formatMonthDisplay(year, month);

  return {
    title: `Premier League Fixtures & EPL Match Schedule – ${displayMonth} | English Premier League`,
    description: `Complete Premier League fixtures and EPL match schedule for ${displayMonth}. Browse the full English Premier League games list, matchdays, kickoff times and stadium locations.`,
    alternates: {
      canonical: `https://venuescope.io/uk/football/premier-league/month/${year}/${month}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/* ================= PAGE ================= */

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {

  const { year, month } = await params;

  if (!isValidYearMonth(year, month)) {
    notFound();
  }

  const requested = new Date(Number(year), Number(month) - 1, 1);

  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

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

  /* ================= DATA ================= */

  const events = await getAllEventsRaw("180d");

  /* ================= FILTER ================= */

  const FOOTBALL_TYPES = ["football", "soccer"];

  const PREMIER_TERMS = [
    "premier league",
    "english premier league",
    "epl"
  ];

  const premierLeagueEvents = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    const league =
      (e.league ?? e.competition ?? "").toLowerCase();

    const isPremierLeague = PREMIER_TERMS.some(term =>
      league.includes(term)
    );

    return (
      FOOTBALL_TYPES.includes(e.sport?.toLowerCase()) &&
      isPremierLeague &&
      eventMonth === prefix
    );
  });
  if (premierLeagueEvents.length === 0) {
    notFound();
  }

  /* ================= STRUCTURED DATA ================= */

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Premier League",
        item: "https://venuescope.io/uk/football/premier-league",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/uk/football/premier-league/month/${year}/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Premier League Fixtures ${displayMonth}`,
    description: `Full Premier League football fixture schedule and match list for ${displayMonth}.`,
    url: `https://venuescope.io/uk/football/premier-league/month/${year}/${month}`,
    keywords: [
      "Premier League fixtures",
      "EPL fixtures",
      "Premier League schedule",
      "English Premier League matches",
      "EPL games list"
    ]
  };
  /* ================= PAGE ================= */

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          Premier League Fixtures & EPL Match Schedule – {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
        Explore the complete Premier League fixture schedule for {displayMonth}.
        This page lists every EPL match taking place this month including
        kickoff times, stadium locations and matchdays across England.

        Fans searching for the Premier League schedule, football fixtures
        or EPL match list for {displayMonth} can view the full schedule below.
        </p>

      </section>

      <ReportsDashboard
        events={premierLeagueEvents}
        countryScope="uk"
        initialSport="football"
        initialCompetition="Premier League"
        initialYear={year}
        initialMonth={month}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageSchema),
        }}
      />

      <h2 className="text-xl font-semibold mt-10">
      Premier League Match Schedule – {displayMonth}
      </h2>
    </>
  );
}