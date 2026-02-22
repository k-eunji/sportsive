// src/app/uk/london/football/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventList } from "@/app/components/EventList";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";
import { DateNav } from "@/app/components/DateNav";
import Link from "next/link";

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
    title: `Football Matches in London – ${shortDate} (Kickoff Times & Stadiums)`,
    description: `See all football matches in London on ${shortDate}. Kickoff times, stadium locations and full fixture list in one place.`,
    alternates: {
      canonical: `https://venuescope.io/uk/london/football/${date}`,
    },
    openGraph: {
      title: `London Football Fixtures – ${displayDate}`,
      description: `Kickoff times and venue overlap insights for London football fixtures on ${displayDate}.`,
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
  const [year, month] = date.split("-");

  const shortDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
  

  const footballEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.sport?.toLowerCase() === "football" &&
      e.city?.toLowerCase() === "london" &&
      eventKey === date
    );
  });

  /* =========================
    MONTH CONTEXT (Relative Position)
  ========================= */

  const monthPrefix = date.slice(0, 7); // YYYY-MM
  const monthEvents = events.filter((e: any) => {
    const eventMonth =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    return (
      e.sport?.toLowerCase() === "football" &&
      e.city?.toLowerCase() === "london" &&
      eventMonth === monthPrefix
    );
  });

  // 날짜별 집계
  const monthGrouped: Record<string, number> = {};

  monthEvents.forEach((e: any) => {
    const d =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);
    if (!d) return;
    monthGrouped[d] = (monthGrouped[d] || 0) + 1;
  });

  const monthCounts = Object.values(monthGrouped);

  const monthMedian =
    monthCounts.length > 0
      ? [...monthCounts].sort((a, b) => a - b)[
          Math.floor(monthCounts.length / 2)
        ]
      : 0;

  const todayCount = footballEvents.length;

  const deltaVsMonth =
    monthMedian > 0
      ? Math.round(((todayCount - monthMedian) / monthMedian) * 100)
      : 0;

  // 순위 계산
  const sortedMonthDays = Object.entries(monthGrouped)
    .sort((a, b) => b[1] - a[1]);

  const rank =
    sortedMonthDays.findIndex(([d]) => d === date) + 1;

  const totalDays = sortedMonthDays.length;

  function getActivityLabel(delta: number) {
    if (delta >= 50) return "Significantly busier than a typical matchday";
    if (delta >= 20) return "Above monthly average activity";
    if (delta <= -30) return "Quieter than usual for this month";
    return "In line with typical monthly activity";
  }

  const activityLabel = getActivityLabel(deltaVsMonth);

  const ukFootballEvents = events.filter((e: any) => {
  const eventKey =
    (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.sport?.toLowerCase() === "football" &&
      eventKey === date
    );
  });

  const londonShare =
    ukFootballEvents.length > 0
      ? Math.round(
          (footballEvents.length / ukFootballEvents.length) * 100
        )
      : 0;

  const displayDate = formatDisplayDate(date);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `How many football matches are in London on ${displayDate}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `There are ${footballEvents.length} professional matches scheduled in London on ${displayDate}.`
                }
              },
              {
                "@type": "Question",
                "name": `Are there overlapping matches in London?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Some fixtures may kick off at similar times depending on the matchday schedule.`
                }
              }
            ]
          })
        }}
      />

      {footballEvents.length > 1 && (
        <div className="text-sm bg-yellow-50 border border-yellow-200 p-3 rounded-md">
          ⚠ {footballEvents.length} fixtures are scheduled in London on this day. 
          Multiple kickoffs may overlap across venues.
        </div>
      )}

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Football Matches in London – {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {footballEvents.length} professional football match
          {footballEvents.length !== 1 ? "es" : ""} 
          {footballEvents.length === 1 ? " is" : " are"} scheduled in London on {displayDate}.
        </p>

        <p className="text-sm text-muted-foreground">
          This includes Premier League and EFL fixtures scheduled across multiple London stadiums, with kickoff times and venue details listed below.
        </p>

      </header>

      <p className="text-sm text-muted-foreground">
        This page highlights matchday density across London, including overlapping kickoffs and venue concentration patterns.
      </p>

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Export Schedule
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Download fixture data for planning, reporting or calendar sync.
            </p>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">

          {/* Primary CSV Button */}
          <a
            href={`/api/export/london-football?date=${date}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition shadow-md"
          >
            ⬇ Download Full Fixture List (CSV)
          </a>

          {/* Secondary ICS Button */}
          <a
            href={`/api/export/london-football?date=${date}&format=ics`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium hover:bg-muted transition"
          >
            📅 Add All Matches to Calendar (.ics)
          </a>

        </div>
      </section>

      <section className="rounded-2xl p-6 bg-background shadow-sm border border-border/30">
        <h2 className="text-xl font-semibold mb-4 space-y-4">
          Daily Match Summary
        </h2>

        {monthCounts.length > 0 && (
          <section className="rounded-2xl p-6 bg-muted/40 border border-border/30">
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3">
              Matchday Context – This Month
            </h2>

            <p className="text-sm">
              <strong>{todayCount}</strong> fixtures scheduled.
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              Typical London matchday this month:{" "}
              <strong>{monthMedian}</strong> fixtures.
            </p>

            <p className="text-sm mt-2">
              {deltaVsMonth > 0 && (
                <>
                  <strong>+{deltaVsMonth}%</strong> vs monthly median ·{" "}
                </>
              )}
              {deltaVsMonth < 0 && (
                <>
                  <strong>{deltaVsMonth}%</strong> vs monthly median ·{" "}
                </>
              )}
              {deltaVsMonth === 0 && <>0% vs monthly median · </>}
              {activityLabel}
            </p>

            {rank > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Ranked <strong>#{rank}</strong> of {totalDays} matchdays this month
                by fixture volume.
              </p>
            )}
          </section>
        )}

        <div className="grid grid-cols-3 gap-6 text-center space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              UK football fixtures
            </p>
            <p className="text-2xl font-semibold">
              {ukFootballEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              London football fixtures
            </p>
            <p className="text-2xl font-semibold">
              {footballEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              London football share
            </p>
            <p className="text-2xl font-semibold">
              {londonShare}%
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href={`/uk/football/${date}`}
            className="text-sm underline hover:opacity-70 transition"
          >
            View all UK football fixtures →
          </Link>

          <Link
            href={`/uk/london/football/month/${year}/${month}`}
            className="text-sm underline hover:opacity-70 transition"
          >
            London football fixtures in {month}/{year} →
          </Link>
        </div>

      </section>

      <Link href={`/uk/london/fixture-congestion/${date}`} className="underline">
        View congestion analysis for London →
      </Link>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Full list of London football matches – {shortDate}
        </h2>

        <EventList events={footballEvents} fixedStartDate={date} />
      </section>  

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">
          FAQs – London football on {displayDate}
        </h2>

        <div className="space-y-3 text-sm">
          <p>
            <strong>How many football matches are in London on {displayDate}?</strong><br />
            There are {footballEvents.length} professional matches scheduled.
          </p>

          <p>
            <strong>What time do London football matches kick off?</strong><br />
            Kickoff times vary by fixture and are listed above.
          </p>

          <p>
            <strong>Which stadiums are hosting matches?</strong><br />
            Each fixture includes venue information for the hosting stadium.
          </p>

          <p>
            <strong>Are there overlapping matches in London?</strong><br />
            Some fixtures may kick off at similar times depending on the matchday schedule.
          </p>
        </div>
      </section>



      {footballEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              footballEvents
                .filter((event: any) => event.startDate || event.date || event.utcDate)
                .map((event: any) => ({
                  "@context": "https://schema.org",
                  "@type": "SportsEvent",
                  name:
                    event.homeTeam && event.awayTeam
                      ? `${event.homeTeam} vs ${event.awayTeam}`
                      : event.title ?? "Sports Event",
                  startDate: event.startDate ?? event.date ?? event.utcDate,
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
                      addressCountry: event.region ?? "",
                    },
                  },
                  sport: event.sport ?? "Sports",
                  organizer: {
                    "@type": "Organization",
                    name: "VenueScope",
                    url: "https://venuescope.io",
                  },
                }))
            ),
          }}
        />
      )}

      {footballEvents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Dataset",
              name: `London Football Fixtures Dataset – ${displayDate}`,
              description: `Structured dataset of professional football fixtures taking place in London on ${displayDate}. Includes date, home team, away team and venue information.`,
              url: `https://venuescope.io/uk/london/football/${date}`,
              creator: {
                "@type": "Organization",
                name: "VenueScope",
                url: "https://venuescope.io"
              },
              distribution: [
                {
                  "@type": "DataDownload",
                  encodingFormat: "text/csv",
                  contentUrl: `https://venuescope.io/api/export/london-football?date=${date}`
                },
                {
                  "@type": "DataDownload",
                  encodingFormat: "text/calendar",
                  contentUrl: `https://venuescope.io/api/export/london-football?date=${date}&format=ics`
                }
              ]
            })
          }}
        />
      )}


      {/* 날짜 네비게이션 */}
      <DateNav
        date={date}
        basePath="/uk/london/football"
      />


      {/* 상위 London 스포츠 날짜 페이지 */}
      <section className="pt-8">
        <Link
          href={`/uk/london/sports/${date}`}
          className="underline underline-offset-4"
        >
          All London fixtures on {displayDate} →
        </Link>
      </section>

      {/* UK 레벨 연결 */}
      <section className="mt-6 space-y-2 text-sm">
        <Link
          href={`/uk/london/fixture-congestion/${date}`}
          className="underline block"
        >
          All London sports fixtures on {displayDate}
        </Link>
        <Link
          href={`/uk/live-sports-today`}
          className="underline block"
        >
          View today’s London fixtures
        </Link>
      </section>

    </main>
  );
}
