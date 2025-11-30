// src/hooks/useFootballEvents.ts
import { useEffect, useState } from "react";
import type { Event } from "@/types";

interface UseFootballEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
}

// selectedTeamId: string | undefined 로 명확히 지정
export function useFootballEvents(selectedTeamId: string | undefined): UseFootballEventsReturn {
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
          location: m.location || { lat: 51.5074, lng: -0.1278, address: m.venue || "" },
          free: true,
          organizerId: "",
          attendees: [],
          tags: ["football", "london"],
          venue: m.venue || "",
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          status: m.status,
          teams: [m.homeTeam, m.awayTeam],
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
  }, [selectedTeamId]);

  return { events, loading, error };
}
