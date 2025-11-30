// src/lib/api/football.ts

import { Match } from "@/types/match";

export async function fetchTeamMatches(teamId: number, fromDate?: string): Promise<Match[]> {
  const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
  const today = fromDate ?? new Date().toISOString().split("T")[0];

  const res = await fetch(`https://api.football-data.org/v4/teams/${teamId}/matches?status=SCHEDULED&dateFrom=${today}`, {
    headers: { "X-Auth-Token": API_KEY as string },
  });

  if (!res.ok) throw new Error(`Failed to fetch matches for team ${teamId}`);

  const data = await res.json();

  return data.matches.map((m: any) => ({
    id: m.id,
    competition: m.competition.name,
    date: m.utcDate,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    venue: m.venue,
    status: m.status,
  }));
}
