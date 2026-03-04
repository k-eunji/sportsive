// src/app/uk/horse-racing/busiest-days-2026/page.tsx

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
    "Busiest UK Horse Racing Days 2026 – Peak Meeting Volume & Overlap Analysis",
  description:
    "Identify the busiest UK horse racing days in 2026 based on total concurrent meetings and national scheduling density.",
};

export default async function Page() {

  const events = await getHorseRacingEventsRaw();

  /* ===============================
     UK FILTER
  =============================== */

  const ukEvents = events.filter((e: any) => {
    const region = (e.region ?? "")
      .toLowerCase()
      .trim();

    return UK_REGIONS.includes(region);
  });

  const racing2026 = ukEvents.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);
    return year === "2026";
  });

  /* ===============================
     BASIC STATS
  =============================== */

  const totalMeetings = racing2026.length;

  const grouped: Record<string, number> = {};

  racing2026.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    grouped[d] = (grouped[d] || 0) + 1;
  });

  const activeDays = Object.keys(grouped).length;

  const avgPerActiveDay =
    activeDays > 0
      ? Math.round(totalMeetings / activeDays)
      : 0;

  const sorted = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1]);

  const peak = sorted[0] ?? null;

  /* ===============================
     STRUCTURED DATA
  =============================== */

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Busiest UK Horse Racing Days 2026",
    description:
      "Analysis of the highest-density UK horse racing days in 2026 based on concurrent national meetings.",
    author: {
      "@type": "Organization",
      name: "VenueScope",
    },
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
          Busiest UK Horse Racing Days – 2026
        </h1>

        <p className="text-muted-foreground">
          {totalMeetings} meetings · {activeDays} racing days · peak national scheduling density
        </p>

      </header>

      {/* SUMMARY */}

      <section className="text-sm text-muted-foreground leading-relaxed max-w-3xl">

        {peak && (
          <p>
            The busiest racing day in 2026 recorded{" "}
            <strong>{peak[1]}</strong> concurrent meetings
            on <strong>{peak[0]}</strong>, significantly
            above the national daily average of{" "}
            <strong>{avgPerActiveDay}</strong>.
          </p>
        )}

        <p>
          High-density racing days increase national overlap,
          intensify broadcast competition and compress
          operational scheduling across UK racecourses.
        </p>

      </section>

      {/* SPORT PAGE CONTENT (TABS + BUSIEST DAYS) */}

      <HorseRacingSportPage
        events={ukEvents}
        tab="busiest"
        course={null}
      />

      {/* INTERNAL LINKS */}

      <section className="pt-10 border-t text-sm space-y-2">

        <h2 className="font-semibold">
          Related 2026 Reports
        </h2>

        <ul className="underline space-y-1">

          <li>
            <Link href="/uk/horse-racing">
              UK Horse Racing Hub →
            </Link>
          </li>

          <li>
            <Link href="/uk/horse-racing/calendar-2026">
              Full UK Horse Racing Calendar 2026
            </Link>
          </li>

          <li>
            <Link href="/uk/horse-racing/courses">
              Course Ranking & Structural Density
            </Link>
          </li>

          <li>
            <Link href="/uk/horse-racing/overlap-report-2026">
              National Overlap Report
            </Link>
          </li>

        </ul>

      </section>

      {/* STRUCTURED DATA */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleData),
        }}
      />

    </main>
  );
}