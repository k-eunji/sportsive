// src/app/uk/london/sports/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DatePage from "@/app/date/[date]/page";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";

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

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

/* ================= METADATA ================= */

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const shortDate = formatShortDate(date);

  return {
    title: `London Sports Fixtures & Events – Match Schedule | ${shortDate}`,
    description: `Complete list of professional sports fixtures taking place in London on ${shortDate}. View venues, start times and the full event schedule across football, rugby, cricket, tennis and other sports.`,
    alternates: {
      canonical: `https://venuescope.io/uk/london/sports/${date}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `London Sports Fixtures & Event Schedule – ${shortDate}`,
      description: `All professional sports fixtures taking place in London on ${shortDate}.`,
      url: `https://venuescope.io/uk/london/sports/${date}`,
      siteName: "VenueScope",
      type: "website",
    },
  };
}

/* ================= PAGE ================= */

export default async function Page({ params }: Props) {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");

  const londonEvents = events.filter((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return false;

    const d = new Date(raw);

    const eventDate = d.toLocaleDateString("en-CA", {
      timeZone: "Europe/London",
    });

    return (
      e.city?.toLowerCase() === "london" &&
      eventDate === date
    );
  });

  /* 🔴 데이터 없으면 404 */

  if (londonEvents.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  /* ================= STRUCTURED DATA ================= */

  const eventSchema = londonEvents.map((event: any) => ({
    "@type": "SportsEvent",
    name:
      event.homeTeam && event.awayTeam
        ? `${event.homeTeam} vs ${event.awayTeam}`
        : event.title ?? "Sports Event",

    startDate: event.startDate ?? event.date ?? event.utcDate,

    url: `https://venuescope.io/uk/london/sports/${date}`,

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
        addressCountry: "GB",
      },
    },

    sport: event.sport ?? "Sports",

    organizer: {
      "@type": "Organization",
      name: "VenueScope",
      url: "https://venuescope.io",
    },
  }));

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "London Sports",
        item: "https://venuescope.io/uk/london/sports",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/uk/london/sports/${date}`,
      },
    ],
  };

  const pageSchema = {
    "@type": "CollectionPage",
    name: `London Sports Fixtures ${displayDate}`,
    description: `Full list of professional sports fixtures taking place in London on ${displayDate}.`,
    url: `https://venuescope.io/uk/london/sports/${date}`,
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      pageSchema,
      ...eventSchema,
      breadcrumbSchema
    ],
  };
  
  return (
    <>
      <DatePage
        params={Promise.resolve({ date })}
        searchParams={Promise.resolve({
          country: "uk",
          city: "london",
        })}
      />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-4">
          London Sports Fixtures – {displayDate}
        </h2>

        <p className="mb-4">
          Professional sports fixtures taking place in London on {displayDate}
          include matches and events hosted at stadiums, arenas and sporting
          venues across the city. London regularly hosts football, rugby,
          cricket, tennis and other major sporting competitions throughout
          the year.
        </p>

        <p className="mb-4">
          Sports events in London are scheduled across a wide range of venues
          including football stadiums, rugby grounds, cricket venues and
          indoor arenas used for professional tournaments and league
          competitions.
        </p>

        <p>
          The event list above shows the full London sports schedule for
          {displayDate}, including participating teams, venues and event
          start times across different sports.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Major Sporting Events Hosted in London
        </h2>

        <p className="mb-4">
          London is one of the world's leading sports cities and regularly
          hosts professional sporting events throughout the calendar year.
          Fixtures may include Premier League football matches, rugby
          competitions, cricket fixtures, tennis tournaments and other
          professional sporting events.
        </p>

        <p>
          These events take place in major sporting venues located across
          the capital and attract supporters from across the United Kingdom
          and international visitors attending London sporting events.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </>
  );
}