// src/app/api/teams/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseServer";

function cleanTeamName(name: string | null | undefined) {
  return (name ?? "")
    .replace(/\b(FC|AFC|CF)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function GET() {
  const { data: teams, error } = await supabase
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
      sport
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ teams: [] }, { status: 500 });
  }

  const formattedTeams = teams.map((t) => ({
    id: String(t.id),
    name: cleanTeamName(t.name),
    logo: t.logo_url,
    region: t.region,
    city: t.city,
    homepageUrl: t.homepage_url,
    venue: t.venue,
    transportInfo: t.transport_info,
    competition: "Premier League",
    sport: t.sport || "Football",
  }));

  const englandTeam = {
    id: "england",
    name: "England National Football Team",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
    region: "United Kingdom",
    city: "London",
    homepageUrl: "https://www.englandfootball.com/",
    venue: "Wembley Stadium",
    transportInfo: "Wembley Park Station",
    competition: "International Matches",
    sport: "Football",
  };

  return NextResponse.json({
    teams: [englandTeam, ...formattedTeams],
  });
}
