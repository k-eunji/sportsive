// src/hooks/useFootballEvents.ts

import { useEffect, useState } from "react";
import type { Event } from "@/types";

// 반환 타입 정의
interface UseFootballEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
}

export function useFootballEvents(selectedTeamId?: string): UseFootballEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);

        const url = selectedTeamId
          ? `/api/events/england/london/football?teamId=${selectedTeamId}`
          : `/api/events/england/london/football`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch matches");

        const data = await res.json();

        const eventsData: Event[] = data.matches.map((m: any) => ({
          id: m.id.toString(),
          title: `${m.homeTeam} vs ${m.awayTeam}`,
          date: m.date,
          category: "Football",
          description: `${m.competition} at ${m.venue || "Unknown Venue"}`,
          location: m.location, // DB에서 가져온 실제 위치 사용
          free: true,
          organizerId: "",
          attendees: [],
          tags: ["football", "london"],
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          teams: [m.homeTeam, m.awayTeam],
          homepageUrl: m.homepageUrl || undefined,
           // ★ 실제 경기 장소 기준 타임존
          timeZone: m.timeZone || "UTC",
        }));

        setEvents(eventsData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch matches");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [selectedTeamId]); // teamId가 바뀌면 다시 fetch

  return { events, loading, error };
}
