"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Users, MessageCircle, Tv, Trophy } from "lucide-react";

type CommunityItem = {
  id: string;
  type: "post" | "meetup" | "live" | "match" | "team";
  title?: string;
  text?: string;
  team?: { id: string; name: string; logo?: string };
  event?: { id: string; title?: string; date?: string };
  user?: { id: string; name: string; avatar?: string };
  date?: string;
  likes?: number;
  comments?: number;
  region?: string;
  city?: string;
};

export default function CommunityFeedPreview() {
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 커뮤니티 기능 제거 → fetch 없앰 → 더미 데이터 적용
  useEffect(() => {
    setItems([]);      // 비어있는 데이터
    setLoading(false); // 로딩 종료
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500 py-16 animate-pulse">
        Loading community highlights...
      </div>
    );

  if (!items.length)
    return (
      <div className="text-center text-gray-400 py-16">
        No community activity yet. Be the first to post!
      </div>
    );

  return (
    <section className="mt-24">
      <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] bg-clip-text text-transparent">
        🌍 Latest from the Community
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            className="border rounded-2xl bg-white dark:bg-gray-900 shadow-md p-5 hover:-translate-y-1 hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {item.user?.avatar ? (
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300" />
                )}
                <p className="font-semibold text-sm">
                  {item.user?.name ?? "Anonymous"}
                </p>
              </div>
              <span className="text-xs text-gray-500">
                {item.city ?? item.region ?? "Global"}
              </span>
            </div>

            {/* 본문 */}
            <div className="mb-3">
              {item.type === "meetup" && (
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Users className="w-4 h-4" /> Meetup
                </div>
              )}
              {item.type === "live" && (
                <div className="flex items-center gap-2 text-red-500 font-medium">
                  <Tv className="w-4 h-4" /> Live Chat
                </div>
              )}
              {item.type === "match" && (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <Calendar className="w-4 h-4" /> Match
                </div>
              )}
              {item.type === "team" && (
                <div className="flex items-center gap-2 text-yellow-600 font-medium">
                  <Trophy className="w-4 h-4" /> Team Update
                </div>
              )}
              {item.type === "post" && (
                <div className="flex items-center gap-2 text-purple-600 font-medium">
                  <MessageCircle className="w-4 h-4" /> Fan Post
                </div>
              )}

              <p className="mt-2 text-gray-700 dark:text-gray-200 text-sm leading-relaxed line-clamp-3">
                {item.text ??
                  item.title ??
                  `${item.team?.name ?? "Someone"} shared an update!`}
              </p>
            </div>

            {/* 푸터 */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
              <span>
                ❤️ {item.likes ?? 0} · 💬 {item.comments ?? 0}
              </span>
              <Link
                href={`/community?type=${item.type}&id=${item.id}`}
                className="text-blue-600 hover:underline"
              >
                View →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
