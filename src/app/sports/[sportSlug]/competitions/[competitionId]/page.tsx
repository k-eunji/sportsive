// src/app/sports/[sportSlug]/competitions/[competitionId]/page.tsx
"use client";

import React from "react";
import Link from "next/link";

// 🏆 리그 / 대회 페이지
// 예: Premier League 팀 목록, 경기 일정 표시
export default function CompetitionPage({
  params,
}: {
  params: { sportSlug: string; competitionId: string };
}) {
  const { sportSlug, competitionId } = params;

  return (
    <main className="max-w-5xl mx-auto pt-24 p-4">
      <h1 className="text-3xl font-bold mb-4">
        {competitionId.replace("-", " ")} ({sportSlug})
      </h1>
      <p className="text-gray-600 mb-6">
        View all teams and matches in this competition.
      </p>

      {/* 예시 팀 목록 */}
      <ul className="space-y-3">
        <li>
          <Link href={`/sports/${sportSlug}/teams/arsenal`} className="text-blue-600 hover:underline">
            Arsenal FC →
          </Link>
        </li>
        <li>
          <Link href={`/sports/${sportSlug}/teams/chelsea`} className="text-blue-600 hover:underline">
            Chelsea FC →
          </Link>
        </li>
      </ul>
    </main>
  );
}
