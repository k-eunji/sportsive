// src/app/community/components/UserBadge.tsx
"use client";

import Link from "next/link";

/**
 * ✅ 유저 이름 + 아바타 미니 배지
 * - 추후 관계 상태 표시도 가능
 */
export default function UserBadge({
  userName,
  userId,
}: {
  userName: string;
  userId: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <img
        src={`/avatars/${userId}.png`}
        alt={userName}
        className="w-8 h-8 rounded-full border object-cover"
        onError={(e) => ((e.currentTarget.src = "/default-avatar.png"))}
      />
      <Link
        href={`/profile/${userId}`}
        className="font-semibold hover:underline text-gray-900 dark:text-gray-100"
      >
        {userName}
      </Link>
    </div>
  );
}
