// src/app/uk/horse-racing/page.tsx

import Link from "next/link";
import { getHorseRacingEventsRaw } from "@/lib/events/getHorseRacingEventsRaw";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

export default async function Page() {
  const events = await getHorseRacingEventsRaw();

  const racing2026 = events.filter((e: any) => {
    const year = (e.startDate ?? "").slice(0, 4);
    return (
      e.sport === "horse-racing" &&
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      year === "2026"
    );
  });

  const totalMeetings = racing2026.length;

  /* ===== Busiest Day ===== */

  const groupedByDate: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    const d = (e.startDate ?? "").slice(0, 10);
    groupedByDate[d] = (groupedByDate[d] || 0) + 1;
  });

  const busiest = Object.entries(groupedByDate)
    .sort((a, b) => b[1] - a[1])[0];

  /* ===== Session Split ===== */

  const sessionMap: Record<string, number> = {};
  racing2026.forEach((e: any) => {
    const s = e.sessionTime || "Unknown";
    sessionMap[s] = (sessionMap[s] || 0) + 1;
  });

  const topSession = Object.entries(sessionMap)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <main className="max-w-5xl mx-auto px-6 py-14 space-y-14">

      {/* ===== HEADER ===== */}
      <header className="space-y-4 border-b pb-8">

        <div className="text-xs text-muted-foreground">
          Also view{" "}
          <Link
            href="/ireland/horse-racing"
            className="underline hover:opacity-70"
          >
            Ireland Horse Racing 2026
          </Link>
        </div>

        <h1 className="text-3xl font-bold">
          UK Horse Racing 2026 – National Structural Hub
        </h1>

        <p className="text-muted-foreground max-w-2xl">
          Centralised overview of all scheduled UK horse racing
          meetings during 2026, including congestion analysis,
          session concentration and course distribution.
        </p>

      </header>
      
      {/* ===== KPI GRID ===== */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <Stat title="Total Meetings" value={totalMeetings} />
        <Stat title="Busiest Day" value={busiest?.[0] ?? "-"} />
        <Stat title="Peak Day Volume" value={busiest?.[1] ?? 0} />
        <Stat title="Dominant Session" value={topSession?.[0] ?? "-"} />
      </section>

      {/* ===== CORE ANALYSIS LINKS ===== */}
      <section className="pt-10 border-t space-y-6">
        <h2 className="text-xl font-semibold">
          2026 National Reports
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-sm">

          <Link
            href="/uk/horse-racing/calendar-2026"
            className="block p-4 rounded-xl bg-white hover:bg-gray-50 transition"
          >
            Full 2026 Calendar Overview →
          </Link>

          <Link
            href="/uk/horse-racing/busiest-days-2026"
            className="block p-4 rounded-xl bg-white hover:bg-gray-50 transition"
          >
            Busiest Racing Days →
          </Link>

          <Link
            href="/uk/horse-racing/meeting-frequency-2026"
            className="block p-4 rounded-xl bg-white hover:bg-gray-50 transition"
          >
            Course Frequency Ranking →
          </Link>

          <Link
            href="/uk/horse-racing/overlap-report-2026"
            className="block p-4 rounded-xl bg-white hover:bg-gray-50 transition"
          >
            National Overlap Report →
          </Link>

          <Link
            href="/uk/horse-racing/next-60-days-density"
            className="block p-4 rounded-xl bg-white hover:bg-gray-50 transition"
          >
            Next 60 Days Density →
          </Link>

        </div>
      </section>

      {/* ===== MONTHLY ENTRY POINT ===== */}
      <section className="pt-10 border-t space-y-6">
        <h2 className="text-xl font-semibold">
          Monthly Breakdown – 2026
        </h2>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
          {Array.from({ length: 12 }).map((_, i) => {
            const month = String(i + 1).padStart(2, "0");
            return (
              <Link
                key={month}
                href={`/uk/horse-racing/month/2026/${month}`}
                className="text-center p-3 rounded-lg bg-white hover:bg-gray-50 transition"
              >
                {month}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURED COURSES ===== */}
      <section className="pt-10 border-t space-y-6">
        <h2 className="text-xl font-semibold">
          Featured Racecourses
        </h2>

        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            "ascot",
            "cheltenham",
            "aintree",
            "newmarket",
            "epsom-downs",
            "york",
            "goodwood",
            "sandown-park",
            "doncaster",
            "haydock-park",
            "kempton-park",
            "chester",
          ].map((slug) => (
            <li key={slug}>
              <Link
                href={`/uk/horse-racing/courses/${slug}`}
                className="underline"
              >
                {slug.replace("-", " ")}
              </Link>
            </li>
          ))}
        </ul>
        <li>
            <Link
              href="/uk/horse-racing/courses"
            >
              UK Horse All Courses→
            </Link>
          </li>
      </section>

    </main>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="border rounded-2xl p-6 bg-white">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="text-3xl font-semibold mt-2">
        {value}
      </p>
    </div>
  );
}