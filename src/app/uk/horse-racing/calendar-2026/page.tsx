// src/app/uk/horse-racing/calendar-2026/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getHorseRacingEventsRaw } 
  from "@/lib/events/getHorseRacingEventsRaw";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];


function slugifyVenue(name: string) {
  return name
    .toLowerCase()
    .replace(" racecourse", "")
    .replace(" race course", "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export const metadata: Metadata = {
  title: "UK Horse Racing Calendar 2026 – Total Meetings, Busiest Days & Overlap Analysis",
  description:
    "Complete 2026 horse racing calendar for the United Kingdom. Analyse total race meetings, busiest days, monthly distribution and peak racing periods.",
};

export default async function Page() {
  const events = await getHorseRacingEventsRaw();

  const racing2026 = events.filter((e: any) => {
    const d = new Date(e.startDate ?? e.date);
    const year = d.getFullYear();
    const month = d.getMonth();

    const region = (e.region ?? "")
      .toString()
      .trim()
      .toLowerCase();

    return (
      UK_REGIONS.includes(region) &&
      year === 2026 &&
      month >= 1
    );
  });
  
  const totalMeetings = racing2026.length;

  const groupedByDate: Record<string, number> = {};
  racing2026.forEach((e: any) => {
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

  const saturdayMeetings = racing2026.filter((e: any) => {
    const d = new Date(e.startDate);
    return d.getDay() === 6;
  }).length;

  const saturdayShare =
    totalMeetings > 0
      ? Math.round((saturdayMeetings / totalMeetings) * 100)
      : 0;   
  
  const monthMap: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    const m = (e.startDate ?? "").slice(0, 7);
    monthMap[m] = (monthMap[m] || 0) + 1;
  });

  /* ===== NEW: Regional Distribution ===== */

  const regionMap: Record<string, number> = {};

  racing2026.forEach((e: any) => {
    const r = (e.region ?? "").toLowerCase();
    regionMap[r] = (regionMap[r] || 0) + 1;
  });

  const regionShare = Object.entries(regionMap).map(([region, count]) => ({
    region,
    count,
    share:
      totalMeetings > 0
        ? Math.round((count / totalMeetings) * 100)
        : 0,
  }));

  const peakMonth = Object.entries(monthMap)
    .sort((a, b) => b[1] - a[1])[0];

  const congestionScore = Math.min(
    100,
    Math.round(avgPerDay * 10 + saturdayShare)
  );

  const orderedMonths = Array.from({ length: 11 }).map((_, i) => {
    const month = String(i + 2).padStart(2, "0");
    const key = `2026-${month}`;
    return {
      key,
      month,
      count: monthMap[key] || 0,
    };
  });

  /* ===== NEW: Season Phases ===== */

  const earlySeason = orderedMonths
    .filter(m => ["02","03","04"].includes(m.month))
    .reduce((sum, m) => sum + m.count, 0);

  const coreSeason = orderedMonths
    .filter(m => ["05","06","07","08"].includes(m.month))
    .reduce((sum, m) => sum + m.count, 0);

  const lateSeason = orderedMonths
    .filter(m => ["09","10","11","12"].includes(m.month))
    .reduce((sum, m) => sum + m.count, 0);

  /* ===== NEW: Racecourse Concentration ===== */

  const venueMap: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    if (!e.venue) return;
    venueMap[e.venue] = (venueMap[e.venue] || 0) + 1;
  });

  const sortedVenues = Object.entries(venueMap).sort(
    (a, b) => b[1] - a[1]
  );

  /* ===== NEW: High Congestion Days ===== */

  const highCongestionDays = sortedDays
    .filter(d => d[1] >= avgPerDay + 2)
    .slice(0, 5);

  const top5Share =
    totalMeetings > 0
      ? Math.round(
          (sortedVenues.slice(0, 5)
            .reduce((sum, v) => sum + v[1], 0) /
            totalMeetings) *
            100
        )
      : 0;

  const topCourses = sortedVenues.slice(0, 8);
  /* ===== FAQ DATA ===== */

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How many UK horse racing meetings are scheduled in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `There are ${totalMeetings} race meetings scheduled across the United Kingdom in 2026.`,
        },
      },
      {
        "@type": "Question",
        name: "What is the busiest UK horse racing day in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: busiestDay
            ? `${busiestDay[0]} recorded the highest national meeting volume with ${busiestDay[1]} concurrent meetings.`
            : "Busiest day data is not available.",
        },
      },
      {
        "@type": "Question",
        name: "Which month has the most UK race meetings in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: peakMonth
            ? `${peakMonth[0]} hosts the highest monthly total with ${peakMonth[1]} meetings.`
            : "Monthly peak data is not available.",
        },
      },
      {
        "@type": "Question",
        name: "How significant are Saturday fixtures in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Saturday meetings represent ${saturdayShare}% of all UK race meetings in 2026.`,
        },
      },
      {
        "@type": "Question",
        name: "Is the 2026 UK racing calendar congested?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `The 2026 calendar records an average of ${avgPerDay} meetings per active racing day, with a congestion index score of ${congestionScore}/100.`,
        },
      },
    ],
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-14">

      {/* ===== HEADER ===== */}

      <header className="space-y-4 border-b pb-8">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          Annual Structural Report
        </p>

        <h1 className="text-4xl font-semibold tracking-tight">
          UK Horse Racing Calendar 2026
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Complete structural overview of UK race meetings in 2026,
          including seasonal peak analysis, congestion intensity,
          Saturday concentration and racecourse distribution patterns.
        </p>
      </header>

      {/* ===== SUMMARY PARAGRAPH ===== */}

      <section className="text-sm leading-relaxed text-muted-foreground">
        <p>
          The 2026 UK racing calendar includes{" "}
          <strong>{totalMeetings}</strong> meetings across{" "}
          <strong>{activeDays}</strong> active racing days.
          Average daily density stands at{" "}
          <strong>{avgPerDay}</strong> meetings per day,
          with Saturday fixtures accounting for{" "}
          <strong>{saturdayShare}%</strong> of total activity.
          Structural congestion is reflected in a composite index score of{" "}
          <strong>{congestionScore}/100</strong>.
        </p>
      </section>

      {/* ===== STAT GRID ===== */}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <Stat title="Total Meetings" value={totalMeetings} />
        <Stat title="Active Racing Days" value={activeDays} />
        <Stat title="Avg Meetings / Day" value={avgPerDay} />
        <Stat
          title="Saturday Share"
          value={`${saturdayShare}%`}
          note="Proportion of national meetings held on Saturdays"
        />
        <Stat
          title="Congestion Index"
          value={`${congestionScore}/100`}
          note="Composite structural density score"
        />
      </section>

      <section className="pt-10 border-t text-sm text-muted-foreground space-y-3">
        <h2 className="font-semibold text-black">
          National Structural Benchmark
        </h2>

        <p>
          With an average of <strong>{avgPerDay}</strong> meetings per active day,
          the 2026 UK racing calendar reflects 
          {avgPerDay >= 3
            ? " a high-density national fixture structure."
            : " a moderate scheduling structure."}
        </p>

        <p>
          A Saturday concentration of <strong>{saturdayShare}%</strong> indicates
          {saturdayShare > 35
            ? " strong weekend dependency across racecourses."
            : " relatively balanced weekday distribution."}
        </p>

        <p>
          The top five racecourses account for <strong>{top5Share}%</strong> of
          total meetings, signalling
          {top5Share > 40
            ? " a centralised fixture model."
            : " a distributed operational structure."}
        </p>
      </section>
      {/* ===== REGIONAL DISTRIBUTION ===== */}

      <section className="pt-10 border-t space-y-6">
        <h2 className="text-xl font-semibold">
          Regional Distribution – 2026
        </h2>

        <p className="text-sm text-muted-foreground">
          Meeting distribution across England, Scotland, Wales and Northern Ireland.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {regionShare.map((r) => (
            <div
              key={r.region}
              className="flex justify-between border rounded-xl px-5 py-4"
            >
              <span className="capitalize font-medium">
                {r.region}
              </span>
              <span className="text-sm text-muted-foreground">
                {r.count} meetings · {r.share}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SEASON PHASE ANALYSIS ===== */}

      <section className="pt-10 border-t space-y-6">
        <h2 className="text-xl font-semibold">
          Seasonal Load Distribution
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Stat title="Early Season (Feb–Apr)" value={earlySeason} />
          <Stat title="Core Season (May–Aug)" value={coreSeason} />
          <Stat title="Late Season (Sep–Dec)" value={lateSeason} />
        </div>

        <p className="text-sm text-muted-foreground">
          Core season activity represents the highest structural density
          within the 2026 UK racing calendar.
        </p>
      </section>

      {/* ===== QUESTION-BASED INSIGHTS ===== */}

      <section className="space-y-10">

        <div>
          <h2 className="text-xl font-semibold">
            When does the 2026 UK horse racing season peak?
          </h2>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            The highest concentration of meetings occurs in{" "}
            <strong>{peakMonth?.[0]}</strong>, hosting{" "}
            <strong>{peakMonth?.[1]}</strong> scheduled events.
            This period represents the structural peak of the 2026 calendar.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            What is the busiest UK racing day in 2026?
          </h2>
          {busiestDay && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              The highest national meeting volume was recorded on{" "}
              <strong>{busiestDay[0]}</strong>, with{" "}
              <strong>{busiestDay[1]}</strong> concurrent meetings.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            How concentrated are Saturday fixtures?
          </h2>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Saturdays represent <strong>{saturdayShare}%</strong> of all UK
            race meetings in 2026. Elevated weekend concentration increases
            national overlap risk and competitive broadcast exposure.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            How concentrated are meetings among leading racecourses?
          </h2>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            The top five racecourses account for approximately{" "}
            <strong>{top5Share}%</strong> of all UK meetings,
            indicating structural centralisation within the fixture calendar.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            High Congestion Risk Windows
          </h2>

          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            The following dates recorded elevated national overlap,
            exceeding average daily density.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {highCongestionDays.map(([date, count]) => (
              <li key={date}>
                {date} – <strong>{count}</strong> meetings
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== LEADING RACECOURSES ===== */}

      <section className="pt-10 border-t space-y-6">
        <h2 className="text-xl font-semibold">
          Leading UK Racecourses in 2026
        </h2>

        <p className="text-sm text-muted-foreground">
          The following racecourses host the highest number of meetings
          within the 2026 national calendar.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {topCourses.map(([venue, count], i) => (
            <Link
              key={venue}
              href={`/uk/horse-racing/courses/${slugifyVenue(venue)}`}
              className="group flex items-center justify-between px-5 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <div>
                <div className="font-medium">
                  {venue.replace(" Racecourse", "")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {count} meetings in 2026
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>View analysis</span>
                <span className="opacity-0 group-hover:opacity-100 transition">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm hover:opacity-90 transition">
        <Link
          href="/uk/horse-racing/courses"
          className="inline-flex items-center gap-2 text-sm font-medium underline hover:opacity-70 transition"
        >
          View full UK course ranking →
        </Link>
      </div>

      {/* ===== MONTHLY DISTRIBUTION ===== */}

      <section className="space-y-6 pt-6 border-t">
        <h2 className="text-xl font-semibold tracking-tight">
          Monthly Distribution
        </h2>

        <div className="space-y-3">
          {orderedMonths.map(({ key, month, count }) => {
            const monthName = new Date(`${key}-01`).toLocaleString("en-GB", {
              month: "long",
            });

            return (
              <Link
                key={key}
                href={`/uk/horse-racing/month/2026/${month}`}
                className="flex justify-between items-center py-3 border-b border-border/40 hover:opacity-70 transition"
              >
                <span className="text-sm font-medium">
                  {monthName}
                </span>

                <span className="text-sm tabular-nums text-muted-foreground">
                  {count} meetings
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}

      <section className="pt-12 border-t space-y-8">
        <h2 className="text-2xl font-semibold">
          Frequently Asked Questions – UK Horse Racing 2026
        </h2>

        <div className="space-y-6 text-sm text-muted-foreground">

          <div>
            <h3 className="font-semibold text-black">
              How many race meetings are scheduled in 2026?
            </h3>
            <p className="mt-2">
              There are <strong>{totalMeetings}</strong> race meetings
              scheduled across the United Kingdom in 2026.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">
              What is the busiest racing day?
            </h3>
            {busiestDay && (
              <p className="mt-2">
                <strong>{busiestDay[0]}</strong> recorded the highest
                meeting volume with <strong>{busiestDay[1]}</strong> concurrent events.
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-black">
              Which month has the most meetings?
            </h3>
            {peakMonth && (
              <p className="mt-2">
                <strong>{peakMonth[0]}</strong> hosts the highest
                monthly total with <strong>{peakMonth[1]}</strong> meetings.
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-black">
              How important are Saturday fixtures?
            </h3>
            <p className="mt-2">
              Saturdays account for <strong>{saturdayShare}%</strong>
              of all meetings, representing the most concentrated
              scheduling window in the 2026 calendar.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">
              Is the 2026 fixture calendar congested?
            </h3>
            <p className="mt-2">
              With an average of <strong>{avgPerDay}</strong> meetings
              per active racing day and a congestion index of{" "}
              <strong>{congestionScore}/100</strong>, the calendar reflects
              elevated structural density.
            </p>
          </div>

        </div>
      </section>

      {/* ===== INTERNAL ANALYSIS LINKS ===== */}

      <section className="pt-10 border-t text-sm space-y-2">
        <h2 className="font-semibold">Full 2026 Analysis</h2>

        <ul className="space-y-1 underline">
          <li>
            <Link
              href="/uk/horse-racing"
            >
              UK Horse Racing Hub→
            </Link>
          </li>
          <li><Link href="/uk/horse-racing/busiest-days-2026">Busiest racing days</Link></li>
          <li><Link href="/uk/horse-racing/meeting-frequency-2026">Racecourse frequency ranking</Link></li>
          <li><Link href="/uk/horse-racing/overlap-report-2026">National overlap report</Link></li>
        </ul>
      </section>

      {/* ===== STRUCTURED DATA ===== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "UK Horse Racing Calendar 2026",
            description:
              "Structural overview of UK horse racing meetings in 2026 including total meetings, congestion patterns and overlap analysis.",
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

function Stat({ title, value, note }: any) {
  return (
    <div className="border rounded-2xl p-8 bg-white">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="text-4xl font-semibold mt-3">
        {value}
      </p>
      {note && (
        <p className="text-xs text-muted-foreground mt-2">
          {note}
        </p>
      )}
    </div>
  );
}