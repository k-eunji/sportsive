// src/app/sports/[sportSlug]/page.tsx

"use client";

import React from "react";
import Link from "next/link";

// 🏈 스포츠 종목 메인 페이지
// 예: /sports/football → 프리미어리그, KBO 등 리그 목록을 표시
export default function SportPage({ params }: { params: { sportSlug: string } }) {
  const { sportSlug } = params;

  return (
    <main className="max-w-5xl mx-auto pt-24 p-4">
      <h1 className="text-3xl font-bold mb-4 capitalize">{sportSlug}</h1>
      <p className="text-gray-600 mb-6">
        Explore leagues and teams in the {sportSlug} world.
      </p>

      {/* 예시 리그 목록 */}
      <ul className="space-y-3">
        <li>
          <Link href={`/sports/${sportSlug}/competitions/premier-league`} className="text-blue-600 hover:underline">
            Premier League →
          </Link>
        </li>
        <li>
          <Link href={`/sports/${sportSlug}/competitions/championship`} className="text-blue-600 hover:underline">
            Championship →
          </Link>
        </li>
      </ul>
    </main>
  );
}
