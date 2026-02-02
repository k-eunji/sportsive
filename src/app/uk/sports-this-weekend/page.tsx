// src/app/uk/sports-this-weekend/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sports in the UK This Weekend | Sportsive",
  description:
    "Find sports events happening across the UK this weekend. Football, rugby, tennis, darts, and horse racing — updated live.",
};

export default function UKWeekendPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Sports in the UK This Weekend
      </h1>

      <p className="text-lg text-muted-foreground">
        From major cities to local venues, Sportsive helps
        you discover what sports are happening across the UK
        this weekend.
      </p>

      <p className="text-sm text-muted-foreground">
        Browse live listings, check official tickets, and
        explore events on the map.
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
        Open live sports list →
      </Link>
    </main>
  );
}
