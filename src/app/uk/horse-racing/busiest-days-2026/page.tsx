// src/app/uk/horse-racing/busiest-days-2026/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";
import { BusiestDaysToggle } from "@/app/components/BusiestDaysToggle";

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

  /* ===== Filter UK 2026 Horse Racing ===== */

  const racing2026 = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);

    return (
      e.sport === "horse-racing" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      year === "2026"
    );
  });

  const totalMeetings = racing2026.length;

  /* ===== Group by Date ===== */

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
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const peak = sorted[0] ?? null;

  /* ===== Structured Data ===== */

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

  /* ===== UI ===== */

  return (
    <main className="max-w-3xl mx-auto px-6 py-14 space-y-12">

      {/* ===== HEADER ===== */}

      <header className="space-y-4 border-b pb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          National Overlap Report
        </p>

        <h1 className="text-3xl font-bold">
          Busiest UK Horse Racing Days – 2026
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Ranking of the highest-volume racing days across the United Kingdom
          during the 2026 season, based on total concurrent meetings.
        </p>
      </header>

      {/* ===== KPI SUMMARY ===== */}

      <section className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center border-t pt-8">
        <Stat title="Total Meetings (2026)" value={totalMeetings} />
        <Stat title="Active Racing Days" value={activeDays} />
        <Stat title="Avg Meetings / Day" value={avgPerActiveDay} />
        <Stat title="Peak Single Day" value={peak?.[1] ?? 0} />
      </section>

      {/* ===== INTERPRETATION ===== */}

      <section className="text-sm text-muted-foreground leading-relaxed space-y-4 border-t pt-8">
        <h2 className="font-semibold text-black">
          Structural Congestion Insight
        </h2>

        {peak && (
          <p>
            The highest daily volume reached{" "}
            <strong>{peak[1]}</strong> concurrent meetings
            on <strong>{peak[0]}</strong>,
            significantly above the national daily average of{" "}
            <strong>{avgPerActiveDay}</strong>.
          </p>
        )}

        <p>
          High-density racing days increase national overlap,
          intensify broadcast competition and compress operational
          scheduling across UK racecourses.
        </p>
      </section>

      {/* ===== TOP 20 LIST ===== */}

      <section className="pt-10 border-t space-y-6">
        <h2 className="text-xl font-semibold">
          Top 20 Highest-Volume Racing Days
        </h2>

        <BusiestDaysToggle
          days={sorted}
          allEvents={racing2026}
        />
      </section>
      {/* ===== INTERNAL LINKS ===== */}

      <section className="pt-10 border-t text-sm space-y-2">
        <h2 className="font-semibold">Related 2026 Reports</h2>
        <ul className="underline space-y-1">
          <li>
            <Link
              href="/uk/horse-racing"
            >
              UK Horse Racing Hub→
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

      {/* ===== STRUCTURED DATA ===== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleData),
        }}
      />

    </main>
  );
}

/* ===== STAT COMPONENT ===== */

function Stat({ title, value }: any) {
  return (
    <div className="border rounded-2xl p-6 bg-white">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="text-3xl font-semibold mt-2">
        {value}
      </p>
    </div>
  );
}