//src/app/explore/components/ExploreSearchResults/SearchSectionEvents.tsx

"use client";

import Link from "next/link";
import type { SearchEvent } from "./index";

export default function SearchSectionEvents({
  events,
}: {
  events: SearchEvent[];
}) {
  if (!events.length) return null;

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-gray-500 mb-2">
        Matches
      </h3>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {events.slice(0, 5).map((e) => (
          <li key={e.id}>
            <Link
              href={`/events/${e.id}`}
              className="block py-3 active:bg-gray-50 dark:active:bg-neutral-900 transition"
            >
              <div className="text-sm font-medium">
                {e.homeTeam} vs {e.awayTeam}
              </div>

              <div className="text-xs text-gray-500">
                {e.competition} · {e.date?.slice(0, 10)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
