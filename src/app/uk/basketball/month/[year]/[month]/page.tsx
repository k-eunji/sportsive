//src/app/uk/basketball/month/[year]/[month]/page.tsx

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
    title: `UK Basketball Fixtures – ${displayMonth} | SLB Schedule (Former BBL)`,
    description: `Complete schedule of basketball fixtures across the United Kingdom during ${displayMonth}. Includes Super League Basketball (SLB) games — the league that replaced the former British Basketball League (BBL).`,
    alternates: {
      canonical: `https://venuescope.io/uk/basketball/month/${year}/${month}`,
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

  const events = await getAllEventsRaw("180d");

  const ukBasketballEvents = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      e.sport?.toLowerCase() === "basketball" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventMonth === prefix
    );
  });

  if (ukBasketballEvents.length === 0) {
    notFound();
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "UK Basketball",
        item: "https://venuescope.io/uk/basketball",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/uk/basketball/month/${year}/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `UK Basketball Fixtures ${displayMonth}`,
    description: `Monthly basketball schedule across the United Kingdom during ${displayMonth}.`,
    url: `https://venuescope.io/uk/basketball/month/${year}/${month}`,
  };

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          UK Basketball Fixtures & BBL Schedule – {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          This page provides a complete overview of professional basketball
          fixtures taking place across the United Kingdom during {displayMonth}.
          The monthly schedule includes Super League Basketball (SLB) games,
          the league that replaced the former British Basketball League (BBL),
          along with other professional basketball fixtures across England,
          Scotland, Wales and Northern Ireland.
        </p>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Super League Basketball (SLB) is the top professional basketball league
          in the United Kingdom, replacing the former British Basketball League (BBL)
          in 2024.
          </p>

      </section>

      <ReportsDashboard
        events={ukBasketballEvents}
        countryScope="uk"
        initialSport="basketball"
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