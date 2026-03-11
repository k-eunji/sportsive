// src/app/uk/football/league-one/fixture-congestion/[date]/page.tsx

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

  const displayDate = formatDisplayDate(date);

  return {
    title: `League One Fixtures – ${shortDate} (Kickoff Times & Stadiums)`,

    description: `Full list of EFL League One matches on ${shortDate}. Kickoff times, stadium locations and complete fixture schedule.`,

    alternates: {
      canonical: `https://venuescope.io/uk/football/league-one/fixture-congestion/${date}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: `League One Fixtures – ${displayDate}`,
      description: `Kickoff times and stadium information for EFL League One matches on ${displayDate}.`,
      url: `https://venuescope.io/uk/football/league-one/fixture-congestion/${date}`,
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

  const leagueEvents = events.filter((e: any) => {

    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    const competition =
      (e.competition ?? "").toLowerCase();

    const isLeagueOne =
      competition.includes("league one") ||
      competition.includes("league 1") ||
      competition.includes("efl league one") ||
      competition.includes("efl league 1") ||
      competition.includes("efl 1") ||
      competition.includes("efl one");

    return (
      isLeagueOne &&
      eventKey === date
    );
  });

  if (leagueEvents.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  /* ================= STRUCTURED DATA ================= */

  const eventSchema = leagueEvents.map((event: any) => ({
    "@type": "SportsEvent",

    name:
      event.homeTeam && event.awayTeam
        ? `${event.homeTeam} vs ${event.awayTeam}`
        : event.title ?? "League One Match",

    startDate: event.startDate ?? event.date ?? event.utcDate,

    url: `https://venuescope.io/uk/football/league-one/fixture-congestion/${date}`,

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
        name: "League One Fixtures",
        item: "https://venuescope.io/uk/football/league-one/fixture-congestion",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/uk/football/league-one/fixture-congestion/${date}`,
      },
    ],
  };

  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How many League One matches are on ${displayDate}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `There are ${leagueEvents.length} League One fixtures scheduled on ${displayDate}.`
        }
      },
      {
        "@type": "Question",
        name: `What time do League One matches kick off?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Kickoff times vary depending on the match schedule and broadcasting arrangements.`
        }
      }
    ]
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      ...eventSchema,
      breadcrumbSchema,
      faqSchema
    ]
  };

  return (
    <>
      <DatePage
        params={Promise.resolve({ date })}
        searchParams={Promise.resolve({
          country: "uk",
          sport: "football",
          competition: "league-one",
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