// src/app/uk/fixture-congestion/this-weekend/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title:
    "UK Sports Congestion This Weekend | Operational Fixture Density Report",
  description:
    "Operational analysis of professional sports fixtures across the United Kingdom this weekend, including peak kickoff windows, regional concentration and congestion intensity.",
  alternates: {
    canonical:
      "https://venuescope.io/uk/fixture-congestion/this-weekend",
  },
};

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

function getWeekendRange() {
  const now = new Date();

  const base = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/London" })
  );

  const day = base.getDay();

  if (day !== 6) {
    base.setDate(base.getDate() + ((6 - day + 7) % 7));
  }

  const saturday = new Date(base);
  const sunday = new Date(base);
  sunday.setDate(base.getDate() + 1);

  const satKey = saturday.toLocaleDateString("en-CA", {
    timeZone: "Europe/London",
  });

  const sunKey = sunday.toLocaleDateString("en-CA", {
    timeZone: "Europe/London",
  });

  return { saturday, sunday, satKey, sunKey };
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export default async function Page() {
  const events = await getAllEventsRaw("7d");

  const { saturday, sunday, satKey, sunKey } =
    getWeekendRange();

  const weekendEvents = events.filter((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return false;

    const key = new Date(raw).toLocaleDateString("en-CA", {
      timeZone: "Europe/London",
    });

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      (key === satKey || key === sunKey)
    );
  });

  /* ========================
     Day Breakdown
  ======================== */

  const saturdayEvents = weekendEvents.filter((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return false;

    const key = new Date(raw).toLocaleDateString("en-CA", {
      timeZone: "Europe/London",
    });

    return key === satKey;
  });

  const sundayEvents = weekendEvents.filter((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return false;

    const key = new Date(raw).toLocaleDateString("en-CA", {
      timeZone: "Europe/London",
    });

    return key === sunKey;
  });

  const busiestDay =
    saturdayEvents.length >= sundayEvents.length
      ? "Saturday"
      : "Sunday";

  /* ========================
     Hourly Overlap
  ======================== */

  const hourMap = new Map<number, number>();

  weekendEvents.forEach((e: any) => {
    const raw = e.startDate ?? e.date ?? e.utcDate;
    if (!raw) return;

    const hour = Number(
      new Date(raw).toLocaleString("en-GB", {
        hour: "2-digit",
        hour12: false,
        timeZone: "Europe/London",
      })
    );

    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
  });

  const sortedHours = [...hourMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const peak = sortedHours[0];

  const peakRatio =
    peak && weekendEvents.length > 0
      ? Math.round((peak[1] / weekendEvents.length) * 100)
      : 0;

  /* ========================
     Regional Distribution
  ======================== */

  const regionMap = new Map<string, number>();

  weekendEvents.forEach((e: any) => {
    const r = e.region ?? "Other";
    regionMap.set(r, (regionMap.get(r) ?? 0) + 1);
  });

  const regionBreakdown = [...regionMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  /* ======================== */

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">

      {/* ================= HEADER ================= */}

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          UK Sports Congestion — This Weekend
        </h1>

        <p className="text-muted-foreground">
          {formatDisplayDate(saturday)} –{" "}
          {formatDisplayDate(sunday)}
        </p>
      </header>



      {/* ===================================================== */}
      {/* ==================== SATURDAY ======================== */}
      {/* ===================================================== */}

      <section className="space-y-6 border rounded-xl p-8">

        <h2 className="text-2xl font-semibold">
          Saturday — {formatDisplayDate(saturday)}
        </h2>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total fixtures
            </p>
            <p className="text-3xl font-semibold">
              {saturdayEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Peak hour
            </p>
            <p className="text-3xl font-semibold">
              {(() => {
                const map = new Map<number, number>();

                saturdayEvents.forEach((e: any) => {
                  const raw = e.startDate ?? e.date ?? e.utcDate;
                  if (!raw) return;

                  const hour = Number(
                    new Date(raw).toLocaleString("en-GB", {
                      hour: "2-digit",
                      hour12: false,
                      timeZone: "Europe/London",
                    })
                  );

                  map.set(hour, (map.get(hour) ?? 0) + 1);
                });

                const sorted = [...map.entries()].sort(
                  (a, b) => b[1] - a[1]
                );

                return sorted[0] ? `${sorted[0][0]}:00` : "—";
              })()}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Regional spread
            </p>
            <p className="text-3xl font-semibold">
              {new Set(saturdayEvents.map((e: any) => e.region)).size}
            </p>
          </div>
        </div>

      </section>

      {/* Saturday interpretation */}

      <div className="pt-4 border-t text-sm text-muted-foreground leading-relaxed">
        {saturdayEvents.length === 0 ? (
          <p>
            No major professional sporting activity is scheduled in the UK on Saturday.
          </p>
        ) : (
          <p>
            Saturday activity is concentrated around key kickoff windows.
            Overlapping fixtures may increase transport demand,
            policing coverage requirements and stadium staffing pressure,
            particularly during peak periods.
          </p>
        )}
      </div>
      
      {/* ===================================================== */}
      {/* ==================== SUNDAY ========================== */}
      {/* ===================================================== */}

      <section className="space-y-6 border rounded-xl p-8">

        <h2 className="text-2xl font-semibold">
          Sunday — {formatDisplayDate(sunday)}
        </h2>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total fixtures
            </p>
            <p className="text-3xl font-semibold">
              {sundayEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Peak hour
            </p>
            <p className="text-3xl font-semibold">
              {(() => {
                const map = new Map<number, number>();

                sundayEvents.forEach((e: any) => {
                  const raw = e.startDate ?? e.date ?? e.utcDate;
                  if (!raw) return;

                  const hour = Number(
                    new Date(raw).toLocaleString("en-GB", {
                      hour: "2-digit",
                      hour12: false,
                      timeZone: "Europe/London",
                    })
                  );

                  map.set(hour, (map.get(hour) ?? 0) + 1);
                });

                const sorted = [...map.entries()].sort(
                  (a, b) => b[1] - a[1]
                );

                return sorted[0] ? `${sorted[0][0]}:00` : "—";
              })()}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Regional spread
            </p>
            <p className="text-3xl font-semibold">
              {new Set(sundayEvents.map((e: any) => e.region)).size}
            </p>
          </div>
        </div>

      </section>

      {/* Sunday interpretation */}

      <div className="pt-4 border-t text-sm text-muted-foreground leading-relaxed">
        {sundayEvents.length === 0 ? (
          <p>
            No major professional sporting activity is scheduled in the UK on Sunday.
          </p>
        ) : (
          <p>
            Sunday scheduling density may affect broadcast allocation,
            transport flow management and steward planning,
            particularly where fixtures cluster in afternoon windows.
          </p>
        )}
      </div>


      {/* ================= LINK TO FAN VIEW ================= */}

      <section className="pt-6 border-t space-y-4 text-sm">
        <Link
          href="/uk/sports-next-weekend"
          className="block underline underline-offset-4"
        >
          View full fixture list →
        </Link>

        <Link
          href="/uk/fixture-congestion/next-weekend"
          className="block underline underline-offset-4"
        >
          View next weekend congestion →
        </Link>
      </section>

      {/* ================= CTA ================= */}

      <section>
        <Link
          href="/ops"
          className="inline-block px-5 py-3 rounded-md bg-black text-white text-sm font-medium"
        >
          Open Operations Dashboard →
        </Link>
      </section>

    </main>
  );
}
