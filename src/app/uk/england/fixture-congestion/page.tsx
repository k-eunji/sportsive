//src/app/uk/england/fixture-congestion/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title:
    "England Fixture Congestion — Live Match Overlap & Scheduling Analysis",
  description:
    "Live fixture congestion analysis across England, highlighting peak kickoff overlap windows, concurrent professional fixtures and operational scheduling pressure.",
  alternates: {
    canonical: "https://venuescope.io/uk/england/fixture-congestion",
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

  /* ===================== FILTER ===================== */

  const englandEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.region?.toLowerCase() === "england" &&
      eventKey === todayKey
    );
  });

  /* ===================== HOURLY ===================== */

  const hourMap = new Map<number, number>();

  englandEvents.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    const d = new Date(raw);
    if (isNaN(d.getTime())) return;

    const hourString = d.toLocaleString("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Europe/London",
    });

    const h = Number(hourString);
    hourMap.set(h, (hourMap.get(h) ?? 0) + 1);
  });

  const sortedHours = [...hourMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const peak = sortedHours[0];

  const peakRatio =
    peak && englandEvents.length > 0
      ? Math.round((peak[1] / englandEvents.length) * 100)
      : 0;

  /* ===================== COMPETITION ===================== */

  const competitionMap = new Map<string, number>();

  englandEvents.forEach((e: any) => {
    const key = e.competition ?? e.sport ?? "Other";
    competitionMap.set(key, (competitionMap.get(key) ?? 0) + 1);
  });

  const topCompetitions = [...competitionMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* ===================== STRUCTURED DATA ===================== */

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `England Fixture Congestion Report — ${displayDate}`,
    description:
      "Live fixture congestion analysis across England, highlighting peak kickoff overlap windows, concurrent professional fixtures and operational scheduling pressure.",
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
      "@id": "https://venuescope.io/uk/england/fixture-congestion",
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
        name: "England",
        item: "https://venuescope.io/uk/england/fixture-congestion",
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

      <header className="space-y-1">

        <h1 className="text-4xl font-bold leading-tight">
          England Fixture Congestion Report — {displayDate}
        </h1>

        <p className="text-muted-foreground leading-relaxed">
          A total of {englandEvents.length} professional sporting
          fixture{englandEvents.length !== 1 ? "s" : ""} are
          scheduled across England today.
        </p>

      </header>

      {/* ================= KPI BLOCK ================= */}

      <section className="border rounded-xl p-8 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total fixtures
            </p>
            <p className="text-3xl font-semibold">
              {englandEvents.length}
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

      </section>

      {/* ================= KICKOFF ANALYSIS ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Kickoff overlap analysis
        </h2>

        {peak && (
          <p className="text-muted-foreground leading-relaxed">
            The primary overlap window occurs at {peak[0]}:00 with{" "}
            {peak[1]} concurrent fixture
            {peak[1] !== 1 ? "s" : ""}.
            Approximately {peakRatio}% of fixtures were concentrated
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

      {/* ================= COMPETITION ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Competition contribution
        </h2>

        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          {topCompetitions.map(([name, count]) => (
            <li key={name}>
              {name} — {count} fixture
              {count !== 1 ? "s" : ""}
            </li>
          ))}
        </ul>

      </section>

      {/* ================= REGIONAL PATTERN ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Regional concentration patterns
        </h2>

        <p className="text-muted-foreground leading-relaxed">
          Event clustering may be concentrated in metropolitan
          areas such as London, Manchester and Birmingham,
          increasing transport demand, stewarding requirements
          and policing coordination pressure.
        </p>

      </section>

      {/* ================= OPERATIONAL ================= */}

      <section className="space-y-6">

        <h2 className="text-2xl font-semibold">
          Operational interpretation
        </h2>

        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Referee and officiating deployment</li>
          <li>Broadcast scheduling coordination</li>
          <li>Police and emergency service planning</li>
          <li>Matchday staffing and steward allocation</li>
        </ul>

      </section>

      {/* ================= NAVIGATION ================= */}

      <section className="space-y-6 border-t">

        <Link
          href="/uk/fixture-congestion"
          className="underline underline-offset-4"
        >
          View national UK congestion overview →
        </Link>

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
