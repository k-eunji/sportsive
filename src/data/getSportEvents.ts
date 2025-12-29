// src/data/getSportEvents.ts

import type { Event } from "@/types";

/**
 * 공용 스포츠 이벤트 fetcher
 * - football / rugby 지원
 * - 런던 기준
 */
export async function getSportEvents(
  sport: "football" | "rugby"
): Promise<Event[]> {
  const res = await fetch(`/api/events/england/london/${sport}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${sport} events`);
  }

  const data = await res.json();

  return (data.matches ?? []).map((m: any) => {
    const homeName = m.homeTeam ?? "";
    const awayName = m.awayTeam ?? "";

    return {
      id: String(m.id),
      date: m.date,
      competition: m.competition ?? "Unknown",
      homeTeam: homeName,
      awayTeam: awayName,
      venue: m.venue ?? "Unknown Stadium",
      status: m.status,
      teams: [homeName, awayName],
      title:
        homeName && awayName ? `${homeName} vs ${awayName}` : "",
      location: m.location,
      sport, // ⭐ 중요: sport 명시
    };
  });
}
