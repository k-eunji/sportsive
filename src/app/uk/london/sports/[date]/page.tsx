// src/app/uk/london/sports/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";
import { DateNav } from "@/app/components/DateNav";
import Link from "next/link";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

type Props = {
  params: Promise<{ date: string }>;
};

function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function formatDisplayDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const displayDate = formatDisplayDate(date);

  return {
    title: `Sports Fixtures in London — ${displayDate} | VenueScope`,
    description: `Professional sports fixtures taking place in London on ${displayDate}, organised by venue and start time.`,
    alternates: {
      canonical: `https://venuescope.io/uk/london/sports/${date}`,
    },
  };
}

export default async function Page({ params }: Props) {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");

  /* ================= London events ================= */

  const dateEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.city?.toLowerCase() === "london" &&
      eventKey === date
    );
  });

  /* ================= UK total sports ================= */

  const ukEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  const londonShare =
    ukEvents.length > 0
      ? Math.round((dateEvents.length / ukEvents.length) * 100)
      : 0;

  const displayDate = formatDisplayDate(date);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      {/* ================= HEADER ================= */}

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Sports Fixtures in London — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          There are {dateEvents.length} professional sporting events
          taking place in London on {displayDate}.
          Fixtures include football, rugby, cricket and horse racing.
        </p>
      </header>

      {/* ================= LIST ================= */}

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Fixtures on {displayDate}
        </h2>

        {/* Sport markers */}
        <div className="mt-5 mb-3 text-xs text-muted-foreground space-y-1">
          <div className="font-medium text-foreground/70">
            Sport markers
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>F</strong> Football</span>
            <span><strong>R</strong> Rugby</span>
            <span><strong>B</strong> Basketball</span>
            <span><strong>C</strong> Cricket</span>
            <span><strong>H</strong> Horse racing</span>
            <span><strong>T</strong> Tennis</span>
            <span><strong>D</strong> Darts</span>
          </div>
        </div>

        <EventList
          events={dateEvents}
          fixedStartDate={date}
        />
      </section>

      {/* ================= 🔥 NATIONAL SHARE ANALYSIS ================= */}

      <section className="border rounded-xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">
          London share of UK sports
        </h2>

        <div className="grid grid-cols-3 gap-6 text-center">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              UK total fixtures
            </p>
            <p className="text-2xl font-semibold">
              {ukEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              London fixtures
            </p>
            <p className="text-2xl font-semibold">
              {dateEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              London share
            </p>
            <p className="text-2xl font-semibold">
              {londonShare}%
            </p>
          </div>

        </div>

        <p className="text-sm text-muted-foreground">
          On {displayDate}, London accounts for{" "}
          <strong>{londonShare}%</strong> of all professional
          sporting fixtures taking place across the United Kingdom.
        </p>

      </section>

      {/* ================= STRUCTURED DATA ================= */}

      {dateEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              dateEvents
                .filter((event: any) => event.startDate || event.date || event.utcDate)
                .map((event: any) => ({
                  "@context": "https://schema.org",
                  "@type": "SportsEvent",
                  name:
                    event.homeTeam && event.awayTeam
                      ? `${event.homeTeam} vs ${event.awayTeam}`
                      : event.title ?? "Sports Event",
                  startDate: event.startDate ?? event.date ?? event.utcDate,
                  eventAttendanceMode:
                    "https://schema.org/OfflineEventAttendanceMode",
                  eventStatus:
                    "https://schema.org/EventScheduled",
                  location: {
                    "@type": "Place",
                    name: event.venue ?? "Sports Venue",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: event.city ?? "",
                      addressCountry: event.region ?? "",
                    },
                  },
                  sport: event.sport ?? "Sports",
                  organizer: {
                    "@type": "Organization",
                    name: "VenueScope",
                    url: "https://venuescope.io",
                  },
                }))
            ),
          }}
        />
      )}

      {/* ================= DATE NAV ================= */}

      <DateNav
        date={date}
        basePath="/uk/london/sports"
      />

      {/* ================= INTERNAL LINKS ================= */}

      <section className="pt-8">
        <Link
          href={`/uk/sports/${date}`}
          className="underline underline-offset-4"
        >
          All UK fixtures on {displayDate} →
        </Link>
      </section>

      <section className="mt-6 space-y-2 text-sm">
        <Link
          href={`/uk/london/football/${date}`}
          className="underline block"
        >
          Football fixtures in London on {displayDate}
        </Link>

        <Link
          href={`/uk/live-sports-today`}
          className="underline block"
        >
          View today’s London fixtures
        </Link>
      </section>

    </main>
  );
}
