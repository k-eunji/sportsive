// src/app/region/[regionSlug]/cities/[citySlug]/events/page.tsx
"use client";

// 📅 도시 내 경기 리스트
export default function CityEventsPage({
  params,
}: {
  params: { regionSlug: string; citySlug: string };
}) {
  const { regionSlug, citySlug } = params;

  return (
    <main className="max-w-5xl mx-auto pt-24 p-4">
      <h1 className="text-3xl font-bold mb-4 capitalize">
        {citySlug} Events
      </h1>
      <p className="text-gray-600 mb-6">
        Browse matches and local sports events in {citySlug}, {regionSlug}.
      </p>

      <div className="p-6 border rounded-xl bg-gray-50 dark:bg-gray-900">
        <p>📍 Event list placeholder (map view or schedule list)</p>
      </div>
    </main>
  );
}
