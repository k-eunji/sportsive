//src/app/ireland/horse-racing/fixture-congestion/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";

const IRELAND_REGIONS = [
  "ireland",
  "republic of ireland",
];

export const metadata: Metadata = {
  title:
    "Ireland Horse Racing Fixture Congestion Today | Meeting Overlap Analysis",
  description:
    "Live Irish horse racing congestion report highlighting concurrent race meetings, peak overlap windows and national scheduling density.",
  alternates: {
    canonical:
      "https://venuescope.io/ireland/horse-racing/fixture-congestion",
  },
};

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("en-IE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function Page() {
  const events = await getAllEventsRaw("180d");

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const displayDate = formatDisplayDate(today);

  const racingEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      IRELAND_REGIONS.includes(e.region?.toLowerCase()) &&
      e.sport?.toLowerCase().includes("horse") &&
      eventKey === todayKey
    );
  });

  const hourMap = new Map<number, number>();
  for (let h = 0; h < 24; h++) hourMap.set(h, 0);

  racingEvents.forEach((e: any) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);

    for (let h = 0; h < 24; h++) {
      const check = new Date(`${todayKey}T${String(h).padStart(2, "0")}:00:00`);
      if (check >= start && check <= end) {
        hourMap.set(h, (hourMap.get(h) ?? 0) + 1);
      }
    }
  });

  const sortedHours = [...hourMap.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const peak = sortedHours[0];

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">

      <header className="space-y-6 border-b border-border/30">
        <h1 className="text-4xl font-bold leading-tight">
          Ireland Horse Racing Fixture Congestion — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {racingEvents.length} race meeting
          {racingEvents.length !== 1 ? "s" : ""} are
          scheduled across Ireland today.
        </p>
      </header>

      {racingEvents.length > 0 && peak && (
        <section className="border rounded-xl p-8 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total meetings
              </p>
              <p className="text-3xl font-semibold">
                {racingEvents.length}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Peak overlap hour
              </p>
              <p className="text-3xl font-semibold">
                {peak ? `${peak[0]}:00` : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Concurrent meetings
              </p>
              <p className="text-3xl font-semibold">
                {peak ? peak[1] : "—"}
              </p>
            </div>
          </div>
        </section>
      )}

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
