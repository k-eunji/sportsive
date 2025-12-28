// src/lib/teams.ts

import { supabase } from "../lib/supabaseServer";

export async function GetTeamById(teamId: string) {
  const { data, error } = await supabase
    .from("england_pl_football_teams")
    .select(`
      id,
      name,
      logo_url,
      country,
      sport,
      description,
      homepage_url
    `)
    .eq("id", teamId)
    .single();

  if (error) {
    // 존재하지 않는 팀이면 null 반환 (기존 sqlite 동작과 동일)
    if (error.code !== "PGRST116") {
      console.error("❌ GetTeamById error:", error);
    }
    return null;
  }

  if (!data) return null;

  return {
    id: String(data.id),
    name: data.name,
    logo: data.logo_url,
    country: data.country,
    sport: data.sport,
    description: data.description,
    homepageUrl: data.homepage_url,
  };
}
