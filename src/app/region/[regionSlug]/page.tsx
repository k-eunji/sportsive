// src/app/region/[regionSlug]/page.tsx
"use client";

import Link from "next/link";

// 🌍 국가 단위 스포츠 개요 페이지
// 예: /region/england
export default function RegionCountryPage({ params }: { params: { regionSlug: string } }) {
  const { regionSlug } = params;

  return (
    <main className="max-w-6xl mx-auto pt-24 p-4 space-y-4">
      <h1 className="text-3xl font-bold capitalize">{regionSlug}</h1>
      <p className="text-gray-600 mb-6">
        Explore cities, leagues, and teams in {regionSlug}.
      </p>

      {/* 도시 목록 (예시) */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Major Cities</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href={`/region/${regionSlug}/cities/london`}
              className="text-blue-600 hover:underline"
            >
              🏙️ London →
            </Link>
          </li>
          <li>
            <Link
              href={`/region/${regionSlug}/cities/manchester`}
              className="text-blue-600 hover:underline"
            >
              🏙️ Manchester →
            </Link>
          </li>
        </ul>
      </section>

      {/* 리그 정보 */}
      <section className="pt-6">
        <h2 className="text-xl font-semibold mb-3">Leagues & Competitions</h2>
        <ul className="space-y-2">
          <li>⚽ Premier League</li>
          <li>🏆 FA Cup</li>
        </ul>
      </section>
    </main>
  );
}
