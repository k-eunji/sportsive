// src/app/teams/components/TeamInfoCard.tsx

import { FaInstagram, FaYoutube } from "react-icons/fa";
import { SiX } from "react-icons/si"; // X 로고
import { Team } from "@/types/team";

interface Props {
  team: Team;
}

export default function TeamInfoCard({ team }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
      
      {/* 팀 정보 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Team Info</h2>

        <div className="flex flex-col gap-2 text-gray-900 dark:text-gray-100">
          {/* Founded 맨 위 */}
          <div className="flex gap-2">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Founded:</span>
            <span>{team.foundedYear || "-"}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Region:</span>
            <span>{team.region || "-"}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">City:</span>
            <span>{team.city || "-"}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Venue:</span>
            <span>{team.venue || "-"}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Transport:</span>
            <span>{team.transportInfo || "-"}</span>
          </div>
        </div>
      </div>

      {/* SNS / 링크 */}
      <div className="flex items-center gap-3 text-sm">
        {team.instagram && (
          <a href={team.instagram} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
            <FaInstagram size={20} color="#E1306C" />
          </a>
        )}
        {team.x && (
          <a href={team.x} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
            <SiX size={20} color="#000000" /> {/* X는 블랙 */}
          </a>
        )}

        {team.youtube && (
          <a href={team.youtube} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
            <FaYoutube size={20} color="#FF0000" />
          </a>
        )}
        {team.homepageUrl && (
          <a
            href={team.homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors font-medium text-sm"
          >
            Homepage
          </a>
        )}
      </div>
    </div>
  );
}
