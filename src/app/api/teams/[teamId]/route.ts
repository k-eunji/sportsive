// src/app/api/teams/[teamId]/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

function cleanTeamName(name: string | null | undefined) {
  return (name ?? "")
    .replace(/\b(FC|AFC|CF)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  // ✅ Next 16: params는 Promise
  const { teamId } = await params;

  // England special case
  if (teamId.toLowerCase() === "england") {
    return NextResponse.json({
      team: {
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
      },
    });
  }

  const id = Number(teamId);
  if (Number.isNaN(id)) {
    return NextResponse.json({ team: null }, { status: 400 });
  }

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

  if (error || !team) {
    console.error(error);
    return NextResponse.json({ team: null }, { status: 404 });
  }

  return NextResponse.json({
    team: {
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
    },
  });
}
