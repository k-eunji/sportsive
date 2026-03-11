// src/app/uk/football/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DatePage from "@/app/date/[date]/page";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";

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
    title: `UK Football Fixtures (${shortDate}) – Soccer Match Schedule & Kickoff Times`,
    description: `Full list of professional football (soccer) matches taking place across the United Kingdom on ${shortDate}. View stadium venues, teams and kickoff times.`,
    alternates: {
      canonical: `https://venuescope.io/uk/football/${date}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `UK Football Fixtures – ${shortDate}`,
      description: `Professional football matches across the UK on ${shortDate}.`,
      url: `https://venuescope.io/uk/football/${date}`,
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

  const footballEvents = events.filter((e: any) => {
    const key =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.sport?.toLowerCase() === "football" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      key === date
    );
  });

  if (footballEvents.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  /* ================= STRUCTURED DATA ================= */

  const eventSchema = footballEvents.map((event: any) => ({
    "@type": "SportsEvent",
    name:
      event.homeTeam && event.awayTeam
        ? `${event.homeTeam} vs ${event.awayTeam}`
        : event.title ?? "Football Match",

    startDate: event.startDate ?? event.date ?? event.utcDate,

    url: `https://venuescope.io/uk/football/${date}`,

    eventAttendanceMode:
      "https://schema.org/OfflineEventAttendanceMode",

    eventStatus:
      "https://schema.org/EventScheduled",

    location: {
      "@type": "Place",
      name: event.venue ?? "Football Stadium",
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city ?? "",
        addressCountry: "GB",
      },
    },

    sport: "Association Football",

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
        name: "UK Football",
        item: "https://venuescope.io/uk/football",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/uk/football/${date}`,
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
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
          sport: "football",
        })}
      />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-4">
          UK Football (Soccer) Fixtures – {displayDate}
        </h2>

        <p className="mb-4">
          Professional football fixtures taking place across the United Kingdom
          on {displayDate} include matches from domestic leagues and national
          competitions. In many countries the sport is also referred to as
          soccer, and this page lists scheduled professional football
          (soccer) matches happening across England, Scotland, Wales and
          Northern Ireland.
        </p>

        <p className="mb-4">
          Fixture schedules may include matches from competitions such as
          the Premier League, EFL Championship, League One and League Two,
          as well as cup competitions and other professional football
          tournaments hosted in UK stadiums.
        </p>

        <p>
          The match list includes participating teams, stadium venues and
          scheduled kickoff times for professional football matches taking
          place on {displayDate}.
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