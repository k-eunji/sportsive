// src/app/explore/components/ExploreTrendingTeams.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TrendingTeam = {
  name: string;
  score: number;
};

export default function ExploreTrendingTeams() {
  const [teams, setTeams] = useState<TrendingTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/trending/teams", {
          cache: "no-store",
        });

        const data = await res.json();
        setTeams(data.slice(0, 5)); // Top 5만 표시
      } catch (err) {
        console.error("Trending teams load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return (
      <section>
        <h2 className="text-[15px] font-semibold mb-3">Trending Teams</h2>
        <div className="h-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse"></div>
      </section>
    );

  if (teams.length === 0) return null;

  return (
    <section>
      <h2 className="text-[15px] font-semibold mb-3">Trending Teams</h2>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {teams.map((t) => (
          <li
            key={t.name}
            className="py-3 active:bg-gray-50 dark:active:bg-neutral-900 transition-colors"
          >
            <Link
              href={`/teams?search=${encodeURIComponent(t.name)}`}
              className="block text-sm"
            >
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
