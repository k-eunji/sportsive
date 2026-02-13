// src/app/uk/fixture-congestion/next-weekend/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title:
    "UK Sports Congestion — Next Weekend | Operational Overview",
  description:
    "Operational congestion overview for professional sports fixtures taking place across the United Kingdom next weekend.",
  alternates: {
    canonical:
      "https://venuescope.io/uk/fixture-congestion/next-weekend",
  },
};

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

function getNextWeekendRange() {
  const now = new Date();

  const base = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/London" })
  );

  const day = base.getDay();
  const thisSaturdayOffset = (6 - day + 7) % 7;

  base.setDate(base.getDate() + thisSaturdayOffset + 7);

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

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export default async function Page() {
  const events = await getAllEventsRaw("180d");
  const { saturday, sunday, satKey, sunKey } =
    getNextWeekendRange();

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

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          UK Sports Congestion — Next Weekend
        </h1>

        <p className="text-muted-foreground">
          {formatDate(saturday)} – {formatDate(sunday)}
        </p>

        <p className="text-muted-foreground">
          {weekendEvents.length} professional fixtures are
          scheduled across the United Kingdom next weekend.
        </p>
      </header>

      <section className="space-y-6 border rounded-xl p-8">

        <h2 className="text-2xl font-semibold">
          Saturday — {formatDate(saturday)}
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
            No major professional sporting activity is scheduled in the UK on Saturday next weekend.
          </p>
        ) : (
          <p>
            Saturday activity next weekend is concentrated around key kickoff windows.
            Overlapping fixtures may increase transport demand, policing coverage requirements
            and stadium staffing pressure, particularly during peak periods.
          </p>
        )}
      </div>

      <section className="space-y-6 border rounded-xl p-8">

        <h2 className="text-2xl font-semibold">
          Sunday — {formatDate(sunday)}
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
            No major professional sporting activity is scheduled in the UK on Sunday next weekend.
          </p>
        ) : (
          <p>
            Sunday scheduling density next weekend may affect broadcast allocation,
            transport flow management and steward planning, particularly where fixtures
            cluster in afternoon windows.
          </p>
        )}
      </div>

      <section className="pt-6 border-t space-y-4 text-sm">
        <Link
          href="/uk/sports-next-weekend"
          className="block underline underline-offset-4"
        >
          View full fixture list →
        </Link>

        <Link
          href="/uk/fixture-congestion/this-weekend"
          className="block underline underline-offset-4"
        >
          View this weekend congestion →
        </Link>
      </section>

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
