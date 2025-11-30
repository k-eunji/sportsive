//src/app/explore/components/ExploreSearchResults/SearchSectionMeetups.tsx

"use client";

import Link from "next/link";
import type { SearchMeetup } from "./index";

export default function SearchSectionMeetups({
  meetups,
}: {
  meetups: SearchMeetup[];
}) {
  if (!meetups.length) return null;

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-gray-500 mb-2">
        Meetups
      </h3>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {meetups.slice(0, 5).map((m) => (
          <li key={m.id}>
            <Link
              href={`/meetups/${m.id}`}
              className="block py-3 active:bg-gray-50 dark:active:bg-neutral-900 transition"
            >
              <div className="text-sm font-medium">{m.title}</div>
              <div className="text-xs text-gray-500">
                {m.city} · {m.date?.slice(0, 10)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
