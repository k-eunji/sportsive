//src/app/ireland/football/month/[year]/[month]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import ReportsDashboard from "@/app/reports/ReportsDashboard";

const IRELAND_REGIONS = [
  "ireland",
];

function isValidYearMonth(year: string, month: string) {
  return /^\d{4}$/.test(year) && /^(0[1-9]|1[0-2])$/.test(month);
}

function formatMonthDisplay(year: string, month: string) {
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-IE", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Dublin",
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
    title: `Ireland Football Fixtures – ${displayMonth} | VenueScope`,
    description: `Professional football fixtures across Ireland during ${displayMonth}.`,

    alternates: {
      canonical: `https://venuescope.io/ireland/football/month/${year}/${month}`,
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

  const irelandFootballEvents = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      e.sport?.toLowerCase() === "football" &&
      IRELAND_REGIONS.includes(e.region?.toLowerCase()) &&
      eventMonth === prefix
    );
  });

  /* ================= 404 IF NO DATA ================= */

  if (irelandFootballEvents.length === 0) {
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
        name: "Ireland Football",
        item: "https://venuescope.io/ireland/football",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/ireland/football/month/${year}/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Ireland Football Fixtures ${displayMonth}`,
    description: `Monthly football fixtures across Ireland during ${displayMonth}.`,
    url: `https://venuescope.io/ireland/football/month/${year}/${month}`,
  };

  /* ================= PAGE ================= */

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          Ireland Football Fixtures & Match Schedule – {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          This page provides a complete overview of professional football
          fixtures taking place across Ireland during {displayMonth}.
          The monthly schedule includes domestic league matches,
          cup competitions, and other professional football fixtures.
        </p>

      </section>

      <ReportsDashboard
        events={irelandFootballEvents}
        countryScope="ireland"
        initialSport="football"
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