// src/app/community/components/FeedFilterBar.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";

const filters = [
  { key: "all", label: "All" },
  { key: "post", label: "Posts" },
  { key: "meetup", label: "Meetups" },
  { key: "live", label: "Live" },
  { key: "relationship", label: "Connections" },
];

/**
 * ✅ 상단 필터 바
 * - 피드 타입 필터링 (URL 쿼리 기반)
 */
export default function FeedFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams((searchParams as any).toString()); // 👈 타입 안전 복제
  const current = params.get("type") ?? "all";

  const setFilter = (type: string) => {
    if (type === "all") params.delete("type");
    else params.set("type", type);

    router.push(`/community?${params.toString()}`);
  };

  return (
    <div className="flex gap-3 mb-4 border-b pb-2 overflow-x-auto no-scrollbar">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
            current === f.key
              ? "bg-blue-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
