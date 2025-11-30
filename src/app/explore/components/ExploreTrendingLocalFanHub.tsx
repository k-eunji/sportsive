//src/app/explore/components/ExploreTrendingLocalFanHub.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ExploreTrendingLocalFanHub({ city }: { city: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;

    async function load() {
      try {
        const res = await fetch(
          `/api/trending/local/fanhub?city=${encodeURIComponent(city)}`
        );
        const data = await res.json();
        setPosts(data ?? []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [city]);

  if (loading)
    return (
      <section>
        <h2 className="text-[15px] font-semibold mb-3">FanHub Near You</h2>
        <div className="h-14 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse"></div>
      </section>
    );

  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="text-[15px] font-semibold mb-3">FanHub Near You</h2>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {posts.map((p) => (
          <li key={p.id} className="py-3">
            <Link href={`/fanhub/${p.id}`} className="block">
              <div className="text-sm">
                {p.text.length > 70 ? p.text.slice(0, 70) + "…" : p.text}
              </div>

              <div className="text-xs text-gray-500">@{p.authorNickname}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
