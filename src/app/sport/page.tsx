// src/app/sport/page.tsx

import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import Link from "next/link";

export default async function SportIndexPage() {
  const events = await getAllEventsRaw("180d");

  const normalize = (v?: string) =>
    v?.toLowerCase().trim() ?? "";

  const sportCounts: Record<string, number> = {};
  const sportCityMap: Record<string, Set<string>> = {};
  const sportVenueMap: Record<string, Set<string>> = {};
  const monthCounts: Record<string, number> = {};

  events.forEach((e: any) => {
    const sport = normalize(e.sport);
    if (!sport) return;

    sportCounts[sport] = (sportCounts[sport] || 0) + 1;

    if (!sportCityMap[sport]) sportCityMap[sport] = new Set();
    if (!sportVenueMap[sport]) sportVenueMap[sport] = new Set();

    if (e.city) sportCityMap[sport].add(e.city);
    if (e.venue) sportVenueMap[sport].add(e.venue);

    const month =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7);

    if (month) {
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  });

  const sortedSports = Object.entries(sportCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const featuredSports = sortedSports.slice(0, 6);
  const allSports = Object.keys(sportCounts).sort();

  const totalFixtures = events.length;
  const activeSports = allSports.length;

  const topSport = sortedSports[0];

  const peakMonth = Object.entries(monthCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <main className="max-w-6xl mx-auto px-4 py-14 space-y-20">

      {/* HEADER */}

      <header className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">
          Browse Sports
        </h1>

        <p className="text-muted-foreground">
          Explore fixture distribution across sports in the UK & Ireland.
          Select a sport to view venues, cities and upcoming events.
        </p>

        <p className="text-sm text-muted-foreground">
          {totalFixtures} fixtures · {activeSports} sports
        </p>
      </header>


      {/* FEATURED SPORTS */}

      <section className="space-y-6">

        <h2 className="text-xl font-semibold">
          Popular Sports
        </h2>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {featuredSports.map(([sport, count]) => (

            <li key={sport}>

              <Link
                href={`/sport/${sport}`}
                className="
                group block
                rounded-2xl
                bg-zinc-50
                p-6
                shadow-sm
                hover:bg-white
                hover:shadow-md
                transition
                "
              >

                <div className="flex items-start justify-between">

                  <div className="space-y-2">

                    <p className="text-lg font-semibold capitalize">
                      {sport}
                    </p>

                    <p className="text-lg font-semibold">
                      {sport.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      {sportCityMap[sport]?.size ?? 0} cities ·{" "}
                      {sportVenueMap[sport]?.size ?? 0} venues
                    </p>

                  </div>

                  <span className="text-muted-foreground group-hover:translate-x-1 transition">
                    →
                  </span>

                </div>

              </Link>

            </li>

          ))}

        </ul>

      </section>


      {/* ALL SPORTS */}

      <section className="space-y-6">

        <h2 className="text-xl font-semibold">
          All Sports
        </h2>

        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {allSports.map((sport) => (

            <li key={sport}>

              <Link
                href={`/sport/${sport}`}
                className="
                group block
                rounded-xl
                bg-zinc-50
                px-4 py-3
                text-sm
                capitalize
                hover:bg-zinc-100
                transition
                "
              >
                <div className="flex justify-between items-center">

                  <span>{sport}</span>

                  <span className="opacity-40 group-hover:translate-x-1 transition">
                    →
                  </span>

                </div>

              </Link>

            </li>

          ))}

        </ul>

      </section>


      {/* PLATFORM SNAPSHOT */}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-zinc-200">

        <Stat title="Total Fixtures" value={totalFixtures} />

        <Stat title="Active Sports" value={activeSports} />

        <Stat
          title="Peak Sport"
          value={topSport ? capitalize(topSport[0]) : "-"}
        />

        <Stat
          title="Peak Month"
          value={peakMonth ? peakMonth[0] : "-"}
        />

      </section>

    </main>
  );
}


/* =========================
   UTIL
========================= */

function Stat({ title, value }: any) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </p>

      <p className="text-2xl font-semibold mt-2">
        {value}
      </p>
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}