//src/app/uk/tennis/[date]/page.tsx

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
    title: `Tennis Matches – ${shortDate} | UK Tennis Schedule`,
    description:
      `Professional tennis matches and tournament sessions taking place in the UK on ${shortDate}. Includes ATP, WTA and Challenger events.`,

    alternates: {
      canonical: `https://venuescope.io/uk/tennis/${date}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: `UK Tennis Matches – ${shortDate}`,
      description:
        `Professional tennis tournament sessions and matches taking place on ${shortDate}.`,
      url: `https://venuescope.io/uk/tennis/${date}`,
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

  const events = await getAllEventsRaw("all");

  const target = new Date(date);

  /* ================= FILTER ================= */

  const tennisEvents = events.filter((e: any) => {

    if (e.sport?.toLowerCase() !== "tennis") return false;

    const start = new Date(e.startDate ?? e.date ?? e.utcDate);
    const end = new Date(e.endDate ?? start);

    return target >= start && target <= end;
  });

  if (tennisEvents.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  /* ================= STRUCTURED DATA ================= */

  const eventSchema = tennisEvents.map((event: any) => ({

    "@type": "SportsEvent",

    name: event.title ?? "Tennis Match",

    startDate:
      event.startDate ?? event.date ?? event.utcDate,

    endDate: event.endDate ?? undefined,

    url: `https://venuescope.io/uk/tennis/${date}`,

    eventAttendanceMode:
      "https://schema.org/OfflineEventAttendanceMode",

    eventStatus:
      "https://schema.org/EventScheduled",

    location: {
      "@type": "Place",
      name: event.venue ?? "Tennis Venue",
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city ?? "",
        addressCountry: "GB",
      },
    },

    sport: "Tennis",

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
        name: "Tennis Events",
        item: "https://venuescope.io/uk/tennis",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/uk/tennis/${date}`,
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      ...eventSchema,
      breadcrumbSchema,
    ],
  };

  /* ================= PAGE ================= */

  return (
    <>
      <DatePage
        params={Promise.resolve({ date })}
        searchParams={Promise.resolve({
          country: "uk",
          sport: "tennis",
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