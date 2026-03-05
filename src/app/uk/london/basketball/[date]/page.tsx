//src/app/uk/london/basketball/[date]/page.tsx

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

/* ================= METADATA ================= */

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const shortDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });

  return {
    title: `Basketball Games in London – ${shortDate}`,
    description: `See all basketball games taking place in London on ${shortDate}. Tip-off times, venues and full fixture list.`,

    alternates: {
      canonical: `https://venuescope.io/uk/london/basketball/${date}`,
    },

    robots: {
      index: true,
      follow: true,
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

    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.sport?.toLowerCase() === "basketball" &&
      e.city?.toLowerCase() === "london" &&
      eventKey === date
    );
  });

  if (basketballEvents.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  const eventSchema = basketballEvents.map((event: any) => ({
    "@type": "SportsEvent",

    name:
      event.homeTeam && event.awayTeam
        ? `${event.homeTeam} vs ${event.awayTeam}`
        : event.title ?? "Basketball Game",

    startDate: event.startDate ?? event.date ?? event.utcDate,

    url: `https://venuescope.io/uk/london/basketball/${date}`,

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
  }));

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "London Basketball",
        item: "https://venuescope.io/uk/london/basketball",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/uk/london/basketball/${date}`,
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      ...eventSchema,
      breadcrumbSchema
    ]
  };

  return (
    <>
      <DatePage
        params={Promise.resolve({ date })}
        searchParams={Promise.resolve({
          country: "uk",
          city: "london",
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