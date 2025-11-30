//src/app/explore/components/ExploreTrendingLocalLeagues.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ExploreTrendingLocalLeagues({ city }: { city: string }) {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;

    async function load() {
      try {
        const res = await fetch(
          `/api/trending/local/leagues?city=${encodeURIComponent(city)}`
        );
        const json = await res.json();
        setLeagues(json ?? []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [city]);

  if (loading)
    return (
      <section>
        <h2 className="text-[15px] font-semibold mb-3">Popular Leagues Near You</h2>
        <div className="h-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
      </section>
    );

  if (leagues.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-[15px] font-semibold mb-3">Popular Leagues Near You</h2>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {leagues.map((l) => (
          <li key={l.name} className="py-3">
            <Link
              href={`/teams?competition=${encodeURIComponent(l.name)}`}
              className="block text-sm"
            >
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
