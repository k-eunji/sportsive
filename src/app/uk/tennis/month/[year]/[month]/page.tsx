//src/app/uk/tennis/month/[year]/[month]/page.tsx

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
  params: Promise<{ year: string; month: string }>;
}): Promise<Metadata> {

  const { year, month } = await params;

  if (!isValidYearMonth(year, month)) return {};

  const displayMonth = formatMonthDisplay(year, month);

  return {
    title: `Tennis Events – ${displayMonth} | UK Tennis Tournaments`,
    description:
      `Professional tennis tournaments taking place across the UK during ${displayMonth}, including ATP, WTA and Challenger events.`,

    alternates: {
      canonical: `https://venuescope.io/uk/tennis/month/${year}/${month}`,
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

  /* ================= DATA ================= */

  const events = await getAllEventsRaw("all");

  /* ================= FILTER ================= */

  const tennisEvents = events.filter((e: any) => {

    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return false;

    const d = new Date(raw);

    const eventYear = d.getUTCFullYear().toString();
    const eventMonth = String(d.getUTCMonth() + 1).padStart(2, "0");

    return (
      e.sport?.toLowerCase() === "tennis" &&
      eventYear === year &&
      eventMonth === month
    );
  });

  if (tennisEvents.length === 0) {
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
        name: "Tennis Events",
        item: "https://venuescope.io/uk/tennis",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayMonth,
        item: `https://venuescope.io/uk/tennis/month/${year}/${month}`,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",

    name: `Tennis Events ${displayMonth}`,

    description:
      `Professional tennis tournaments across the United Kingdom during ${displayMonth}, including ATP, WTA and Challenger events.`,

    url: `https://venuescope.io/uk/tennis/month/${year}/${month}`,
  };

  /* ================= PAGE ================= */

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">

        <h1 className="text-3xl font-bold">
          Tennis Events – {displayMonth}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Browse tennis tournaments taking place across the UK during {displayMonth}.
          Events include ATP, WTA, Challenger tournaments and major international
          competitions held in venues such as London, Birmingham and Nottingham.
        </p>

      </section>

      <ReportsDashboard
        events={tennisEvents}
        countryScope="uk"
        initialSport="tennis"
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