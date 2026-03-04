// src/app/uk/horse-racing/month/2026/[month]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";
import ReportsDashboard from "@/app/reports/ReportsDashboard";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

function formatMonthDisplay(month: string) {
  const date = new Date(`2026-${month}-01`);
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
  params: { month: string };
}): Promise<Metadata> {

  const { month } = params;

  if (!/^(0[1-9]|1[0-2])$/.test(month)) return {};

  const displayMonth = formatMonthDisplay(month);

  return {
    title: `UK Horse Racing Fixtures – ${displayMonth} | VenueScope`,
    description: `Horse racing meetings across the United Kingdom during ${displayMonth}.`,
    alternates: {
      canonical: `https://venuescope.io/uk/horse-racing/month/2026/${month}`,
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
  params: Promise<{ month: string }>;
}) {

  const { month } = await params;

  if (!/^(0[1-9]|1[0-2])$/.test(month)) {
    notFound();
  }

  const prefix = `2026-${month}`;
  const displayMonth = formatMonthDisplay(month);

  /* ================= DATA FETCH ================= */

  const events = await getHorseRacingEventsRaw();

  /* ================= FILTER ================= */

  const ukHorseRacingEvents = events.filter((e: any) => {

    const eventMonth =
      (e.startDate ?? "").slice(0, 7);

    return (
      e.sport === "horse-racing" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventMonth === prefix
    );

  });

  /* ================= 404 IF NO DATA ================= */

  if (ukHorseRacingEvents.length === 0) {
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
        name: "UK Horse Racing",
        item: "https://venuescope.io/uk/horse-racing",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/uk/horse-racing/month/2026/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `UK Horse Racing Fixtures ${displayMonth}`,
    description: `Monthly horse racing meeting schedule across the UK during ${displayMonth}.`,
    url: `https://venuescope.io/uk/horse-racing/month/2026/${month}`,
  };

  /* ================= PAGE ================= */

  return (
    <>
      {/* SEO TEXT */}

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          UK Horse Racing Fixtures – {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          This page provides a complete overview of horse racing
          meetings taking place across the United Kingdom during
          {displayMonth}. Fixtures include race meetings hosted
          at major racecourses throughout England, Scotland,
          Wales and Northern Ireland.
        </p>

      </section>

      {/* DASHBOARD */}

      <ReportsDashboard
        events={ukHorseRacingEvents}
        countryScope="uk"
        initialSport="horse-racing"   // ✅ 여기 수정
        initialYear="2026"
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