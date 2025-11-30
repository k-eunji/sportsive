///src/app/components/CommunityHighlights.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Event } from "@/types/event";
import type { MeetupWithEvent } from "@/types/event";

/**
 * 💬 Community 활동 하이라이트
 * - 실제 API 데이터 기반 통계
 * - `/api/events`, `/api/meetups`에서 데이터 수집
 */
export default function CommunityHighlights() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalMeetups: 0,
    activeCities: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        // ✅ 이벤트 데이터
        const eventsRes = await fetch("/api/events");
        const eventsData = await eventsRes.json();
        const events: Event[] = eventsData.events ?? [];

        // ✅ 밋업 데이터
        const meetupsRes = await fetch("/api/meetups");
        const meetupsData = await meetupsRes.json();
        const meetups: MeetupWithEvent[] = meetupsData.meetups ?? [];

        // ✅ 통계 계산
        const uniqueCities = new Set([
          ...events.map((e) => e.city),
          ...meetups.map((m) => m.location?.city),
        ].filter(Boolean));

        setStats({
          totalEvents: events.length,
          totalMeetups: meetups.length,
          activeCities: uniqueCities.size,
        });
      } catch (err) {
        console.error("Failed to load community stats:", err);
      }
    }

    loadStats();
  }, []);

  const highlights = [
    { icon: "🏟️", text: `${stats.totalEvents} total matches` },
    { icon: "🧑‍🤝‍🧑", text: `${stats.totalMeetups} active meetups` },
    { icon: "🎉", text: `Fans in ${stats.activeCities} cities` },
  ];

  return (
    <section className="mt-10 flex justify-center gap-6 flex-wrap text-sm text-muted-foreground">
      {highlights.map((h, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2 bg-card/70 px-4 py-2 rounded-full shadow-sm 
                     hover:scale-105 transition-all"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <span>{h.icon}</span>
          <span>{h.text}</span>
        </motion.div>
      ))}
    </section>
  );
}
