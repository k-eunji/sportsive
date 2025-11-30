// src/app/teams/components/TeamCard.tsx

import Link from "next/link";
import { Team } from "../hooks/useTeams";
import { teamLogoMapById } from "@/data/teamLogos";

export default function TeamCard({ team }: { team: Team }) {
  const isEngland = team.id === "england";

  // 🔥 England → 외부 URL, 나머지 → 로컬 logos
  const numericId = parseInt(team.id, 10);
  const logoSrc =
    isEngland
      ? team.logo
      : teamLogoMapById[numericId] || team.logo || "/logos/default.svg";

  return (
    <Link
      href={`/teams/${team.id}`}
      className={`flex flex-col items-center text-center group transition-all duration-300 ${
        isEngland ? "hover:scale-110" : "hover:scale-105"
      }`}
    >
      {/* ❗ team.logo 조건 제거 — 항상 로고 박스를 렌더링 */}
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden transition-all duration-500 
          ${
            isEngland
              ? "w-16 h-12 sm:w-20 sm:h-14 bg-gradient-to-br from-white/80 via-white/50 to-red-100/70 backdrop-blur-md shadow-[0_0_15px_rgba(255,0,0,0.2)] border border-white/30 hover:shadow-[0_0_25px_rgba(255,0,0,0.35)]"
              : "w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
          }`}
      >
        <img
          src={logoSrc}   // ← 이제 이 값이 정확히 사용됨
          alt={team.name}
          className={`object-contain ${
            isEngland ? "w-full h-full rounded-md" : "w-8 h-8 sm:w-10 sm:h-10"
          }`}
        />

        {isEngland && (
          <div className="absolute inset-0 bg-gradient-to-t from-red-100/20 via-transparent to-transparent opacity-80 pointer-events-none" />
        )}
      </div>

      <div className="mt-1.5 w-full px-1">
        <h2
          className={`text-[11px] sm:text-xs md:text-sm font-medium text-center truncate transition-colors duration-300 ${
            isEngland
              ? "bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent font-semibold drop-shadow-sm"
              : "text-gray-900 dark:text-white group-hover:text-sky-400"
          }`}
          title={team.name}
        >
          {team.name}
        </h2>
      </div>
    </Link>
  );
}
