// src/app/teams/components/TeamList.tsx

import TeamCard from "./TeamCard";
import { Team } from "../hooks/useTeams";

interface Props {
  teams: Team[];
}

export default function TeamList({ teams }: Props) {
  return (
    <div
      className="
        grid 
        grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 
        gap-2 sm:gap-3 md:gap-4
      "
    >
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
