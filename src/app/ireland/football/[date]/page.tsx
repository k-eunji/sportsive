//src/app/ireland/football/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DatePage from "@/app/date/[date]/page";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";

const IRELAND_REGIONS = [
  "ireland",
];

type Props = {
  params: Promise<{ date: string }>;
};

function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function formatDisplayDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Dublin",
  });
}

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Dublin",
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
    title: `Football Fixtures in Ireland – ${shortDate} | Full Match List`,
    description: `Full list of professional football matches taking place across Ireland on ${shortDate}. View venues and kickoff times.`,

    alternates: {
      canonical: `https://venuescope.io/ireland/football/${date}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: `Ireland Football Fixtures – ${shortDate}`,
      description: `Professional football matches across Ireland on ${shortDate}.`,
      url: `https://venuescope.io/ireland/football/${date}`,
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
      IRELAND_REGIONS.includes(e.region?.toLowerCase()) &&
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

    url: `https://venuescope.io/ireland/football/${date}`,

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
        addressCountry: "IE",
      },
    },

    sport: "Football",

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
        name: "Ireland Football",
        item: "https://venuescope.io/ireland/football",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/ireland/football/${date}`,
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
          country: "ireland",
          sport: "football",
        })}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </>
  );
}