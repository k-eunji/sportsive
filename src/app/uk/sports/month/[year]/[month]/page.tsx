// src/app/uk/sports/month/[year]/[month]/page.tsx

import { notFound } from "next/navigation";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import ReportsDashboard from "@/app/reports/ReportsDashboard";
import type { Metadata } from "next";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

function isValidYearMonth(year: string, month: string) {
  return /^\d{4}$/.test(year) && /^(0[1-9]|1[0-2])$/.test(month);
}

export async function generateMetadata({
  params,
}: {
  params: { year: string; month: string };
}): Promise<Metadata> {

  const { year, month } = params;

  const date = new Date(Number(year), Number(month) - 1);

  const displayMonth = date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return {
    title: `UK Sports Fixtures ${displayMonth} | VenueScope`,
    description: `Complete sports fixture schedule across England, Scotland, Wales and Northern Ireland in ${displayMonth}. Includes football, rugby, horse racing and major competitions.`,
    alternates: {
      canonical: `https://venuescope.io/uk/sports/month/${year}/${month}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  
  if (!isValidYearMonth(year, month)) {
    notFound();
  }

  /* =============================
     SEO TIME WINDOW CONTROL
  ============================== */

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

  const displayMonth = requested.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `UK Sports Fixtures ${displayMonth}`,
    description: `Monthly sports fixtures across the UK in ${displayMonth}.`,
    url: `https://venuescope.io/uk/sports/month/${year}/${month}`,
  };

  /* =============================
     DATA FETCH
  ============================== */

  const allEvents = await getAllEventsRaw("180d");

  const ukEvents = allEvents.filter((e: any) =>
    UK_REGIONS.includes(e.region?.toLowerCase())
  );

  /* =============================
     STRUCTURED DATA (Breadcrumb)
  ============================== */

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "UK Sports",
        item: "https://venuescope.io/uk/sports",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/uk/sports/month/${year}/${month}`,
      },
    ],
  };

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          UK Sports Fixtures & Match Schedule – {displayMonth}
        </h1>
        
        <p className="text-sm text-muted-foreground max-w-2xl">
          This page provides a complete overview of professional sports fixtures
          taking place across the United Kingdom during {displayMonth}.
          Events include football league matches, rugby fixtures, horse racing
          meetings and other domestic competitions held across England,
          Scotland, Wales and Northern Ireland.
        </p>

        <h2 className="text-xl font-semibold">
          Monthly Sports Schedule Overview
        </h2>

        <p className="text-sm text-muted-foreground max-w-3xl">
          The UK hosts one of the most active sports calendars in Europe,
          with hundreds of professional fixtures scheduled every month.
          Major leagues such as football and rugby dominate the calendar,
          while horse racing and regional competitions contribute to the
          overall fixture density across the country.
        </p>

        <h2 className="text-xl font-semibold">
          Major Sports Covered
        </h2>

        <p className="text-sm text-muted-foreground max-w-3xl">
          The fixture explorer includes events from multiple professional
          sports including football, rugby union, rugby league, cricket,
          and horse racing. Fixtures are distributed across major UK
          sporting cities including London, Manchester, Liverpool,
          Glasgow, Cardiff and Belfast.
        </p>

      </section>
      <ReportsDashboard
        events={ukEvents}
        countryScope="uk"
        initialSport="all"
        initialYear={year}
        initialMonth={month}
      />
      {/* =============================
          STRUCTURED DATA
      ============================== */}

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