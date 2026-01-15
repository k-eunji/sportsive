// src/app/fanhub/components/TodayMatchCarouselLoader.tsx

"use client";

import { useEffect, useState } from "react";
import TodayMatchCarousel, { CarouselItem } from "./TodayMatchCarousel";

export default function TodayMatchCarouselLoader({
  sport = "all",
}: {
  sport?: string;
}) {
  const [items, setItems] = useState<CarouselItem[] | null>(null);
  const [label, setLabel] = useState("Loading…");

  useEffect(() => {
    setItems(null);

    async function load() {
      try {
        const endpoint =
          sport === "all"
            ? "/api/events/england/all"
            : `/api/events/england/${sport}`;

        const res = await fetch(endpoint);
        const json = await res.json();
        const list: any[] = json?.matches ?? [];

        if (list.length === 0) {
          setLabel("No events today");
          setItems([]);
          return;
        }

        const today = new Date().toISOString().slice(0, 10);

        /** 🔥 오늘 열리는 이벤트 */
        const todayItems: CarouselItem[] = list
          .filter((e) => {
            const d = new Date(e.date).toISOString().slice(0, 10);
            return d === today;
          })
          .map((e) => {
            if (e.kind === "session") {
              return {
                id: e.id,
                type: "session",
                title: e.title,
                startDate: e.startDate,
                endDate: e.endDate,
                venue: e.venue,
              };
            }

            return {
              id: e.id,
              type: "match",
              homeTeam: e.homeTeam,
              awayTeam: e.awayTeam,
              homeTeamLogo: e.homeTeamLogo ?? null,
              awayTeamLogo: e.awayTeamLogo ?? null,
              date: e.date,
            };
          });

        if (todayItems.length > 0) {
          setLabel(
            todayItems.some((i) => i.type === "session")
              ? "Tennis Today"
              : "Today’s Match"
          );
          setItems(todayItems);
          return;
        }

        /** 🔥 다음 이벤트 */
        const upcoming: CarouselItem[] = list
          .filter((e) => new Date(e.date) > new Date())
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 5)
          .map((e) => {
            if (e.kind === "session") {
              return {
                id: e.id,
                type: "session",
                title: e.title,
                startDate: e.startDate,
                endDate: e.endDate,
                venue: e.venue,
              };
            }

            return {
              id: e.id,
              type: "match",
              homeTeam: e.homeTeam,
              awayTeam: e.awayTeam,
              homeTeamLogo: e.homeTeamLogo ?? null,
              awayTeamLogo: e.awayTeamLogo ?? null,
              date: e.date,
            };
          });

        if (upcoming.length > 0) {
          setLabel("Next Event");
          setItems(upcoming);
          return;
        }

        setLabel("No upcoming events");
        setItems([]);
      } catch (e) {
        console.error(e);
        setLabel("No events available");
        setItems([]);
      }
    }

    load();
  }, [sport]);

  if (items === null) {
    return (
      <div className="w-full h-[50px] flex items-center px-3 mb-1 text-xs opacity-50">
        Loading…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full h-[50px] flex items-center px-3 mb-1 text-xs opacity-60">
        {label}
      </div>
    );
  }

  return <TodayMatchCarousel items={items} label={label} />;
}
