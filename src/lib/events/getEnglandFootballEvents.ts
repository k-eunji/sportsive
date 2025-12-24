// lib/events/getEnglandFootballEvents.ts
import { supabase } from "@/lib/supabaseServer";

const cleanTeamName = (name?: string | null) =>
  (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

export async function getEnglandFootballEvents() {
  const { data: matches, error } = await supabase
    .from("england_pl_football_matches")
    .select(`
      id,
      date,
      status,
      competition,
      sport,
      is_paid,
      home_team_id,
      away_team_id,
      home_team:home_team_id (
        id, name, logo_url, venue, lat, lng, region, city, homepage_url
      ),
      away_team:away_team_id (
        id, name, logo_url
      )
    `)
    .order("date", { ascending: true });

  if (error || !matches) return [];

  return matches.map((m: any) => ({
    id: String(m.id),
    date: m.date,
    status: m.status,
    competition: m.competition,
    sport: (m.sport || "football").toLowerCase(),
    homeTeamId: m.home_team_id,
    awayTeamId: m.away_team_id,
    homeTeam: cleanTeamName(m.home_team?.name),
    awayTeam: cleanTeamName(m.away_team?.name),
    homeTeamLogo: m.home_team?.logo_url,
    awayTeamLogo: m.away_team?.logo_url,
    venue: m.home_team?.venue,
    city: m.home_team?.city,
    region: m.home_team?.region,
    homepageUrl: m.home_team?.homepage_url,
    isPaid: m.is_paid === 1,
  }));
}
