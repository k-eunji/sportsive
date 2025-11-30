// src/app/meetups/components/MeetupHostMiniCard.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";

interface HostUser {
  id: string;
  displayName: string;
  photoURL?: string | null;
  region?: string;
}

/**
 * ✅ MeetupHostMiniCard
 * - 밋업 주최자(Host) 정보를 표시하는 미니 카드
 * - Tailwind 4 + Next.js 15 대응
 */
export default function MeetupHostMiniCard({ hostId }: { hostId: string }) {
  const [host, setHost] = useState<HostUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hostId) return;

    (async () => {
      try {
        const res = await fetch(`/api/users/${hostId}`);
        if (!res.ok) throw new Error("Failed to fetch host data");

        const data = await res.json();
        setHost({
          id: data.id,
          displayName: data.displayName || "Unknown Host",
          photoURL: data.photoURL,
          region: data.region,
        });
      } catch (err) {
        console.error("❌ Failed to load host profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [hostId]);

  // 🌀 로딩 상태 표시
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 flex items-center gap-4 animate-pulse">
        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  // ❌ API 실패 시
  if (!host) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 text-center text-sm text-gray-400">
        Failed to load host info
      </div>
    );
  }

  // ✅ 정상 렌더링
  return (
    <section
      aria-label="Meetup host info"
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 transition-all hover:shadow-md"
    >
      <Link
        href={`/profile/${host.id}`}
        className="flex items-center gap-3 w-full hover:opacity-95 transition"
      >
        {/* 아바타 */}
        <UserAvatar
          userId={host.id}
          avatarUrl={host.photoURL || undefined}
          size={56}
        />

        {/* 정보 */}
        <div className="flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            {host.displayName}
          </h3>

          {host.region && (
            <p className="text-xs text-gray-500 mt-0.5">{host.region}</p>
          )}

          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
            View Profile →
          </p>
        </div>
      </Link>
    </section>
  );
}
