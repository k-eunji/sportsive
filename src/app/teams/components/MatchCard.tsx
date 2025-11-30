// src/app/teams/components/MatchCard.tsx

import Image from "next/image";
import type { MatchEvent } from "@/types";
import { formatEventTimeWithOffsetUTC } from "@/utils/date";
import { parseDateSafe } from "@/utils/parseDate";
import { teamLogoMapById, teamLogoMapByName } from "@/data/teamLogos";

function isValidLogoUrl(url?: string) {
  if (!url) return false;
  if (!url.startsWith("http")) return false;
  if (url.includes("example.com")) return false;  // ⛔ 가짜 URL 차단
  return true;
}

function normalizeTeamName(name?: string) {
  if (!name) return "";
  return name.trim();
}

export default function MatchCard({ match, isPast, isCenter }: {
  match: MatchEvent;
  isPast?: boolean;
  isCenter?: boolean;
}) {
  const eventDate = match.date ? parseDateSafe(match.date) : null;

  const homeName = normalizeTeamName(match.homeTeam);
  const awayName = normalizeTeamName(match.awayTeam);

  // 1) 팀 ID → 2) 팀 이름 → 3) API 로고 → 4) default
 const homeLogo = (
    (match.homeTeamId ? teamLogoMapById[Number(match.homeTeamId)] : undefined) ||
    teamLogoMapByName[homeName] ||
    (isValidLogoUrl(match.homeTeamLogo) ? match.homeTeamLogo : undefined) ||
    "/logos/default.svg"
  ) as string;

  const awayLogo = (
    (match.awayTeamId ? teamLogoMapById[Number(match.awayTeamId)] : undefined) ||
    teamLogoMapByName[awayName] ||
    (isValidLogoUrl(match.awayTeamLogo) ? match.awayTeamLogo : undefined) ||
    "/logos/default.svg"
  ) as string;

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-lg 
      border border-gray-200 dark:border-gray-700 
      flex flex-col gap-2
      transition-all duration-300 
      ${isPast ? "opacity-40 grayscale" : ""}
      ${isCenter ? "scale-[1.05]" : ""}
    `}>
      {/* 날짜 */}
      {eventDate && (
        <p className="text-[0.7rem] text-gray-500 dark:text-gray-400 font-medium truncate">
          {formatEventTimeWithOffsetUTC(eventDate)}
        </p>
      )}

      {/* 팀 */}
      <div className="flex items-center justify-between flex-1">
        <div className="flex flex-col items-center w-1/2">
          <Image src={homeLogo} alt={homeName} width={32} height={32} />
          <span>{homeName}</span>
        </div>

        <span className="text-[0.7rem] text-gray-500 dark:text-gray-400">vs</span>

        <div className="flex flex-col items-center w-1/2">
          <Image src={awayLogo} alt={awayName} width={32} height={32} />
          <span>{awayName}</span>
        </div>
      </div>

      {/* 장소 */}
      {match.venue && (
        <div className="text-[0.65rem] text-gray-500 dark:text-gray-400 text-center">
          <div className="truncate">Venue: {match.venue}</div>
          {(match.region || match.city) && (
            <div className="truncate">
              ({[match.region, match.city].filter(Boolean).join(", ")})
            </div>
          )}
        </div>
      )}

      <p className="text-[0.55rem] text-gray-400 dark:text-gray-500 text-center">
        Tickets available via official club website.
      </p>
    </div>
  );
}
