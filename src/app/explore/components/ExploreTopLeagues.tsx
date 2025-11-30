// src/app/explore/components/ExploreTopLeagues.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LeagueItem = {
  name: string;
  score: number;
};

export default function ExploreTopLeagues() {
  const [leagues, setLeagues] = useState<LeagueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/trending/leagues", {
          cache: "no-store",
        });

        const data = await res.json();
        setLeagues(data.slice(0, 6)); // Top 6만 표시
      } catch (err) {
        console.error("Trending leagues load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return (
      <section className="mb-12">
        <h2 className="text-[15px] font-semibold mb-3">Top Leagues</h2>
        <div className="h-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse"></div>
      </section>
    );

  if (leagues.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-[15px] font-semibold mb-3">Top Leagues</h2>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {leagues.map((l) => (
          <li
            key={l.name}
            className="py-3 text-sm active:bg-gray-50 dark:active:bg-neutral-900 transition"
          >
            <Link href={`/teams?competition=${encodeURIComponent(l.name)}`}>
              {l.name} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
