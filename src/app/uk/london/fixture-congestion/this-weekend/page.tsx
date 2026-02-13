///src/app/uk/london/fixture-congestion/this-weekend/page.tsx

// src/app/uk/london/fixture-congestion/this-weekend/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

export const metadata: Metadata = {
  title:
    "London Sports Congestion — This Weekend | Operational Overview",
  description:
    "Operational congestion overview for professional sports fixtures taking place in London this weekend, including peak overlap windows and scheduling density.",
  alternates: {
    canonical:
      "https://venuescope.io/uk/london/fixture-congestion/this-weekend",
  },
};

function getWeekendDateKeys() {
  const now = new Date();

  const saturday = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/London" })
  );

  const day = saturday.getDay();

  if (day !== 6) {
    saturday.setDate(saturday.getDate() + ((6 - day + 7) % 7));
  }

  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  const satKey = saturday.toLocaleDateString("en-CA", {
    timeZone: "Europe/London",
  });

  const sunKey = sunday.toLocaleDateString("en-CA", {
    timeZone: "Europe/London",
  });

  return { satKey, sunKey, saturday, sunday };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export default async function LondonWeekendCongestionPage() {
  const events = await getAllEventsRaw("7d");

  const { satKey, sunKey, saturday, sunday } =
    getWeekendDateKeys();

  /* =====================
     FILTER LONDON
  ===================== */

  const londonWeekendEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.city?.toLowerCase() === "london" &&
      (eventKey === satKey || eventKey === sunKey)
    );
  });

  const saturdayEvents = londonWeekendEvents.filter((e: any) =>
    (e.startDate ?? e.date ?? e.utcDate)
      ?.slice(0, 10)
      .includes(satKey)
  );

  const sundayEvents = londonWeekendEvents.filter((e: any) =>
    (e.startDate ?? e.date ?? e.utcDate)
      ?.slice(0, 10)
      .includes(sunKey)
  );

  /* =====================
     PEAK CALCULATION
  ===================== */

  const hourMap = new Map<number, number>();

  londonWeekendEvents.forEach((e: any) => {
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
    peak && londonWeekendEvents.length > 0
      ? Math.round(
          (peak[1] / londonWeekendEvents.length) * 100
        )
      : 0;

  const busiestDay =
    saturdayEvents.length > sundayEvents.length
      ? "Saturday"
      : sundayEvents.length > saturdayEvents.length
      ? "Sunday"
      : "Balanced";

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">

      {/* ================= HEADER ================= */}

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          London Sports Congestion — This Weekend
        </h1>

        <p className="text-muted-foreground">
          {formatDate(saturday)} – {formatDate(sunday)}
        </p>

        <p className="text-muted-foreground leading-relaxed">
          A total of {londonWeekendEvents.length} professional
          sporting events are scheduled across London this
          weekend. Activity is distributed across multiple
          stadium and arena venues.
        </p>
      </header>

      {/* ================= KPI ================= */}

      <section className="border rounded-xl p-8 space-y-6">
        <div className="grid grid-cols-3 gap-6">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total fixtures
            </p>
            <p className="text-3xl font-semibold">
              {londonWeekendEvents.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Busiest day
            </p>
            <p className="text-3xl font-semibold">
              {busiestDay}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Peak kickoff hour
            </p>
            <p className="text-3xl font-semibold">
              {peak ? `${peak[0]}:00` : "—"}
            </p>
          </div>

        </div>

        {peak && (
          <p className="text-sm text-muted-foreground">
            Approximately {peakRatio}% of weekend fixtures are
            concentrated within the peak hour window.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
            Day breakdown
        </h2>

        <ul className="text-muted-foreground space-y-1">
            <li>
            Saturday — {saturdayEvents.length} fixture
            {saturdayEvents.length !== 1 ? "s" : ""}
            </li>
            <li>
            Sunday — {sundayEvents.length} fixture
            {sundayEvents.length !== 1 ? "s" : ""}
            </li>
        </ul>
        </section>


      {/* ================= OPERATIONAL ================= */}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Operational interpretation
        </h2>

        <p className="text-muted-foreground leading-relaxed">
          Overlapping kickoff windows may increase transport
          demand across Underground and mainline rail networks,
          particularly in areas surrounding major stadium
          clusters. Staffing and steward allocation should be
          aligned with peak concentration periods.
        </p>
      </section>

      {/* ================= LINKS ================= */}

      <section className="pt-6 border-t space-y-4 text-sm">

        <Link
          href="/uk/london/sports-this-weekend"
          className="block underline underline-offset-4"
        >
          View full London fixture list →
        </Link>

        <Link
          href="/uk/london/fixture-congestion/next-weekend"
          className="block underline underline-offset-4"
        >
          View London next weekend congestion →
        </Link>
    
        <Link
          href="/uk/fixture-congestion/this-weekend"
          className="underline underline-offset-4"
        >
          View UK-wide weekend congestion →
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
