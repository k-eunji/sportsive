//src/app/explore/components/TeamLogoRow.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TeamLogoRow({
  teams,
}: {
  teams: { id?: string | number | null; name: string; logo?: string | null }[];
}) {
  const [idMap, setIdMap] = useState<Record<string, string>>({});

  // 🔥 모든 팀 이름 → id 매핑 로딩
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/teams", { cache: "force-cache" });
      const json = await res.json();

      const map: Record<string, string> = {};
      json.teams.forEach((t: any) => {
        map[t.name.toLowerCase()] = String(t.id);
      });
      setIdMap(map);
    }
    load();
  }, []);

  if (!teams || teams.length === 0) return null;

  return (
    <div className="grid grid-cols-5 gap-4 justify-items-center py-3">
      {teams.map((team) => {
        const rawId = team.id ? String(team.id) : null;

        // ⭐ 이름 기반 fallback id 매핑
        const autoId =
          rawId ||
          idMap[team.name.toLowerCase()] ||
          null;

        const clickable = Boolean(autoId);

        return (
          <div
            key={`${team.name}-${autoId ?? "noid"}`}
            className="flex flex-col items-center"
          >
            {clickable ? (
              <Link href={`/teams/${autoId}`} className="flex flex-col items-center">
                <img
                  src={team.logo || "/placeholder-logo.png"}
                  alt={team.name}
                  className="w-12 h-12 rounded-full border border-gray-200 object-cover hover:scale-105 transition-transform"
                />
                <p className="text-xs mt-1 text-center">{team.name}</p>
              </Link>
            ) : (
              <div className="flex flex-col items-center opacity-50 cursor-not-allowed">
                <img
                  src={team.logo || "/placeholder-logo.png"}
                  alt={team.name}
                  className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                />
                <p className="text-xs mt-1 text-center">{team.name}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
