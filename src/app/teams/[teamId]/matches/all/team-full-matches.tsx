//src/app/teams/[teamId]/matches/all/team-full-matches.tsx

"use client";

import { useTeamMatchesAll } from "@/hooks/useTeamMatchesAll";
import MatchRow from "@/app/teams/components/MatchRow"; // ★ 추가
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TeamFullMatches({ teamId }: { teamId: string }) {
  const { matches, loading, error } = useTeamMatchesAll(teamId);

  if (loading)
    return <p className="text-center mt-12 text-gray-500 animate-pulse">Loading...</p>;

  if (error)
    return <p className="text-center mt-12 text-red-500">Failed to load matches.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 pt-24 space-y-6">
      {/* Back button */}
      <Link
        href={`/teams/${teamId}?tab=matches`}
        className="flex items-center gap-2 text-blue-600 hover:underline"
      >
        <ArrowLeft size={18} /> Back to team
      </Link>

      <h1 className="text-2xl font-bold">Full Season Schedule</h1>

      {/* ⭐ ESPN 스타일 리스트 */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {matches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
