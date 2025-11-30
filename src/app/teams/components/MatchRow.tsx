//src/app/teams/components/MatchRow.tsx

import Image from "next/image";
import { format } from "date-fns";
import { parseDateSafe } from "@/utils/parseDate";

export default function MatchRow({ match }: any) {
  const date = parseDateSafe(match.date);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
      {/* 날짜 */}
      <div className="w-24 text-sm font-medium text-gray-600 dark:text-gray-300">
        {format(date, "MMM d")}
      </div>

      {/* 팀명 */}
      <div className="flex flex-col flex-1 px-3">
        <div className="flex items-center gap-2">
          {match.homeTeamLogo && (
            <Image src={match.homeTeamLogo} width={22} height={22} alt="" />
          )}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {match.homeTeam}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {match.awayTeamLogo && (
            <Image src={match.awayTeamLogo} width={22} height={22} alt="" />
          )}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {match.awayTeam}
          </span>
        </div>
      </div>

      {/* 시간 */}
      <div className="w-20 text-right text-sm text-gray-500 dark:text-gray-400">
        {format(date, "HH:mm")}
      </div>
    </div>
  );
}
