//src/app/ireland/sports/month/[year]/[month]/page.tsx

import { notFound } from "next/navigation";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import ReportsDashboard from "@/app/reports/ReportsDashboard";
import type { Metadata } from "next";

const IRELAND_REGIONS = [
  "ireland",
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

  const displayMonth = date.toLocaleDateString("en-IE", {
    month: "long",
    year: "numeric",
  });

  return {
    title: `Ireland Sports Fixtures ${displayMonth} | VenueScope`,
    description: `Complete sports fixture schedule across Ireland in ${displayMonth}. Includes football, rugby, horse racing and major competitions.`,

    alternates: {
      canonical: `https://venuescope.io/ireland/sports/month/${year}/${month}`,
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

  const displayMonth = requested.toLocaleDateString("en-IE", {
    month: "long",
    year: "numeric",
  });

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Ireland Sports Fixtures ${displayMonth}`,
    description: `Monthly sports fixtures across Ireland in ${displayMonth}.`,
    url: `https://venuescope.io/ireland/sports/month/${year}/${month}`,
  };

  /* =============================
     DATA FETCH
  ============================== */

  const allEvents = await getAllEventsRaw("180d");

  const irelandEvents = allEvents.filter((e: any) =>
    IRELAND_REGIONS.includes(e.region?.toLowerCase())
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
        name: "Ireland Sports",
        item: "https://venuescope.io/ireland/sports",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/ireland/sports/month/${year}/${month}`,
      },
    ],
  };

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          Ireland Sports Fixtures & Match Schedule – {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          This page provides a complete overview of professional sports fixtures
          taking place across Ireland during {displayMonth}.
          Events include football league matches, rugby fixtures,
          horse racing meetings and other domestic competitions.
        </p>

        <h2 className="text-xl font-semibold">
          Monthly Sports Schedule Overview
        </h2>

        <p className="text-sm text-muted-foreground max-w-3xl">
          Ireland hosts an active sporting calendar throughout the year,
          with professional fixtures taking place every week.
          Football and rugby are among the most prominent competitions,
          while horse racing and regional tournaments contribute to the
          national sports schedule.
        </p>

        <h2 className="text-xl font-semibold">
          Major Sports Covered
        </h2>

        <p className="text-sm text-muted-foreground max-w-3xl">
          The fixture explorer includes events from multiple professional
          sports including football, rugby union, cricket and horse racing.
          Fixtures are hosted across major Irish sporting cities including
          Dublin, Cork, Limerick and Galway.
        </p>

      </section>

      <ReportsDashboard
        events={irelandEvents}
        countryScope="ireland"
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