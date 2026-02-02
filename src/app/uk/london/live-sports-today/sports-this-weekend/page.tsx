// src/app/uk/london/sports-this-weekend/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sports in London This Weekend | Sportsive",
  description:
    "Discover sports events happening in London this weekend. Football, rugby, tennis, darts, and horse racing — all in one place.",
};

export default function LondonWeekendPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Sports in London This Weekend
      </h1>

      <p className="text-lg text-muted-foreground">
        Looking for live sports in London this weekend?
        Sportsive helps you scan what’s on — football matches,
        rugby games, tennis tournaments, darts nights, and
        horse racing events.
      </p>

      <p className="text-sm text-muted-foreground">
        View live availability, official tickets, and venue
        locations in one place.
      </p>

      <Link
        href="/"
        className="
          inline-block
          mt-6
          text-sm font-semibold
          underline underline-offset-4
        "
      >
        See live sports happening now →
      </Link>
    </main>
  );
}
