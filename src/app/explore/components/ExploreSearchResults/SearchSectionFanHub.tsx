//src/app/explore/components/ExploreSearchResults/SearchSectionFanHub.tsx

"use client";

import Link from "next/link";
import type { SearchPost } from "./index";

export default function SearchSectionFanHub({ posts }: { posts: SearchPost[] }) {
  if (!posts.length) return null;

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-gray-500 mb-2">
        FanHub Posts
      </h3>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {posts.slice(0, 5).map((p) => (
          <li key={p.id}>
            <Link
              href={`/fanhub/${p.id}`}
              className="block py-3 active:bg-gray-50 dark:active:bg-neutral-900 transition"
            >
              <div className="text-sm">{p.text.slice(0, 50)}…</div>
              <div className="text-xs text-gray-500">@{p.authorNickname}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
