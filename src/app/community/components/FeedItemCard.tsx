// src/app/community/components/FeedItemCard.tsx
"use client";

import { FeedItem } from "@/types/feed";
import UserBadge from "./UserBadge";

/**
 * ✅ 피드 카드
 * - type에 따라 다른 UI (post / meetup / live / relationship)
 */
export default function FeedItemCard({ item }: { item: FeedItem }) {
  const base =
    "border p-4 rounded-xl bg-white dark:bg-gray-900 shadow-sm transition";

  switch (item.type) {
    case "post":
      return (
        <div className={base}>
          <UserBadge userName={item.userName} userId={item.userId} />
          <p className="text-gray-800 dark:text-gray-100 mb-2">{item.content}</p>
          <div className="text-xs text-gray-500 flex gap-3">
            <span>❤️ {item.meta?.likes ?? 0}</span>
            <span>💬 {item.meta?.comments ?? 0}</span>
          </div>
        </div>
      );

    case "meetup":
      return (
        <div className={base}>
          <UserBadge userName={item.userName} userId={item.userId} />
            <p className="text-gray-800">
              <b>{item.userName}</b> is hosting a meetup at{" "}
              <b>{item.location?.name}</b> 🏟️
            </p>
          <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded mt-2 hover:bg-blue-200">
            Join Meetup
          </button>
        </div>
      );

    case "live":
      return (
        <div className={`${base} border-red-400`}>
          <UserBadge userName={item.userName} userId={item.userId} />
          <p>{item.content}</p>
          <p className="text-xs text-red-500 mt-1">
            🔴 {item.meta?.status?.toUpperCase()}
          </p>
          <button className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded mt-2 hover:bg-red-200">
            Join Live Chat
          </button>
        </div>
      );

    case "relationship":
      return (
        <div className={base}>
          <p className="text-sm text-blue-500 font-medium">
            🤝 {item.content}
          </p>
        </div>
      );

    default:
      return null;
  }
}
