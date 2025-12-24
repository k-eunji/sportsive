// src/app/api/teams/[teamId]/matches/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

function cleanTeamName(name: string | null | undefined) {
  return (name ?? "")
    .replace(/\b(FC|AFC|CF)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Supabase FK join 결과 타입
 */
type MatchRow = {
  id: number;
  date: string;
  status: string | null;
  competition: string | null;
  home_team_id: number;
  away_team_id: number;
  home_team: {
    name: string;
    logo_url: string | null;
    venue: string | null;
    lat: number | null;
    lng: number | null;
    region: string | null;
    city: string | null;
    homepage_url: string | null;
  } | null;
  away_team: {
    name: string;
    logo_url: string | null;
  } | null;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  // ✅ Next 16 규칙
  const { teamId } = await params;

  const teamIdNum = Number(teamId);
  if (Number.isNaN(teamIdNum)) {
    return NextResponse.json({ matches: [] });
  }

  try {
    const now = new Date().toISOString();

    // -----------------------------------------
    // 🔽 과거 경기 (최근 4개)
    // -----------------------------------------
    const { data: pastMatches, error: pastError } = await supabase
      .from("england_pl_football_matches")
      .select(`
        id,
        date,
        status,
        competition,
        home_team_id,
        away_team_id,
        home_team:home_team_id (
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
          name,
          logo_url
        )
      `)
      .or(
        `home_team_id.eq.${teamIdNum},away_team_id.eq.${teamIdNum}`
      )
      .lt("date", now)
      .order("date", { ascending: false })
      .limit(4)
      .returns<MatchRow[]>();

    // -----------------------------------------
    // 🔼 다가오는 경기 (5개)
    // -----------------------------------------
    const { data: upcomingMatches, error: upcomingError } =
      await supabase
        .from("england_pl_football_matches")
        .select(`
          id,
          date,
          status,
          competition,
          home_team_id,
          away_team_id,
          home_team:home_team_id (
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
            name,
            logo_url
          )
        `)
        .or(
          `home_team_id.eq.${teamIdNum},away_team_id.eq.${teamIdNum}`
        )
        .gte("date", now)
        .order("date", { ascending: true })
        .limit(5)
        .returns<MatchRow[]>();

    if (pastError) console.error(pastError);
    if (upcomingError) console.error(upcomingError);

    const combined = [
      ...(pastMatches ?? []),
      ...(upcomingMatches ?? []),
    ];

    const formatted = combined.map((m) => ({
      id: m.id.toString(),
      date: m.date,
      status: m.status,
      competition: m.competition,
      homeTeam: cleanTeamName(m.home_team?.name),
      awayTeam: cleanTeamName(m.away_team?.name),
      homeTeamLogo: m.home_team?.logo_url,
      awayTeamLogo: m.away_team?.logo_url,
      venue: m.home_team?.venue,
      city: m.home_team?.city,
      region: m.home_team?.region,
      location: {
        lat: m.home_team?.lat,
        lng: m.home_team?.lng,
      },
      homepageUrl: m.home_team?.homepage_url,
      title: `${cleanTeamName(
        m.home_team?.name
      )} vs ${cleanTeamName(m.away_team?.name)}`,
    }));

    return NextResponse.json({ matches: formatted });
  } catch (err) {
    console.error("❌ Error fetching matches:", err);
    return NextResponse.json(
      { matches: [] },
      { status: 500 }
    );
  }
}
