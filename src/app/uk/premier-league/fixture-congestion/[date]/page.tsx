// src/app/uk/premier-league/fixture-congestion/[date]/page.tsx

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
    title: `Premier League Fixtures & Match Schedule – ${shortDate} | Kickoff Times & Stadiums`,
    description: `Complete Premier League fixture schedule for ${shortDate}. View all EPL matches, kickoff times, stadium locations and the full football match list.`,

    alternates: {
      canonical: `https://venuescope.io/uk/premier-league/fixture-congestion/${date}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: `Premier League Fixtures & Match Schedule – ${displayDate}`,
      description: `Kickoff times and stadium information for Premier League matches on ${displayDate}.`,
      url: `https://venuescope.io/uk/premier-league/fixture-congestion/${date}`,
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

    return (
      competition.includes("premier") &&
      competition.includes("league") &&
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
        : event.title ?? "Premier League Match",

    startDate: event.startDate ?? event.date ?? event.utcDate,

    url: `https://venuescope.io/uk/premier-league/fixture-congestion/${date}`,

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
        name: "Premier League Fixtures",
        item: "https://venuescope.io/uk/premier-league/fixture-congestion",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/uk/premier-league/fixture-congestion/${date}`,
      },
    ],
  };

  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Where are the Premier League matches played on ${displayDate}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Matches take place at Premier League stadiums across England including London, Manchester, Liverpool and other host cities.`
        }
      },
      {
        "@type": "Question",
        name: `What time do Premier League matches kick off?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Kickoff times vary depending on the broadcast schedule and matchday arrangements.`
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
          competition: "premier-league",
        })}
      />

      {/* Premier League Fixture SEO Section */}

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-4">
          Premier League Fixtures – {displayDate}
        </h2>

        <p className="mb-4">
          The Premier League fixture schedule for {displayDate} includes
          professional football matches played at stadiums across England.
          These fixtures are part of the English Premier League season,
          featuring clubs competing in one of the most watched football
          competitions in the world.
        </p>

        <p className="mb-4">
          In many countries the sport is also referred to as soccer, and
          Premier League soccer fixtures attract global audiences each
          matchday. Matches take place in major football venues located in
          cities such as London, Manchester, Liverpool, Birmingham and
          Newcastle.
        </p>

        <p>
          This page lists the full Premier League match schedule for
          {displayDate}, including teams playing, kickoff times and stadium
          venues hosting each fixture.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-semibold mb-4">
          English Premier League Match Schedule
        </h2>

        <p className="mb-4">
          The English Premier League (EPL) fixture list is released before
          the start of each season and determines when clubs meet throughout
          the campaign. Each matchday typically features multiple fixtures
          played across the weekend and occasionally mid-week.
        </p>

        <p className="mb-4">
          Kickoff times are scheduled according to broadcast arrangements,
          stadium availability and league scheduling requirements. Matches
          are hosted in Premier League stadiums across England and are
          attended by thousands of supporters each week.
        </p>

        <p>
          Visitors can explore the complete Premier League fixture list for
          {displayDate} above, including match venues and participating
          clubs.
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