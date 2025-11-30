// src/app/community/components/FeedList.tsx

"use client";

import { useMemo, useState, useEffect } from "react";
import { FeedItem } from "@/types/feed";
import FeedItemCard from "./FeedItemCard";

export default function FeedList({
  filter,
  mode = "all",
}: {
  filter?: Record<string, string>;
  mode?: string;
}) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const qs = useMemo(
    () => new URLSearchParams(filter || {}).toString(),
    [filter?.type, filter?.team, filter?.user]
  );

  // 🔥 커뮤니티 기능 제거 → fetch 제거 → 단순히 기본값 설정
  useEffect(() => {
    setFeed([]);      // 빈 피드
    setLoading(false); // 로딩 종료
  }, [qs]);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-20 animate-pulse">
        Loading feed...
      </p>
    );

  if (!feed.length)
    return (
      <div className="text-center text-gray-400 mt-20 space-y-3">
        {mode === "live" && (
          <>
            <p>No live matches right now ⚽️</p>
            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Create a Live Room
            </button>
          </>
        )}
        {mode === "meetup" && (
          <>
            <p>No meetups near you 👥</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Start a Meetup
            </button>
          </>
        )}
        {mode === "relationship" && <p>No new fan connections yet 🤝</p>}
        {mode === "post" && <p>Be the first to post 📝</p>}
        {mode === "all" && <p>Nothing to show yet 💬</p>}
      </div>
    );

  return (
    <div className="space-y-4">
      {feed.map((item) => (
        <FeedItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
