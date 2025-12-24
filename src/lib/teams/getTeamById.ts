// lib/teams/getTeamById.ts
import { supabase } from "@/lib/supabaseServer";

function cleanTeamName(name: string | null | undefined) {
  return (name ?? "")
    .replace(/\b(FC|AFC|CF)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function getTeamById(teamId: string) {
  // England special case (기존 route.ts 로직 그대로)
  if (teamId.toLowerCase() === "england") {
    return {
      id: "england",
      name: "England National Football Team",
      logo: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
      region: "United Kingdom",
      city: "London",
      homepageUrl: "https://www.englandfootball.com/",
      venue: "Wembley Stadium",
      transportInfo: "Wembley Park Station",
      foundedYear: 1863,
      instagram: "https://www.instagram.com/england",
      x: "https://x.com/England",
      youtube: "https://www.youtube.com/@EnglandFootball",
      nearbyFans: [], // 필요하면 유지(없으면 TeamHeader에서 optional 처리)
    };
  }

  const id = Number(teamId);
  if (Number.isNaN(id)) return null;

  const { data: team, error } = await supabase
    .from("england_pl_football_teams")
    .select(`
      id,
      name,
      logo_url,
      region,
      city,
      homepage_url,
      venue,
      transport_info,
      founded_year,
      instagram,
      x,
      youtube
    `)
    .eq("id", id)
    .single();

  if (error || !team) return null;

  return {
    id: String(team.id),
    name: cleanTeamName(team.name),
    logo: team.logo_url,
    region: team.region,
    city: team.city,
    homepageUrl: team.homepage_url,
    venue: team.venue,
    transportInfo: team.transport_info,
    foundedYear: team.founded_year,
    instagram: team.instagram,
    x: team.x,
    youtube: team.youtube,
    nearbyFans: [], // 기존 UI가 요구하면 임시로라도 넣어두기
  };
}
