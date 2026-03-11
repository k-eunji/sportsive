// src/app/uk/league-one/month/[year]/[month]/page.tsx

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
    title: `League One Fixtures – ${displayMonth} | VenueScope`,
    description: `Complete EFL League One fixture schedule for ${displayMonth}. View all League One matches, matchdays and kickoff times.`,
    alternates: {
      canonical: `https://venuescope.io/uk/football/league-one/month/${year}/${month}`,
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

  const leagueOneEvents = events.filter((e: any) => {

    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    const league =
      (e.league ?? e.competition ?? "").toLowerCase();

    const isLeagueOne =
      league.includes("league one") ||
      league.includes("league 1") ||
      league.includes("efl league one") ||
      league.includes("efl league 1") ||
      league.includes("efl 1") ||
      league.includes("efl one");

    return (
      e.sport?.toLowerCase() === "football" &&
      isLeagueOne &&
      eventMonth === prefix
    );
  });

  if (leagueOneEvents.length === 0) {
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
        name: "League One",
        item: "https://venuescope.io/uk/football/league-one",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/uk/football/league-one/month/${year}/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `League One Fixtures ${displayMonth}`,
    description: `Monthly EFL League One fixture schedule during ${displayMonth}.`,
    url: `https://venuescope.io/uk/football/league-one/month/${year}/${month}`,
  };

  /* ================= PAGE ================= */

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          League One Fixtures & Match Schedule – {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Explore the complete EFL League One fixture schedule for {displayMonth}.
          This page lists every League One match taking place during the month including
          matchdays, kickoff times and stadium locations across England.
        </p>

      </section>

      <ReportsDashboard
        events={leagueOneEvents}
        countryScope="uk"
        initialSport="football"
        initialCompetition="League One"
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
    </>
  );
}