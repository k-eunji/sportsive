// src/app/sport/[slug]/page.tsx

import { notFound } from "next/navigation";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import FootballSportPage from "../_components/FootballSportPage";
import HorseRacingSportPage from "../_components/HorseRacingSportPage";
import GenericSportPage from "../_components/GenericSportPage";
import SportFilterBar from "../_components/SportFilterBar";
import Link from "next/link";

function slugifyVenue(name: string) {
  return name
    .toLowerCase()
    .replace(" racecourse", "")
    .replace(" race course", "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default async function SportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    country?: string;
    region?: string;
    city?: string;
    month?: string;
    course?: string;
    tab?: string;
  }>;
}) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase().trim();

  const events = await getAllEventsRaw("180d");
  const resolvedSearch = await searchParams;
  const validEvents = events.filter(e => e.status !== "cancelled");
  const normalize = (v?: string) =>
    v?.toLowerCase().trim() ?? "";

  const UK_SET = new Set([
    "england",
    "scotland",
    "wales",
    "northern ireland",
  ]);

  let sportEvents = validEvents.filter(
    (e: any) =>
      e.sport?.toLowerCase().trim() === normalizedSlug
  );

  sportEvents = sportEvents.filter((e: any) => {
    const region = normalize(e.region);

    if (resolvedSearch.country === "uk" && !UK_SET.has(region))
      return false;

    if (
      resolvedSearch.country === "ireland" &&
      region !== "ireland"
    )
      return false;

    if (
      resolvedSearch.region &&
      region !== normalize(resolvedSearch.region)
    )
      return false;

    if (
      resolvedSearch.city &&
      e.city !== resolvedSearch.city
    )
      return false;

    if (
      resolvedSearch.course &&
      slugifyVenue(e.venue ?? "") !== resolvedSearch.course
    )
      return false;
          
    if (resolvedSearch.month) {
      const month =
        (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);
      if (month !== resolvedSearch.month) return false;
    }

    return true;
  });

  if (sportEvents.length === 0) {
    notFound();
  }

  const title = normalizedSlug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">

      {/* BACK TO ALL SPORTS */}
      <div>
        <Link
          href="/sport"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Explore All Sports
        </Link>
      </div>

      {/* FILTER */}
      <SportFilterBar
        slug={normalizedSlug}
        events={validEvents.filter(
          (e: any) =>
            e.sport?.toLowerCase().trim() === normalizedSlug
        )}
      />

      {/* HEADER (Date 스타일 맞춤) */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        <p className="text-muted-foreground">
          {sportEvents.length} fixtures · 180-day structural analysis
        </p>
      </header>

      {/* SPORT-SPECIFIC CONTENT */}
      {normalizedSlug === "football" && (
        <FootballSportPage
          events={sportEvents}
          selectedMonth={resolvedSearch.month ?? null}
        />
      )}

      {normalizedSlug === "horse-racing" && (
        <HorseRacingSportPage
          events={sportEvents}
          tab={resolvedSearch.tab ?? "overview"}
          course={resolvedSearch.course ?? null}
        />
      )}

      {normalizedSlug !== "football" &&
        normalizedSlug !== "horse-racing" && (
          <GenericSportPage
            slug={normalizedSlug}
            events={sportEvents}
            selectedMonth={resolvedSearch.month ?? null}
          />
      )}
    </main>
  );
}