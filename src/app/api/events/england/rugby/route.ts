// src/app/api/events/england/rugby/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseServer";

const cleanTeamName = (name?: string | null) =>
  (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

export async function GET() {
  try {
    const { data: matches, error } = await supabase
      .from("england_rugby_matches")
      .select(`
        id,
        date,
        status,
        competition,
        sport,
        kind, 
        is_paid,
        home_team_id,
        away_team_id,
        home_team:home_team_id (
          id,
          name,
          logo_url,
          venue,
          lat,
          lng,
          region,
          city,
          homepage_url
        ),
        away_team:away_team_id (
          id,
          name,
          logo_url
        )
      `)
      .order("date", { ascending: true });

    if (error || !matches) {
      console.error(error);
      return NextResponse.json({ matches: [] });
    }

    const formattedMatches = matches.map((m: any) => ({
      id: String(m.id),
      kind: m.kind, 
      date: m.date,
      status: m.status,
      competition: m.competition,
      sport: "rugby",

      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,

      homeTeam: cleanTeamName(m.home_team?.name),
      awayTeam: cleanTeamName(m.away_team?.name),
      homeTeamLogo: m.home_team?.logo_url,
      awayTeamLogo: m.away_team?.logo_url,

      venue: m.home_team?.venue,
      location: {
        lat: m.home_team?.lat,
        lng: m.home_team?.lng,
      },
      city: m.home_team?.city,
      region: m.home_team?.region,
      homepageUrl: m.home_team?.homepage_url,

      isPaid: m.is_paid === 1,
      teams: [
        cleanTeamName(m.home_team?.name),
        cleanTeamName(m.away_team?.name),
      ],
      title: `${cleanTeamName(m.home_team?.name)} vs ${cleanTeamName(
        m.away_team?.name
      )}`,
    }));

    return NextResponse.json({ matches: formattedMatches });
  } catch (err) {
    console.error("❌ events error:", err);
    return NextResponse.json({ matches: [] });
  }
}
