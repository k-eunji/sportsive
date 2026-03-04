// src/app/uk/horse-racing/calendar-2026/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";

import SportFilterBar from "@/app/sport/_components/SportFilterBar";
import HorseRacingSportPage from "@/app/sport/_components/HorseRacingSportPage";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

export const metadata: Metadata = {
  title:
    "UK Horse Racing Calendar 2026 – Total Meetings, Busiest Days & Overlap Analysis",
  description:
    "Complete 2026 horse racing calendar for the United Kingdom. Analyse total race meetings, busiest days, monthly distribution and peak racing periods.",
};

export default async function Page() {

  const events = await getHorseRacingEventsRaw();

  /* ======================================================
     UK FILTER
  ====================================================== */

  const ukEvents = events.filter((e: any) => {
    const region = (e.region ?? "")
      .toLowerCase()
      .trim();

    return UK_REGIONS.includes(region);
  });

  const uk2026 = ukEvents.filter((e: any) => {
    const date = e.startDate ?? e.date;
    if (!date) return false;

    return date.slice(0, 4) === "2026";
  });

  /* ======================================================
     BASIC STATS
  ====================================================== */

  const totalMeetings = uk2026.length;

  const groupedByDate: Record<string, number> = {};

  uk2026.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    groupedByDate[d] = (groupedByDate[d] || 0) + 1;
  });

  const activeDays = Object.keys(groupedByDate).length;

  const sortedDays = Object.entries(groupedByDate).sort(
    (a, b) => b[1] - a[1]
  );

  const busiestDay = sortedDays[0] ?? null;

  const avgPerDay =
    activeDays > 0
      ? Math.round(totalMeetings / activeDays)
      : 0;

  const saturdayMeetings = uk2026.filter((e: any) => {
    const d = new Date(e.startDate);
    return d.getDay() === 6;
  }).length;

  const saturdayShare =
    totalMeetings > 0
      ? Math.round((saturdayMeetings / totalMeetings) * 100)
      : 0;

  const congestionScore = Math.min(
    100,
    Math.round(avgPerDay * 10 + saturdayShare)
  );

  const monthMap: Record<string, number> = {};

  uk2026.forEach((e: any) => {
    const m = (e.startDate ?? "").slice(0, 7);
    monthMap[m] = (monthMap[m] || 0) + 1;
  });

  const peakMonth = Object.entries(monthMap).sort(
    (a, b) => b[1] - a[1]
  )[0];

  /* ======================================================
     FAQ DATA
  ====================================================== */

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          "How many UK horse racing meetings are scheduled in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `There are ${totalMeetings} race meetings scheduled across the United Kingdom in 2026.`,
        },
      },
      {
        "@type": "Question",
        name:
          "What is the busiest UK horse racing day in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: busiestDay
            ? `${busiestDay[0]} recorded the highest national meeting volume with ${busiestDay[1]} concurrent meetings.`
            : "Busiest day data is not available.",
        },
      },
      {
        "@type": "Question",
        name:
          "Which month has the most UK race meetings in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: peakMonth
            ? `${peakMonth[0]} hosts the highest monthly total with ${peakMonth[1]} meetings.`
            : "Monthly peak data is not available.",
        },
      },
      {
        "@type": "Question",
        name:
          "How significant are Saturday fixtures in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Saturday meetings represent ${saturdayShare}% of all UK race meetings in 2026.`,
        },
      },
      {
        "@type": "Question",
        name:
          "Is the 2026 UK racing calendar congested?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `The calendar records an average of ${avgPerDay} meetings per active racing day with a congestion index score of ${congestionScore}/100.`,
        },
      },
    ],
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">

      {/* BACK */}

      <div>
        <Link
          href="/uk/horse-racing"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← UK Horse Racing Hub
        </Link>
      </div>

      {/* FILTER BAR */}

      <SportFilterBar
        slug="horse-racing"
        events={ukEvents}
      />

      {/* HEADER */}

      <header className="space-y-2">

        <h1 className="text-3xl font-bold">
          UK Horse Racing Calendar 2026
        </h1>

        <p className="text-muted-foreground">
          {totalMeetings} meetings · {activeDays} racing days · national fixture calendar
        </p>

      </header>

      {/* SUMMARY */}

      <section className="text-sm leading-relaxed text-muted-foreground max-w-3xl">

        <p>
          The 2026 UK racing calendar includes{" "}
          <strong>{totalMeetings}</strong> meetings across{" "}
          <strong>{activeDays}</strong> active racing days.
          Average daily density stands at{" "}
          <strong>{avgPerDay}</strong> meetings per day,
          while Saturday fixtures represent{" "}
          <strong>{saturdayShare}%</strong> of national activity.
        </p>

      </section>

      {/* SPORT PAGE CONTENT (TABS + CALENDAR) */}

      <HorseRacingSportPage
        events={ukEvents}
        tab="calendar"
        course={null}
      />

      {/* STRUCTURED DATA */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "UK Horse Racing Calendar 2026",
            description:
              "Complete structural overview of UK horse racing meetings in 2026.",
            author: {
              "@type": "Organization",
              name: "VenueScope",
            },
            publisher: {
              "@type": "Organization",
              name: "VenueScope",
            },
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData),
        }}
      />

    </main>
  );
}