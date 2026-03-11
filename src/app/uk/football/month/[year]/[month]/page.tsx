// src/app/uk/football/month/[year]/[month]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import ReportsDashboard from "@/app/reports/ReportsDashboard";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

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
    title: `UK Football Fixtures & Soccer Match Schedule – ${displayMonth} | VenueScope`,
    description: `Professional football and soccer fixtures across England, Scotland, Wales and Northern Ireland during ${displayMonth}. Browse match schedules, league fixtures and cup competitions across the UK.`,
    alternates: {
      canonical: `https://venuescope.io/uk/football/month/${year}/${month}`,
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

  /* ================= DATA FETCH ================= */

  const events = await getAllEventsRaw("180d");

  /* ================= FILTER ================= */

  const FOOTBALL_TYPES = ["football", "soccer"];

  const ukFootballEvents = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      FOOTBALL_TYPES.includes(e.sport?.toLowerCase()) &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventMonth === prefix
    );
  });

  /* ================= 404 IF NO DATA ================= */

  if (ukFootballEvents.length === 0) {
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
        name: "UK Football",
        item: "https://venuescope.io/uk/football",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/uk/football/month/${year}/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `UK Football & Soccer Fixtures ${displayMonth}`,
    description: `Monthly football and soccer fixtures across the United Kingdom during ${displayMonth}.`,
    url: `https://venuescope.io/uk/football/month/${year}/${month}`,
    keywords: [
      "UK football fixtures",
      "UK soccer fixtures",
      "UK football schedule",
      "UK soccer matches",
      "football fixtures UK",
    ],
  };
  /* ================= PAGE ================= */

  return (
    <>
      {/* SEO TEXT */}

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          UK Football & Soccer Fixtures – Match Schedule {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          This page provides a complete overview of professional football
          fixtures taking place across the United Kingdom during {displayMonth}.
          The monthly schedule includes domestic leagues, cup competitions,
          and major professional matches played across England, Scotland,
          Wales and Northern Ireland.
        </p>

      </section>

      {/* DASHBOARD */}

      <ReportsDashboard
        events={ukFootballEvents}
        countryScope="uk"
        initialSport="football"
        initialYear={year}
        initialMonth={month}
      />

      {/* STRUCTURED DATA */}

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