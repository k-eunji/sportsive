// src/hooks/useSportEvents.ts
import { useEffect, useState } from "react";
import type { Event } from "@/types";

interface UseSportEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
}

export function useSportEvents(
  sport: "football" | "rugby",
  selectedTeamId?: string
): UseSportEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);

        const url = selectedTeamId
          ? `/api/events/england/london/${sport}?teamId=${selectedTeamId}`
          : `/api/events/england/london/${sport}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch matches");

        const data = await res.json();

        const eventsData: Event[] = data.matches.map((m: any) => ({
          id: m.id.toString(),
          title: `${m.homeTeam} vs ${m.awayTeam}`,
          date: m.date,
          category: sport === "rugby" ? "Rugby" : "Football",
          description: `${m.competition} at ${m.venue || "Unknown Venue"}`,
          location: m.location,
          free: true,
          organizerId: "",
          attendees: [],
          tags: [sport, "london"],
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          teams: [m.homeTeam, m.awayTeam],
          homepageUrl: m.homepageUrl || undefined,
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
  }, [sport, selectedTeamId]); // ✅ sport도 의존성

  return { events, loading, error };
}
