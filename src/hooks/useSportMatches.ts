// src/hooks/useSportMatches.ts

import { useEffect, useState } from "react";
import type { Event } from "@/types";

interface UseSportMatchesReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
}

/**
 * 공용 스포츠 경기 훅
 * - football / rugby 지원
 * - teamId 선택 필터 지원
 */
export function useSportMatches(
  sport: "football" | "rugby",
  selectedTeamId?: string
): UseSportMatchesReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);

        const url = selectedTeamId
          ? `/api/events/england/london/${sport}?teamId=${selectedTeamId}`
          : `/api/events/england/london/${sport}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch matches");

        const data = await res.json();

        const mapped: Event[] = (data.matches ?? []).map((m: any) => ({
          id: String(m.id),
          title: `${m.homeTeam} vs ${m.awayTeam}`,
          date: m.date,

          // 🏷️ sport 기반 분기
          category: sport === "rugby" ? "Rugby" : "Football",
          tags: [sport, "london"],

          description: `${m.competition} at ${m.venue || "Unknown Venue"}`,
          location:
            m.location ?? {
              lat: 51.5074,
              lng: -0.1278,
              address: m.venue || "",
            },

          venue: m.venue || "",
          status: m.status,

          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          teams: [m.homeTeam, m.awayTeam],

          free: true,
          organizerId: "",
          attendees: [],
        }));

        setEvents(mapped);
      } catch (err: any) {
        console.error("❌ useSportMatches error:", err);
        setError(err.message ?? "Failed to fetch matches");
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [sport, selectedTeamId]); // ⭐ 핵심: sport 의존성 포함

  return { events, loading, error };
}
