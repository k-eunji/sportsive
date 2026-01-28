//src/app/uk/football-today/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Football Matches in the UK Today | Sportsive",
  description:
    "Find football matches happening across the UK today. Premier League, Championship and other fixtures — with links to other live sports like horse racing, rugby, basketball, tennis and darts.",
};

export default function UKFootballTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Football matches happening in the UK today
      </h1>

      <p className="text-muted-foreground">
        Looking for football matches in the UK today?
        This page helps you discover live football games happening across
        the United Kingdom, including Premier League, Championship, EFL League 1 and EFL League 2
        lower league fixtures.
      </p>

      <p className="text-muted-foreground">
        Football events are often spread across different club websites,
        making them hard to find unless you already know what you’re looking for.
        Sportsive brings live sports together so you can quickly check
        what’s actually happening today.
      </p>

      <h2 className="text-xl font-semibold pt-4">
        Other live sports happening in the UK today
      </h2>

      <p className="text-muted-foreground">
        In addition to football, you can also discover other live sports
        happening across the UK today:
      </p>

      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
        <li>
          <strong>Horse racing</strong> — race meetings across England, Scotland and Wales
        </li>
        <li>
          <strong>Rugby</strong> — Premiership Rugby and other domestic fixtures
        </li>
        <li>
          <strong>Basketball</strong> — Super League Basketball(SLB), British Basketball League games
        </li>
        <li>
          <strong>Tennis</strong> — tournaments and match sessions
        </li>
        <li>
          <strong>Darts</strong> — professional and tournament events
        </li>
      </ul>

      <h2 className="text-xl font-semibold pt-4">
        Ireland sports note
      </h2>

      <p className="text-muted-foreground">
        In Ireland, Sportsive currently focuses on horse racing events.
        You can explore Irish race meetings and sessions separately.
      </p>

      <ul className="list-disc pl-6 text-muted-foreground">
        <li>
          <a
            href="/ireland/horse-racing-today"
            className="underline underline-offset-4"
          >
            Horse racing in Ireland today
          </a>
        </li>
      </ul>

      <a
        href="/app"
        className="inline-block mt-6 underline underline-offset-4"
      >
        Open the live sports map
      </a>
    </main>
  );
}
