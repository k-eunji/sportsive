// src/app/uk/fixture-congestion/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title:
    "UK Fixture Congestion Today | National Kickoff Overlap Report",
  description:
    "Live national fixture congestion report across the United Kingdom, highlighting peak kickoff overlap, regional distribution and operational scheduling density.",
  alternates: {
    canonical: "https://venuescope.io/uk/fixture-congestion",
  },
};

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export default async function Page() {
  const events = await getAllEventsRaw("180d");

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const displayDate = formatDisplayDate(today);

  const UK_REGIONS = [
    "england",
    "scotland",
    "wales",
    "northern ireland",
  ];

  const ukEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === todayKey
    );
  });

  /* =========================
     HOURLY ANALYSIS
  ========================= */

  const hourMap = new Map<number, number>();

  ukEvents.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    const d = new Date(raw);
    if (isNaN(d.getTime())) return;

    const hour = Number(
      d.toLocaleString("en-GB", {
        hour: "2-digit",
        hour12: false,
        timeZone: "Europe/London",
      })
    );

    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
  });

  const sortedHours = [...hourMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const peak = sortedHours[0];

  const peakRatio =
    peak && ukEvents.length > 0
      ? Math.round((peak[1] / ukEvents.length) * 100)
      : 0;

  const congestionLevel =
    peak && peak[1] >= 6
      ? "High"
      : peak && peak[1] >= 3
      ? "Moderate"
      : "Low";

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `UK Fixture Congestion Report — ${displayDate}`,
    description:
      "Live national fixture congestion report across the United Kingdom, highlighting peak kickoff overlap and regional scheduling density.",
    author: {
      "@type": "Organization",
      name: "VenueScope",
    },
    publisher: {
      "@type": "Organization",
      name: "VenueScope",
      logo: {
        "@type": "ImageObject",
        url: "https://venuescope.io/logo.png",
      },
    },
    datePublished: todayKey,
    dateModified: todayKey,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://venuescope.io/uk/fixture-congestion",
    },
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "UK Fixture Congestion",
        item: "https://venuescope.io/uk/fixture-congestion",
      },
    ],
  };


  /* =========================
     REGIONAL DISTRIBUTION
  ========================= */

  const regionMap = new Map<string, number>();

  ukEvents.forEach((e: any) => {
    const region = e.region ?? "Other";
    regionMap.set(region, (regionMap.get(region) ?? 0) + 1);
  });

  const regionBreakdown = [...regionMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  /* =========================
     RECENT DATES
  ========================= */

  const recentDates = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (i + 1));
    return {
      key: d.toISOString().slice(0, 10),
      label: formatDisplayDate(d),
    };
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleData),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />

      {/* ================= HEADER ================= */}

      <header className="space-y-6 border-b border-border/30">

        <h1 className="text-4xl font-bold leading-tight">
          UK Fixture Congestion Report — {displayDate}
        </h1>

        <p className="text-muted-foreground leading-relaxed">
          A total of {ukEvents.length} professional fixtures are
          scheduled across the United Kingdom today.
        </p>

      </header>

      {/* ================= KPI BLOCK ================= */}

      <section className="border rounded-xl p-8 space-y-6">

        <div className="grid grid-cols-3 gap-6">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total fixtures
            </p>
            <p className="text-3xl font-semibold">
              {ukEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Peak kickoff hour
            </p>
            <p className="text-3xl font-semibold">
              {peak ? `${peak[0]}:00` : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Peak share
            </p>
            <p className="text-3xl font-semibold">
              {peak ? `${peakRatio}%` : "—"}
            </p>
          </div>

        </div>

        <p className="text-sm text-muted-foreground">
          Overall congestion level:{" "}
          <strong>{congestionLevel}</strong>
        </p>

      </section>

      {/* ================= KICKOFF ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Kickoff overlap analysis
        </h2>

        {peak && (
          <p className="text-muted-foreground leading-relaxed">
            The primary overlap window occurs at {peak[0]}:00 with{" "}
            {peak[1]} concurrent fixtures nationwide.
            Approximately {peakRatio}% of today’s fixtures are
            concentrated within this period.
          </p>
        )}

        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          {sortedHours.slice(0, 3).map(([hour, count]) => (
            <li key={hour}>
              {hour}:00 — {count} concurrent fixture
              {count !== 1 ? "s" : ""}
            </li>
          ))}
        </ul>

      </section>

      {/* ================= REGIONAL ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Regional distribution
        </h2>

        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          {regionBreakdown.map(([region, count]) => (
            <li key={region}>
              {region} — {count} fixture{count !== 1 ? "s" : ""}
            </li>
          ))}
        </ul>

      </section>

      {/* ================= OPERATIONAL ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Operational interpretation
        </h2>

        <p className="text-muted-foreground leading-relaxed">
          Elevated national fixture congestion can influence referee
          allocation, broadcast slot prioritisation, transport capacity,
          policing coverage and stadium staffing distribution.
          Overlapping kickoff windows increase concurrent operational demand.
        </p>

      </section>

      {/* ================= ARCHIVE ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Recent congestion reports
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          {recentDates.map((d) => (
            <li key={d.key}>
              <Link
                href={`/uk/fixture-congestion/${d.key}`}
                className="underline underline-offset-4"
              >
                UK Fixture Congestion — {d.label}
              </Link>
            </li>
          ))}
        </ul>

      </section>

      {/* ================= CTA ================= */}

      <section className="space-y-6">

        <Link
          href="/ops"
          className="inline-block px-5 py-3 rounded-md bg-black text-white text-sm font-medium"
        >
          Open Operations Dashboard →
        </Link>

      </section>

    </main>
  );

}
