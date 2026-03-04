//src/app/sport/_components/HorseRacingBusiestDays2026.tsx

"use client";

import Link from "next/link";
import { BusiestDaysToggle } from "@/app/components/BusiestDaysToggle";

export default function HorseRacingBusiestDays2026({
  events,
}: {
  events: any[];
}) {
  /* ===== Filter UK 2026 ===== */

  const racing2026 = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);

    return (
      e.sport === "horse-racing" &&
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

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 space-y-12">

      {/* ===== HEADER ===== */}

      <header className="space-y-4 border-b pb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          National Overlap Report
        </p>

        <h2 className="text-2xl font-bold">
          Busiest Horse Racing Days – 2026
        </h2>

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
        <h3 className="font-semibold text-black">
          Structural Congestion Insight
        </h3>

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
        <h3 className="text-xl font-semibold">
          Top 20 Highest-Volume Racing Days
        </h3>

        <BusiestDaysToggle
          days={sorted}
          allEvents={racing2026}
        />
      </section>

      {/* ===== STRUCTURED DATA ===== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleData),
        }}
      />

    </section>
  );
}

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