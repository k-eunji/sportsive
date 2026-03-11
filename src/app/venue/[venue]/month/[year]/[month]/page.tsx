// src/app/venue/[venue]/month/[year]/[month]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import ReportsDashboard from "@/app/reports/ReportsDashboard";

function isValidYearMonth(year: string, month: string) {
  return /^\d{4}$/.test(year) && /^(0[1-9]|1[0-2])$/.test(month);
}

function slugify(v?: string) {
  return v?.toLowerCase().replace(/\s+/g, "-") ?? "";
}

function formatVenueName(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
  params: Promise<{ venue: string; year: string; month: string }>;
}): Promise<Metadata> {

  const { venue, year, month } = await params;

  if (!isValidYearMonth(year, month)) return {};

  const venueName = formatVenueName(venue);
  const displayMonth = formatMonthDisplay(year, month);

  return {
    title: `${venueName} Venue Events – ${displayMonth} | Stadium Schedule`,
    description:
      `Explore matches, fights and sporting events taking place at ${venueName}. 
       View stadium events, arena fights, racecourse meetings and competitions during ${displayMonth}.`,
    alternates: {
      canonical: `https://venuescope.io/venue/${venue}/month/${year}/${month}`,
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
  params: Promise<{ venue: string; year: string; month: string }>;
}) {

  const { venue, year, month } = await params;

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

  const venueName = formatVenueName(venue);
  const displayMonth = formatMonthDisplay(year, month);

  const prefix = `${year}-${month}`;

  /* ================= DATA FETCH ================= */

  const events = await getAllEventsRaw("180d");

  /* ================= FILTER ================= */

  const venueEvents = events.filter((e: any) => {

    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      slugify(e.venue) === venue &&
      eventMonth === prefix
    );
  });

  if (venueEvents.length === 0) {
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
        name: venueName,
        item: `https://venuescope.io/venue/${venue}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/venue/${venue}/month/${year}/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${venueName} Venue Events ${displayMonth}`,
    description:
      `Matches, fights and sporting events taking place at ${venueName} during ${displayMonth}.`,
    url: `https://venuescope.io/venue/${venue}/month/${year}/${month}`,
  };

  return (
    <>
      {/* SEO TEXT */}

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          Events at {venueName} – {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          {venueName} is a sporting venue hosting professional matches,
          competitions and events. This page provides a full overview of
          stadium fixtures, arena fights, tennis matches and racecourse
          meetings taking place at this location during {displayMonth}.
        </p>

      </section>

      {/* DASHBOARD */}

      <ReportsDashboard
        events={venueEvents}
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