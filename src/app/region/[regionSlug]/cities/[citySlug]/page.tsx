// src/app/region/[regionSlug]/cities/[citySlug]/page.tsx
"use client";

import Link from "next/link";

// 🏙️ 도시 단위 스포츠 커뮤니티 페이지
// 예: /region/england/cities/london
export default function CityPage({
  params,
}: {
  params: { regionSlug: string; citySlug: string };
}) {
  const { regionSlug, citySlug } = params;

  return (
    <main className="max-w-5xl mx-auto pt-24 p-4 space-y-6">
      <h1 className="text-3xl font-bold capitalize">
        {citySlug}, {regionSlug}
      </h1>
      <p className="text-gray-600">
        Discover teams, meetups, and events happening in {citySlug}.
      </p>

      {/* 링크 섹션 */}
      <ul className="space-y-3">
        <li>
          <Link
            href={`/region/${regionSlug}/cities/${citySlug}/community`}
            className="text-blue-600 hover:underline"
          >
            💬 View Local Community →
          </Link>
        </li>
        <li>
          <Link
            href={`/region/${regionSlug}/cities/${citySlug}/events`}
            className="text-blue-600 hover:underline"
          >
            🗓️ View Local Events →
          </Link>
        </li>
        <li>
          <Link
            href={`/region/${regionSlug}/cities/${citySlug}/teams/arsenal`}
            className="text-blue-600 hover:underline"
          >
            ⚽ Explore Arsenal →
          </Link>
        </li>
      </ul>
    </main>
  );
}
