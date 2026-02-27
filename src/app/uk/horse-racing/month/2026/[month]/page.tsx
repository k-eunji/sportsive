// src/app/uk/horse-racing/month/2026/[month]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";
import { EventList } from "@/app/components/EventList";
import { MonthDaysToggle } from "@/app/components/MonthDaysToggle";

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

type Props = {
  params: Promise<{ month: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { month } = await params;

  return {
    title: `UK Horse Racing ${month}/2026 – Monthly Meeting Analysis`,
    description:
      `Detailed breakdown of UK horse racing meetings during ${month}/2026 including daily schedule and structural density.`,
  };
}

export default async function Page({ params }: Props) {
  const { month } = await params;

  if (!/^(0[1-9]|1[0-2])$/.test(month)) {
    notFound();
  }

  const events = await getHorseRacingEventsRaw();

  const yearly = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);
    return (
      e.sport === "horse-racing" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      year === "2026"
    );
  });

  const prefix = `2026-${month}`;

  const monthly = yearly.filter(
    (e: any) => (e.startDate ?? "").slice(0, 7) === prefix
  );

  const totalMonth = monthly.length;
  const totalYear = yearly.length;

  const monthShare =
    totalYear > 0
      ? Math.round((totalMonth / totalYear) * 100)
      : 0;

  const grouped: Record<string, number> = {};
  monthly.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    grouped[d] = (grouped[d] || 0) + 1;
  });

  const activeDays = Object.keys(grouped).length;

  const avgPerDay =
    activeDays > 0
      ? Math.round(totalMonth / activeDays)
      : 0;

  const busiest = Object.entries(grouped).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const venueMap: Record<string, number> = {};
  monthly.forEach((e: any) => {
    if (!e.venue) return;
    venueMap[e.venue] = (venueMap[e.venue] || 0) + 1;
  });

  const topVenues = Object.entries(venueMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const monthLabel = new Date(`${prefix}-01`).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `UK Horse Racing ${monthLabel}`,
    description:
      "Monthly structural overview of UK horse racing meetings.",
    author: {
      "@type": "Organization",
      name: "VenueScope",
    },
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-14 space-y-14">

      {/* HEADER */}
      <header className="space-y-4 border-b pb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Monthly Structural Report
        </p>

        <h1 className="text-3xl font-bold">
          UK Horse Racing – {monthLabel}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Complete schedule and structural overview of meetings
          during {monthLabel}.
        </p>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t pt-8">
        <Stat title="Total Meetings" value={totalMonth} />
        <Stat title="Active Days" value={activeDays} />
        <Stat title="Avg / Day" value={avgPerDay} />
        <Stat title="Share of 2026" value={`${monthShare}%`} />
      </section>

      {/* BUSIEST DAY */}
      {busiest && (
        <section className="pt-8 border-t space-y-4">
          <h2 className="text-lg font-semibold">
            Busiest Day
          </h2>

          <p className="text-sm text-muted-foreground">
            <strong>{busiest[0]}</strong> recorded the
            highest daily volume with{" "}
            <strong>{busiest[1]}</strong> meetings.
          </p>
        </section>
      )}

      {/* FULL MONTH SCHEDULE */}
      <section className="pt-8 border-t space-y-6">
        <h2 className="text-lg font-semibold">
          Full Racing Schedule – {monthLabel}
        </h2>

        <MonthDaysToggle
          monthlyEvents={monthly}
          totalMonth={totalMonth}
        />
      </section>
      {/* TOP VENUES */}
      <section className="pt-8 border-t space-y-6">
        <h2 className="text-lg font-semibold">
          Leading Racecourses – {monthLabel}
        </h2>

        <div className="space-y-3">
          {topVenues.map(([venue, count], i) => (
            <Link
              key={venue}
              href={`/uk/horse-racing/courses/${slugifyVenue(venue)}`}
              className="block rounded-xl bg-white px-4 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex justify-between text-sm">
                <span>
                  #{i + 1} {venue.replace(" Racecourse", "")}
                </span>
                <span className="text-muted-foreground">
                  {count} meetings
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* INTERNAL LINKS */}
      <section className="pt-8 border-t text-sm space-y-2">
        <h2 className="font-semibold">Full 2026 Analysis</h2>
        <ul className="underline space-y-1">
          <li>
            <Link
              href="/uk/horse-racing"
            >
              UK Horse Racing Hub→
            </Link>
          </li>
          <li><Link href="/uk/horse-racing/calendar-2026">Full Calendar</Link></li>
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleData),
        }}
      />

    </main>
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