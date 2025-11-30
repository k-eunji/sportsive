// src/app/region/[regionSlug]/cities/[citySlug]/community/page.tsx
"use client";

// 💬 도시 단위 커뮤니티 피드
export default function CityCommunityPage({
  params,
}: {
  params: { regionSlug: string; citySlug: string };
}) {
  const { regionSlug, citySlug } = params;

  return (
    <main className="max-w-5xl mx-auto pt-24 p-4">
      <h1 className="text-3xl font-bold capitalize">
        {citySlug} Community
      </h1>
      <p className="text-gray-600 mb-6">
        Chat, share meetups, and post reactions from all local fans in {citySlug}, {regionSlug}.
      </p>

      <div className="p-6 border rounded-xl bg-gray-50 dark:bg-gray-900">
        <p>🗨️ Local feed placeholder (posts, meetups, live highlights)</p>
      </div>
    </main>
  );
}
