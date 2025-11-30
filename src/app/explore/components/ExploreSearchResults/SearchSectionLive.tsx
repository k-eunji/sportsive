//src/app/explore/components/ExploreSearchResults/SearchSectionLive.tsx

"use client";

import Link from "next/link";
import type { SearchLiveRoom } from "./index";

export default function SearchSectionLive({ rooms }: { rooms: SearchLiveRoom[] }) {
  if (!rooms.length) return null;

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-gray-500 mb-2">
        Live Rooms
      </h3>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {rooms.slice(0, 5).map((r) => (
          <li key={r.id}>
            <Link
              href={`/live/${r.id}`}
              className="block py-3 active:bg-gray-50 dark:active:bg-neutral-900 transition"
            >
              <div className="text-sm font-medium">{r.title}</div>
              <div className="text-xs text-gray-500">
                {r.participants} people watching
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
