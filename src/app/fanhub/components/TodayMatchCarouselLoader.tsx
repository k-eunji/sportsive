///src/app/fanhub/components/TodayMatchCarouselLoader.tsx

"use client";

import { useEffect, useState } from "react";
import TodayMatchCarousel, { CarouselMatch } from "./TodayMatchCarousel";

export default function TodayMatchCarouselLoader({ sport = "all" }: { sport?: string }) {
  const [matches, setMatches] = useState<CarouselMatch[] | null>(null);
  const [label, setLabel] = useState("Today’s Predictions");

  useEffect(() => {
    // ⭐ sport가 바뀌면 즉시 초기화 (이게 있어야 잔상/멈춤 현상 없어짐)
    setMatches(null);

    async function load() {
      try {
        const endpoint =
          sport === "all"
            ? "/api/events/england/all"
            : `/api/events/england/${sport}`;

        const res = await fetch(endpoint);
        const json = await res.json();

        const matchList: any[] = json?.matches ?? [];

        if (!Array.isArray(matchList) || matchList.length === 0) {
          setLabel("No matches available");
          setMatches([]);
          return;
        }

        const todayStr = new Date().toISOString().slice(0, 10);

        const todayMatches = matchList.filter((m) => {
          const matchStr = new Date(m.date).toISOString().slice(0, 10);
          return matchStr === todayStr;
        });

        if (todayMatches.length > 0) {
          setLabel("Today’s Match");
          setMatches(todayMatches);
          return;
        }

        const now = new Date();

        const upcoming = matchList
          .filter((m) => new Date(m.date) > now)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        if (upcoming.length > 0) {
          setLabel("Next Match");
          setMatches(upcoming.slice(0, 5));
          return;
        }

        // ⭐ 오늘도 없고, 다음 경기 없을 때
        setLabel("No upcoming matches");
        setMatches([]);
      } catch (e) {
        console.error("Failed to load matches:", e);
        setLabel("No matches available");
        setMatches([]);
      }
    }

    load();
  }, [sport]);

  // ⭐ 아직 로딩 중일 때
  if (matches === null) {
    return (
      <div className="w-full h-[50px] flex items-center px-3 mb-1 text-xs opacity-50">
        Loading...
      </div>
    );
  }

  // ⭐ 로딩 끝났지만 경기 없음
  if (matches.length === 0) {
    return (
      <div className="w-full h-[50px] flex items-center px-3 mb-1 text-xs opacity-60">
        {label}
      </div>
    );
  }

  return <TodayMatchCarousel matches={matches} label={label} />;
}
