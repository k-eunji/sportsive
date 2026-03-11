// src/app/uk/london/football/[date]/page.tsx

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

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    return {};
  }

  const displayDate = formatDisplayDate(date);

  const shortDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });

  return {
    title: `London Football Fixtures (Soccer) – Matches, Kickoff Times & Stadiums | ${shortDate}`,
    description: `Complete London football (soccer) fixture schedule for ${shortDate}. View all matches, kickoff times, stadium locations and the full football match list across London clubs.`,

    alternates: {
      canonical: `https://venuescope.io/uk/london/football/${date}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: `London Football (Soccer) Fixtures – Match Schedule | ${displayDate}`,
      description: `Kickoff times and venue overlap insights for London football fixtures on ${displayDate}.`,
      url: `https://venuescope.io/uk/london/football/${date}`,
      siteName: "VenueScope",
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {

  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");

  const footballEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.sport?.toLowerCase() === "football" &&
      e.city?.toLowerCase() === "london" &&
      eventKey === date
    );
  });

  if (footballEvents.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  const eventSchema = footballEvents.map((event: any) => ({
    "@type": "SportsEvent",
    name:
      event.homeTeam && event.awayTeam
        ? `${event.homeTeam} vs ${event.awayTeam}`
        : event.title ?? "Sports Event",

    startDate: event.startDate ?? event.date ?? event.utcDate,

    url: `https://venuescope.io/uk/london/football/${date}`,

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
        name: "London Football",
        item: "https://venuescope.io/uk/london/football",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayDate,
        item: `https://venuescope.io/uk/london/football/${date}`,
      },
    ],
  };

  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How many football fixtures take place in London on ${displayDate}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `There are ${footballEvents.length} professional matches scheduled in London on ${displayDate}.`
        }
      },
      {
        "@type": "Question",
        name: `Are there overlapping matches in London?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Some fixtures may kick off at similar times depending on the matchday schedule.`
        }
      },
      {
        "@type": "Question",
        name: `Which stadiums host football matches in London on ${displayDate}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Matches take place at professional football stadiums across London including venues used by Premier League and EFL clubs.`
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
          city: "london",
          sport: "football",
        })}
      />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-4">
          London Football (Soccer) Fixtures – {displayDate}
        </h2>

        <p className="mb-4">
          Professional football fixtures taking place in London on {displayDate}
          include matches hosted at stadiums across the city. London is home to several major football clubs including Arsenal, Chelsea, Tottenham Hotspur, West Ham United and other professional teams competing in the Premier League, EFL and domestic competitions.
        </p>

        <p className="mb-4">
          In many countries the sport is also referred to as soccer. These
          football (soccer) fixtures feature clubs playing matches in stadiums
          located throughout London including venues used by Premier League and
          EFL teams.
        </p>

        <p>
          The match list above shows the full London football schedule for
          {displayDate}, including teams playing, kickoff times and the stadium
          venues hosting each fixture.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Football Matches Hosted in London Stadiums
        </h2>

        <p className="mb-4">
          London regularly hosts professional football matches across multiple
          leagues and competitions. Fixtures can take place in stadiums used by
          clubs such as Arsenal, Chelsea, Tottenham Hotspur, West Ham United and
          other professional teams based in the capital.
        </p>

        <p>
          These stadiums host thousands of supporters each matchday and are part
          of the wider English football calendar that schedules fixtures
          throughout the season.
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