//src/app/uk/horse-racing/fixture-congestion/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

export const metadata: Metadata = {
  title:
    "UK Horse Racing Fixture Congestion Today | Meeting Overlap Analysis",
  description:
    "Live UK horse racing congestion report highlighting concurrent race meetings, peak overlap windows and national scheduling density.",
  alternates: {
    canonical:
      "https://venuescope.io/uk/horse-racing/fixture-congestion",
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

  /* ================= FILTER ================= */

  const racingEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      e.sport?.toLowerCase().includes("horse") &&
      eventKey === todayKey
    );
  });

  /* ================= OVERLAP ================= */

  const activeMap = new Map<number, number>();

  for (let hour = 0; hour < 24; hour++) {
    activeMap.set(hour, 0);
  }

  racingEvents.forEach((e: any) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);

    for (let h = 0; h < 24; h++) {
      const check = new Date(today);
      check.setHours(h, 0, 0, 0);

      if (check >= start && check <= end) {
        activeMap.set(h, (activeMap.get(h) ?? 0) + 1);
      }
    }
  });

  const sortedHours = [...activeMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const peak = sortedHours[0];

  const peakRatio =
    peak && racingEvents.length > 0
      ? Math.round((peak[1] / racingEvents.length) * 100)
      : 0;

  /* ================= SESSION BREAKDOWN ================= */

  const sessionMap = new Map<string, number>();

  racingEvents.forEach((e: any) => {
    const key = e.sessionTime ?? "Other";
    sessionMap.set(key, (sessionMap.get(key) ?? 0) + 1);
  });

  const sessions = [...sessionMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  /* ================= STRUCTURED DATA ================= */

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `UK Horse Racing Fixture Congestion — ${displayDate}`,
    description:
      "Live UK horse racing congestion report highlighting concurrent race meetings, peak overlap windows and national scheduling density.",
    author: {
      "@type": "Organization",
      name: "VenueScope",
    },
    publisher: {
      "@type": "Organization",
      name: "VenueScope",
    },
    datePublished: todayKey,
    dateModified: todayKey,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://venuescope.io/uk/horse-racing/fixture-congestion",
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Horse Racing",
        item: "https://venuescope.io/uk/horse-racing/fixture-congestion",
      },
    ],
  };

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
          UK Horse Racing Fixture Congestion — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {racingEvents.length} race meeting
          {racingEvents.length !== 1 ? "s" : ""} are
          scheduled across the United Kingdom today.
        </p>
      </header>

      {/* ================= KPI ================= */}

      {racingEvents.length > 0 && (
        <section className="border rounded-xl p-8 space-y-6">

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total meetings
              </p>
              <p className="text-3xl font-semibold">
                {racingEvents.length}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Peak overlap hour
              </p>
              <p className="text-3xl font-semibold">
                {peak ? `${peak[0]}:00` : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Concurrent meetings
              </p>
              <p className="text-3xl font-semibold">
                {peak ? peak[1] : "—"}
              </p>
            </div>
          </div>

        </section>
      )}

      {/* ================= SESSION BREAKDOWN ================= */}

      {sessions.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">
            Session distribution
          </h2>

          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            {sessions.map(([name, count]) => (
              <li key={name}>
                {name} — {count} meeting
                {count !== 1 ? "s" : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

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
