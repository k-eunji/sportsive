//src/app/ireland/horse-racing/courses/[slug]/page.tsx

import { notFound } from "next/navigation";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";
import { CourseMonthToggle } from "@/app/components/CourseMonthToggle";
import Link from "next/link";

const IRELAND_REGIONS = ["ireland", "republic of ireland"];

/* =========================
   SLUG HELPER
========================= */

function slugifyVenue(name: string) {
  return name
    .toLowerCase()
    .replace(" racecourse", "")
    .replace(" race course", "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/* =========================
   STATIC PARAMS
========================= */

export async function generateStaticParams() {
  const events = await getHorseRacingEventsRaw();

  const venues = new Set<string>();

  events.forEach((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);

    if (
      IRELAND_REGIONS.includes(e.region?.toLowerCase()) &&
      year === "2026" &&
      e.venue
    ) {
      venues.add(e.venue);
    }
  });

  return Array.from(venues).map((venue) => ({
    slug: slugifyVenue(venue),
  }));
}

/* =========================
   PAGE
========================= */

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const events = await getHorseRacingEventsRaw();

  /* ---------- find venue safely ---------- */

  const venueName =
    events.find(
      (e: any) => slugifyVenue(e.venue ?? "") === slug
    )?.venue ?? null;

  if (!venueName) notFound();

  /* ---------- filter 2026 events ---------- */

  const courseEvents = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);

    return (
      IRELAND_REGIONS.includes(e.region?.toLowerCase()) &&
      year === "2026" &&
      slugifyVenue(e.venue ?? "") === slug
    );
  });

  const total = courseEvents.length;

  /* ---------- national context ---------- */

  const allIreland2026 = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);
    return (
      IRELAND_REGIONS.includes(e.region?.toLowerCase()) &&
      year === "2026" &&
      e.venue
    );
  });

  const nationalVenueMap: Record<string, number> = {};

  allIreland2026.forEach((e: any) => {
    nationalVenueMap[e.venue] =
      (nationalVenueMap[e.venue] || 0) + 1;
  });

  const totals = Object.values(nationalVenueMap).sort((a, b) => a - b);

  const nationalMedian =
    totals.length === 0
      ? 0
      : totals.length % 2 === 0
      ? Math.round(
          (totals[totals.length / 2 - 1] +
            totals[totals.length / 2]) / 2
        )
      : totals[Math.floor(totals.length / 2)];

  const nationalShare =
    allIreland2026.length > 0
      ? ((total / allIreland2026.length) * 100).toFixed(1)
      : "0";

  /* ---------- group by date ---------- */

  const groupedByDate: Record<string, number> = {};

  courseEvents.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    groupedByDate[d] = (groupedByDate[d] || 0) + 1;
  });

  const activeDays = Object.keys(groupedByDate).length;

  const avgPerDay =
    activeDays > 0 ? Math.round(total / activeDays) : 0;

  /* ---------- saturday share ---------- */

  const saturdayCount = courseEvents.filter((e: any) => {
    const d = new Date(e.startDate);
    return d.getDay() === 6;
  }).length;

  const saturdayShare =
    total > 0 ? Math.round((saturdayCount / total) * 100) : 0;

  /* ---------- congestion index ---------- */

  const congestionScore = Math.min(
    100,
    Math.round(avgPerDay * 10 + saturdayShare)
  );

  /* ---------- month grouping ---------- */

  const eventsByMonth: Record<string, any[]> = {};
  const monthMap: Record<string, number> = {};

  courseEvents.forEach((e: any) => {
    const monthKey = (e.startDate ?? "").slice(0, 7);

    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = [];
    }

    eventsByMonth[monthKey].push(e);
    monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
  });

  const orderedMonths = Object.keys(eventsByMonth).sort();

  const peakMonth = Object.entries(monthMap).sort(
    (a, b) => b[1] - a[1]
  )[0];

  /* =========================
     STRUCTURED DATA
  ========================= */

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How many meetings are held at ${venueName} in 2026?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${venueName} hosts ${total} race meetings in 2026 across ${activeDays} active racing days.`,
        },
      },
      {
        "@type": "Question",
        name: `How significant are Saturday fixtures at ${venueName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Saturday meetings represent ${saturdayShare}% of total fixtures at ${venueName} in 2026.`,
        },
      },
    ],
  };

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${venueName} 2026 Horse Racing Overview`,
    description: `Structural analysis of race meetings held at ${venueName} during the 2026 Ireland horse racing season.`,
    author: {
      "@type": "Organization",
      name: "VenueScope",
    },
  };

  /* =========================
     UI
  ========================= */

  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-12">

      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          {venueName} – 2026 Racing Overview
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Analytical breakdown of meeting frequency, weekend concentration,
          seasonal peaks and structural congestion patterns for the 2026
          racing calendar at {venueName}.
        </p>
      </header>

      <div className="text-xs text-muted-foreground">
        <Link href="/ireland/horse-racing/calendar-2026" className="hover:underline">
          Ireland Calendar 2026
        </Link>
        {" / "}
        <Link href="/ireland/horse-racing/courses" className="hover:underline">
          All Courses
        </Link>
        {" / "}
        <span>{venueName}</span>
      </div>

      {/* ===== KEY METRICS ===== */}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <Stat title="Total Meetings" value={total} />
        <Stat title="Active Racing Days" value={activeDays} />
        <Stat title="Saturday Share" value={`${saturdayShare}%`} />
        <Stat title="Congestion Index" value={`${congestionScore}/100`} />
      </section>

      <section className="text-sm text-muted-foreground leading-relaxed space-y-4">
        <h2 className="font-semibold text-base text-black">
          What Do These Metrics Mean?
        </h2>

        <p>
          <strong>Total Meetings</strong> represents the number of
          scheduled race meetings held at {venueName} during the 2026 season.
        </p>

        <p>
          <strong>Active Racing Days</strong> measures how many distinct calendar
          days the course operates, helping to understand operational spread.
        </p>

        <p>
          <strong>Saturday Share</strong> highlights weekend concentration.
          Higher values indicate stronger competition for national attention.
        </p>

        <p>
          <strong>Congestion Index</strong> combines daily density and weekend
          concentration into a single structural intensity score.
        </p>
      </section>

      {peakMonth && (
        <section className="border rounded-2xl p-6">
          <h2 className="font-semibold mb-2">
            Peak Activity Month
          </h2>
          <p className="text-sm text-muted-foreground">
            {peakMonth[0]} recorded the highest meeting volume
            with {peakMonth[1]} scheduled fixtures.
          </p>
        </section>
      )}

      <section className="space-y-6 pt-6 border-t">
        <h2 className="text-xl font-semibold tracking-tight">
          Monthly Distribution – 2026
        </h2>

        <div className="space-y-2">
          {orderedMonths.map((monthKey) => (
            <CourseMonthToggle
              key={monthKey}
              monthKey={monthKey}
              events={eventsByMonth[monthKey]}
              courseTotal={total}
            />
          ))}
        </div>
      </section>

      <section className="text-sm text-muted-foreground leading-relaxed space-y-4">
        <h2 className="font-semibold text-base text-black">
          Strategic Interpretation
        </h2>

        <p>
          With an average of{" "}
          <strong>{avgPerDay}</strong> meetings per active racing day,
          {venueName} demonstrates{" "}
          {avgPerDay > 1 ? "clustered scheduling" : "balanced distribution"}{" "}
          across the season.
        </p>

        <p>
          A congestion score of{" "}
          <strong>{congestionScore}/100</strong> suggests
          {congestionScore > 60
            ? " a high-density competitive structure."
            : " a moderate structural intensity."}
        </p>

        <p>
          Saturday concentration at{" "}
          <strong>{saturdayShare}%</strong> indicates
          {saturdayShare > 40
            ? " strong weekend dependency."
            : " relatively balanced weekday programming."}
        </p>
      </section>

      <section className="text-sm text-muted-foreground leading-relaxed space-y-4 pt-6 border-t">
        <h2 className="font-semibold text-base text-black">
          National Positioning
        </h2>

        <p>
          Within the Ireland 2026 racing structure, {venueName} accounts for 
          <strong> {nationalShare}% </strong>
          of total national meetings.
        </p>

        <p>
          Compared with the national median of 
          <strong> {nationalMedian} </strong> meetings per course,
          {venueName} operates at
          {total > nationalMedian
            ? " an above-average national scale."
            : " a below-median operational scale."}
        </p>
      </section>

      <section className="pt-12 border-t space-y-6">
        <h2 className="text-2xl font-semibold">
          Frequently Asked Questions – {venueName} 2026
        </h2>

        <div className="space-y-5 text-sm text-muted-foreground">

          <div>
            <h3 className="font-semibold text-black">
              How many race meetings take place in 2026?
            </h3>
            <p className="mt-2">
              {venueName} hosts <strong>{total}</strong> scheduled race meetings
              across <strong>{activeDays}</strong> active racing days.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">
              Which month is the busiest?
            </h3>
            {peakMonth && (
              <p className="mt-2">
                <strong>{peakMonth[0]}</strong> records the highest activity,
                with <strong>{peakMonth[1]}</strong> meetings.
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-black">
              How important are Saturday fixtures?
            </h3>
            <p className="mt-2">
              Saturdays account for <strong>{saturdayShare}%</strong>
              of total meetings, indicating the course’s reliance on
              weekend scheduling.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">
              Is the 2026 calendar congested?
            </h3>
            <p className="mt-2">
              The congestion index of <strong>{congestionScore}/100</strong>
              reflects overall structural intensity.
            </p>
          </div>

        </div>
      </section>

      <section className="pt-8 border-t text-sm space-y-2">
        <h2 className="font-semibold">Explore Ireland Racing</h2>
        <ul className="underline space-y-1">
          <li>
            <Link href="/ireland/horse-racing">
              Ireland Horse Racing Hub →
            </Link>
          </li>
          <li>
            <Link href="/ireland/horse-racing/calendar-2026">
              2026 Racing Calendar Overview
            </Link>
          </li>
          <li>
            <Link href="/ireland/horse-racing/courses">
              All Ireland Racecourses
            </Link>
          </li>
        </ul>
      </section>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleData),
        }}
      />

    </main>
  );
}

/* =========================
   STAT COMPONENT
========================= */

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