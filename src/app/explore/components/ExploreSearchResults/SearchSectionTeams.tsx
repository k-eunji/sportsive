//src/app/explore/components/ExploreSearchResults/SearchSectionTeams.tsx

"use client";

import Link from "next/link";
import type { SearchTeam } from "./index";

export default function SearchSectionTeams({ teams }: { teams: SearchTeam[] }) {
  if (!teams.length) return null;

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-gray-500 mb-2">Teams</h3>

      <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
        {teams.slice(0, 5).map((t) => (
          <li key={t.id}>
            <Link
              href={`/teams/${t.id}`}
              className="block py-3 active:bg-gray-50 dark:active:bg-neutral-900 transition"
            >
              <div className="text-sm font-medium">{t.name}</div>
              {(t.city || t.region) && (
                <div className="text-xs text-gray-500">
                  {t.city} · {t.region}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
