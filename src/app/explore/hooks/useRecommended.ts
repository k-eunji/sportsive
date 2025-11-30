//src/app/explore/hooks/useRecommended.ts

"use client";

import { useEffect, useState } from "react";

export function useRecommended() {
  const [recommendedMatches, setRecommendedMatches] = useState<any[]>([]);

  useEffect(() => {
    // 최근 본 이벤트 불러오기
    const recentEvents = JSON.parse(localStorage.getItem("recentEvents") || "[]");

    const load = async () => {
      if (recentEvents.length === 0) return;

      const res = await fetch("/api/events");
      const json = await res.json();
      const allEvents = json.events ?? [];

      const matched = allEvents.filter((e: any) =>
        recentEvents.includes(String(e.id))
      );

      setRecommendedMatches(matched.slice(0, 3));
    };

    load();
  }, []);

  return { recommendedMatches };
}
