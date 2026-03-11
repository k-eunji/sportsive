// src/app/uk/championship/month/[year]/[month]/page.tsx

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
    title: `EFL Championship Fixtures – ${displayMonth} | VenueScope`,
    description: `Complete EFL Championship fixture schedule for ${displayMonth}. View all Championship matches, matchdays and kickoff times.`,
    alternates: {
      canonical: `https://venuescope.io/uk/football/championship/month/${year}/${month}`,
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

  const championshipEvents = events.filter((e: any) => {

    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    const league =
      (e.league ?? e.competition ?? "").toLowerCase();

    return (
      e.sport?.toLowerCase() === "football" &&
      league.includes("championship") &&
      eventMonth === prefix
    );
  });

  if (championshipEvents.length === 0) {
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
        name: "EFL Championship",
        item: "https://venuescope.io/uk/football/championship",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/uk/football/championship/month/${year}/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `EFL Championship Fixtures ${displayMonth}`,
    description: `Monthly EFL Championship fixture schedule during ${displayMonth}.`,
    url: `https://venuescope.io/uk/football/championship/month/${year}/${month}`,
  };

  /* ================= PAGE ================= */

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          EFL Championship Fixtures & Match Schedule – {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Explore the complete EFL Championship fixture schedule for {displayMonth}.
          This page lists every Championship match taking place during the month including
          matchdays, kickoff times and stadium locations across England.
        </p>

      </section>

      <ReportsDashboard
        events={championshipEvents}
        countryScope="uk"
        initialSport="football"
        initialCompetition="Championship"
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