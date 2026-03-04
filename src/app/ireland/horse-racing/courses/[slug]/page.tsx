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

  const venueName =
    events.find(
      (e: any) => slugifyVenue(e.venue ?? "") === slug
    )?.venue ?? null;

  if (!venueName) notFound();

  /* ---------- filter events ---------- */

  const courseEvents = events.filter((e: any) => {

    const year = (e.startDate ?? "").slice(0, 4);

    return (
      IRELAND_REGIONS.includes(e.region?.toLowerCase()) &&
      year === "2026" &&
      slugifyVenue(e.venue ?? "") === slug
    );

  });

  const total = courseEvents.length;

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
     UI
  ========================= */

  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-12">

      {/* HEADER */}

      <header className="space-y-4">

        <h1 className="text-4xl font-semibold tracking-tight">
          {venueName} – 2026 Racing Overview
        </h1>

        <p className="text-muted-foreground max-w-2xl">
          Analytical breakdown of meeting frequency, weekend concentration,
          seasonal peaks and structural congestion patterns for the
          2026 racing calendar at {venueName}.
        </p>

      </header>

      {/* BREADCRUMB */}

      <div className="text-xs text-muted-foreground space-x-1">

        <Link
          href="/ireland/horse-racing"
          className="hover:underline"
        >
          Ireland Racing
        </Link>

        <span>/</span>

        <Link
          href="/sport/horse-racing"
          className="hover:underline"
        >
          Horse Racing Data
        </Link>

        <span>/</span>

        <Link
          href="/ireland/horse-racing/courses"
          className="hover:underline"
        >
          Courses
        </Link>

        <span>/</span>

        <span>{venueName}</span>

      </div>

      {/* KEY METRICS */}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">

        <Stat title="Total Meetings" value={total} />

        <Stat title="Active Racing Days" value={activeDays} />

        <Stat title="Saturday Share" value={`${saturdayShare}%`} />

        <Stat title="Congestion Index" value={`${congestionScore}/100`} />

      </section>

      {/* SPORT PAGE LINK */}

      <section className="border rounded-xl p-6 bg-gray-50">

        <h2 className="font-semibold mb-2">
          Explore Interactive Data
        </h2>

        <p className="text-sm text-muted-foreground mb-3">
          View this racecourse within the full interactive
          horse racing data dashboard.
        </p>

        <Link
          href={`/sport/horse-racing?tab=course&course=${slug}`}
          className="text-sm underline"
        >
          Open {venueName} in Horse Racing Dashboard →
        </Link>

      </section>

      {/* MONTHS */}

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

      {/* INTERNAL LINKS */}

      <section className="pt-8 border-t text-sm space-y-2">

        <h2 className="font-semibold">
          Explore Ireland Racing
        </h2>

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