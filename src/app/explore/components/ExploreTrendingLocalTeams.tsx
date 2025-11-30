//src/app/explore/components/ExploreTrendingLocalTeams.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ExploreTrendingLocalTeams({ city }: { city: string }) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;

    async function load() {
      try {
        const res = await fetch(
          `/api/trending/local/teams?city=${encodeURIComponent(city)}`
        );
        const json = await res.json();
        setTeams(json ?? []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [city]);

  if (loading)
    return (
      <section>
        <h2 className="text-[15px] font-semibold mb-3">Trending Near You</h2>
        <div className="h-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
      </section>
    );

  if (teams.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-[15px] font-semibold mb-3">Trending Near You</h2>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {teams.map((t) => (
          <li key={t.name} className="py-3">
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
