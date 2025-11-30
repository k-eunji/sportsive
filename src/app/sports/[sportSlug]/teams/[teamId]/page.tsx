// src/app/region/[regionSlug]/cities/[citySlug]/teams/[teamId]/page.tsx
"use client";

import Link from "next/link";

// 🏳️ 팀 상세 페이지 (도시 기반 경로)
// 예: /region/england/cities/london/teams/arsenal
export default function CityTeamPage({
  params,
}: {
  params: { regionSlug: string; citySlug: string; teamId: string };
}) {
  const { regionSlug, citySlug, teamId } = params;

  return (
    <main className="max-w-5xl mx-auto pt-24 p-4">
      <h1 className="text-3xl font-bold capitalize">{teamId}</h1>
      <p className="text-gray-600 mb-6">
        Welcome to {teamId}'s fan hub in {citySlug}, {regionSlug}.
      </p>

      <Link
        href={`/region/${regionSlug}/cities/${citySlug}/community`}
        className="text-blue-600 hover:underline"
      >
        ← Back to {citySlug} Community
      </Link>
    </main>
  );
}
