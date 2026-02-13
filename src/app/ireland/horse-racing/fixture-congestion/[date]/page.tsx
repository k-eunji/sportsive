///src/app/ireland/horse-racing/fixture-congestion/[date]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { isWithinAllowedRange } from "@/utils/dateRangeGuard";

const IRELAND_REGIONS = [
  "ireland",
  "republic of ireland",
];

type Props = {
  params: Promise<{ date: string }>;
};

function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
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
    title: `Ireland Horse Racing Fixture Congestion — ${displayDate}`,
    description: `Horse racing meeting congestion analysis across Ireland for ${displayDate}, including concurrent session overlap and scheduling density.`,
    alternates: {
      canonical: `https://venuescope.io/ireland/horse-racing/fixture-congestion/${date}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const { date } = await params;

  if (!isValidDate(date) || !isWithinAllowedRange(date)) {
    notFound();
  }

  const events = await getAllEventsRaw("180d");

  const racingEvents = events.filter((e: any) => {
    const rawDate =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      IRELAND_REGIONS.includes(e.region?.toLowerCase()) &&
      e.sport?.toLowerCase().includes("horse") &&
      rawDate === date
    );
  });

  const displayDate = formatDisplayDate(date);

  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);

  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">

      <header className="space-y-6">
        <h1 className="text-4xl font-bold leading-tight">
          Ireland Horse Racing Fixture Congestion — {displayDate}
        </h1>

        <p className="text-muted-foreground">
          {racingEvents.length} race meeting
          {racingEvents.length !== 1 ? "s" : ""} took
          place across Ireland.
        </p>
      </header>

      <section className="flex justify-between border-t pt-6 text-sm">
        <Link
          href={`/ireland/horse-racing/fixture-congestion/${previous.toISOString().slice(0, 10)}`}
          className="underline"
        >
          ← Previous day
        </Link>

        <Link
          href={`/ireland/horse-racing/fixture-congestion/${next.toISOString().slice(0, 10)}`}
          className="underline"
        >
          Next day →
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
