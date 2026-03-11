// src/app/venue/[venue]/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DatePage from "@/app/date/[date]/page";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";

type Props = {
  params: Promise<{ venue: string; date: string }>;
};

function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function slugify(v?: string) {
  return v?.toLowerCase().replace(/\s+/g, "-") ?? "";
}

function formatVenueName(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

  const { venue, date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const venueName = formatVenueName(venue);
  const shortDate = formatShortDate(date);

  return {
    title: `${venueName} Match Venue – Events & Fixtures on ${shortDate}`,

    description:
      `Discover matches, fights and sporting events taking place at ${venueName}. 
       View the venue schedule, match location, stadium events and competition fixtures on ${shortDate}.`,

    alternates: {
      canonical: `https://venuescope.io/venue/${venue}/${date}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: `${venueName} Match Venue – Events on ${shortDate}`,
      description:
        `Sporting events, matches and fights taking place at ${venueName} on ${shortDate}.`,
      url: `https://venuescope.io/venue/${venue}/${date}`,
      siteName: "VenueScope",
      type: "website",
    },
  };
}

/* ================= PAGE ================= */

export default async function Page({ params }: Props) {

  const { venue, date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const venueName = formatVenueName(venue);

  const events = await getAllEventsRaw("180d");

  const venueEvents = events.filter((e: any) => {

    const key =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      slugify(e.venue) === venue &&
      key === date
    );
  });

  if (venueEvents.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  /* ================= STRUCTURED DATA ================= */

  const venueSchema = {
    "@type": "SportsActivityLocation",
    name: venueName,
    url: `https://venuescope.io/venue/${venue}`,
  };

  const eventSchema = venueEvents.map((event: any) => {

    const eventName =
      event.homeTeam && event.awayTeam
        ? `${event.homeTeam} vs ${event.awayTeam}`
        : event.title ?? "Sports Event";

    return {

      "@type": "SportsEvent",

      name: eventName,

      startDate:
        event.startDate ?? event.date ?? event.utcDate,

      location: {
        "@type": "Place",
        name: venueName,
        address: {
          "@type": "PostalAddress",
          addressLocality: event.city ?? "",
          addressCountry: event.region ?? "",
        },
      },

      sport: event.sport ?? "Sports",

      url: `https://venuescope.io/venue/${venue}/${date}`,

      eventAttendanceMode:
        "https://schema.org/OfflineEventAttendanceMode",

      eventStatus:
        "https://schema.org/EventScheduled",
    };
  });

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: venueName,
        item: `https://venuescope.io/venue/${venue}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/venue/${venue}/${date}`,
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      venueSchema,
      ...eventSchema,
      breadcrumbSchema
    ],
  };

  return (
    <>
      {/* ================= SEO TEXT BLOCK ================= */}

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8 space-y-4">

        <h1 className="text-3xl font-bold">
          Matches at {venueName} – {displayDate}
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          {venueName} is a sports venue hosting professional sporting events,
          including tennis matches, football games, combat sports fights and
          other competitions. This page lists all matches and events taking
          place at this location on {displayDate}.
        </p>

      </section>

      {/* ================= DATE PAGE ================= */}

      <DatePage
        params={Promise.resolve({ date })}
        searchParams={Promise.resolve({
          venue: venueName
        })}
      />

      {/* ================= STRUCTURED DATA ================= */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </>
  );
}