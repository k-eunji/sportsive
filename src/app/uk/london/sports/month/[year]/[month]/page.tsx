// src/app/uk/london/sports/month/[year]/[month]/page.tsx

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
    title: `London Sports Fixtures & Event Schedule – ${displayMonth} | VenueScope`,
    description: `Complete London sports fixtures and event schedule for ${displayMonth}. Browse football, rugby, cricket, tennis and major sporting events taking place across stadiums and venues in London.`,
    alternates: {
      canonical: `https://venuescope.io/uk/london/sports/month/${year}/${month}`,
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

  /* ================= FILTER LONDON ================= */

  const londonEvents = events.filter((e: any) => {

    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    const city = e.city?.toLowerCase() ?? "";

    return (
      city.includes("london") &&
      eventMonth === prefix
    );

  });
  /* ================= 404 IF NO DATA ================= */

  if (londonEvents.length === 0) {
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
        name: "London Sports",
        item: "https://venuescope.io/uk/london/sports",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/uk/london/sports/month/${year}/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `London Sports Fixtures ${displayMonth}`,
    description: `Monthly sports fixture schedule for London during ${displayMonth}.`,
    url: `https://venuescope.io/uk/london/sports/month/${year}/${month}`,
    keywords: [
      "London sports fixtures",
      "London sports events",
      "sports schedule London",
      "sport events in London",
      "London sporting events"
    ]
  };
  /* ================= PAGE ================= */

  return (
    <>
      {/* SEO TEXT */}

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          London Sports Fixtures & Event Schedule – {displayMonth}
        </h1>

        <h2 className="text-xl font-semibold mt-10">
        London Sports Event Schedule – {displayMonth}
        </h2>

        <p className="text-sm text-muted-foreground max-w-2xl">
          This page provides a complete overview of professional sports
          fixtures taking place in London during {displayMonth}.
          The schedule includes football, rugby, cricket, tennis,
          horse racing and other professional sporting events
          hosted across stadiums and venues throughout the capital.
        </p>

      </section>

      {/* DASHBOARD */}

      <ReportsDashboard
        events={londonEvents}
        countryScope="uk"
        initialCity="London"
        initialYear={year}
        initialMonth={month}
      />

      {/* STRUCTURED DATA */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              pageSchema,
              breadcrumbSchema
            ]
          }),
        }}
      />
    </>
  );
}