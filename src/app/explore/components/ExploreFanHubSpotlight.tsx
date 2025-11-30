// src/app/explore/components/ExploreFanHubSpotlight.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FanHubPost = {
  id: string;
  text: string;
  authorNickname: string;
  createdAt?: string;
  tags?: string[];
};

export default function ExploreFanHubSpotlight() {
  const [posts, setPosts] = useState<FanHubPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 🔥 최신 2개만 불러오기
        const res = await fetch("/api/fanhub/list?sort=latest", {
          cache: "no-store",
        });

        const all = await res.json();

        // 안전하게 slice
        setPosts(all.slice(0, 2));
      } catch (err) {
        console.error("FanHub spotlight load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return (
      <section>
        <h2 className="text-[15px] font-semibold mb-3">From FanHub</h2>
        <div className="h-14 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse"></div>
      </section>
    );

  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="text-[15px] font-semibold mb-3">From FanHub</h2>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {posts.map((p) => (
          <li key={p.id} className="py-3">
            <Link href={`/fanhub/${p.id}`} className="block">
              <div className="text-sm">
                {p.text.length > 70 ? p.text.slice(0, 70) + "…" : p.text}
              </div>

              <div className="text-xs text-gray-500">
                @{p.authorNickname}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
