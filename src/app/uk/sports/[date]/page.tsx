// src/app/uk/sports/[date]/page.tsx

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

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const displayDate = formatDisplayDate(date);

  return {
    title: `Sports Fixtures in the UK — ${displayDate} | VenueScope`,
    description:
      `Professional sports fixtures taking place across the United Kingdom on ${displayDate}.`,

    alternates: {
      canonical: `https://venuescope.io/uk/sports/${date}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: `UK Sports Fixtures — ${displayDate}`,
      description: `Professional sports fixtures happening across the UK on ${displayDate}.`,
      url: `https://venuescope.io/uk/sports/${date}`,
      siteName: "VenueScope",
      type: "website",
    },
  };
}

export default async function UKSportsByDatePage({ params }: Props) {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");

  const ukEvents = events.filter((e: any) => {
    const key =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      key === date
    );
  });

  /* 🔴 데이터 없으면 검색 안되게 */

  if (ukEvents.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  const eventSchema = ukEvents.map((event: any) => ({
    "@type": "SportsEvent",
    name:
      event.homeTeam && event.awayTeam
        ? `${event.homeTeam} vs ${event.awayTeam}`
        : event.title ?? "Sports Event",
    startDate: event.startDate ?? event.date ?? event.utcDate,

    url: `https://venuescope.io/uk/sports/${date}`,

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
        name: "UK Sports",
        item: "https://venuescope.io/uk/sports",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/uk/sports/${date}`,
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
        searchParams={Promise.resolve({ country: "uk" })}
      />

      {/* SEO Fixture Insight Section */}

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-4">
          UK Sports Fixtures on {displayDate}
        </h2>

        <p className="mb-4">
          Professional sports fixtures taking place across the United Kingdom
          on {displayDate} include matches from football, rugby, cricket and
          other major sporting competitions. These fixtures are scheduled in
          stadiums and arenas across England, Scotland, Wales and Northern
          Ireland.
        </p>

        <p className="mb-4">
          Daily fixture schedules often feature domestic league competitions,
          national tournaments and club matches hosted in major sporting
          cities including London, Manchester, Liverpool, Glasgow, Cardiff
          and Belfast.
        </p>

        <p>
          This page lists confirmed professional sports fixtures scheduled
          across the UK on {displayDate}, including participating teams,
          venues and match start times.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Major Competitions and Match Schedules
        </h2>

        <p className="mb-4">
          UK sports fixtures may include football matches from domestic
          competitions such as the Premier League, EFL Championship, League
          One and League Two. Rugby fixtures may feature teams from
          Premiership Rugby and other national competitions.
        </p>

        <p className="mb-4">
          Depending on the time of the year, fixture schedules can also
          include cricket matches, tennis tournaments and other professional
          sporting events hosted in venues across the United Kingdom.
        </p>

        <p>
          Fixture lists are updated as new events are confirmed by leagues,
          clubs and governing bodies throughout the UK sports calendar.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold mb-4">
          UK Stadiums Hosting Sporting Fixtures
        </h2>

        <p className="mb-4">
          Sporting fixtures listed for {displayDate} take place in stadiums,
          sports grounds and arenas across the United Kingdom. These venues
          host professional club competitions, national tournaments and other
          scheduled sporting events throughout the year.
        </p>

        <p className="mb-4">
          Major sporting venues in cities such as London, Manchester,
          Birmingham, Liverpool, Glasgow and Cardiff regularly host football,
          rugby and other professional sports fixtures.
        </p>

        <p>
          Each fixture listed on this page includes venue information to help
          visitors understand where matches are scheduled to take place
          across the UK sports landscape.
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