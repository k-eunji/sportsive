///src/app/uk/basketball/[date]/page.tsx

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

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
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
    title: `UK Basketball Fixtures – ${shortDate} | SLB Games (Former BBL)`,
    description: `See all basketball games taking place in London on ${shortDate}, including Super League Basketball (SLB) fixtures and other professional matches.`,
    alternates: {
      canonical: `https://venuescope.io/uk/basketball/${date}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `UK Basketball Fixtures – ${shortDate}`,
      description: `Basketball games and British Basketball League fixtures across the UK on ${shortDate}.`,
      url: `https://venuescope.io/uk/basketball/${date}`,
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

  const basketballEvents = events.filter((e: any) => {

    const key =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.sport?.toLowerCase() === "basketball" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      key === date
    );
  });

  if (basketballEvents.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  /* ================= STRUCTURED DATA ================= */

  const eventSchema = basketballEvents.map((event: any) => ({
    "@type": "SportsEvent",

    name:
      event.homeTeam && event.awayTeam
        ? `${event.homeTeam} vs ${event.awayTeam}`
        : event.title ?? "Basketball Game",

    startDate: event.startDate ?? event.date ?? event.utcDate,

    url: `https://venuescope.io/uk/basketball/${date}`,

    eventAttendanceMode:
      "https://schema.org/OfflineEventAttendanceMode",

    eventStatus:
      "https://schema.org/EventScheduled",

    location: {
      "@type": "Place",
      name: event.venue ?? "Basketball Arena",
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city ?? "",
        addressCountry: "GB",
      },
    },

    sport: "Basketball",

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
        name: "UK Basketball",
        item: "https://venuescope.io/uk/basketball",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/uk/basketball/${date}`,
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
          sport: "basketball",
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