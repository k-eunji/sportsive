// src/app/uk/fight/month/[year]/[month]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllEvents } from "@/lib/events/getAllEvents";
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
  params: Promise<{ year: string; month: string }>;
}): Promise<Metadata> {

  const { year, month } = await params;

  if (!isValidYearMonth(year, month)) return {};

  const displayMonth = formatMonthDisplay(year, month);

  return {
    title: `Fight Events – ${displayMonth} | VenueScope`,
    description:
      `MMA events including UFC and Cage Warriors plus boxing fight cards during ${displayMonth}.`,
    alternates: {
      canonical: `https://venuescope.io/uk/fight/month/${year}/${month}`,
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

  const displayMonth = formatMonthDisplay(year, month);

  const prefix = `${year}-${month}`;

  /* ================= DATA ================= */

  const { events } = await getAllEvents("all");

  /* ================= FILTER ================= */

  const fightEvents = events.filter((e: any) => {

    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return false;

    const d = new Date(raw);

    const eventYear = d.getUTCFullYear().toString();
    const eventMonth = String(d.getUTCMonth() + 1).padStart(2, "0");

    return (
      e.sport?.toLowerCase() === "fight" &&
      eventYear === year &&
      eventMonth === month
    );
  });
  
  if (fightEvents.length === 0) {
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
        name: "Fight Events",
        item: "https://venuescope.io/uk/fight",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/uk/fight/month/${year}/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Fight Events ${displayMonth}`,
    description:
      `UK fight events during ${displayMonth}. MMA events including UFC, Cage Warriors and PFL plus major boxing fight cards and bareknuckle fights.`,
    url: `https://venuescope.io/uk/fight/month/${year}/${month}`,
  };

  /* ================= PAGE ================= */

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          Fight Events – {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Browse fight events during {displayMonth} including MMA events such as
          UFC, Cage Warriors and PFL, plus major boxing fight cards and
          bareknuckle fights across the UK and Ireland.
        </p>

      </section>

      <ReportsDashboard
        events={fightEvents}
        countryScope="uk"
        initialSport="fight"
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