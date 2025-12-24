// src/app/api/teams/[teamId]/matches-all/route.ts

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
    region: string | null;
    city: string | null;
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
    const { data: matches, error } = await supabase
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
          region,
          city
        ),
        away_team:away_team_id (
          name,
          logo_url
        )
      `)
      .or(
        `home_team_id.eq.${teamIdNum},away_team_id.eq.${teamIdNum}`
      )
      .order("date", { ascending: true })
      .returns<MatchRow[]>();

    if (error) {
      console.error(error);
      return NextResponse.json({ matches: [] });
    }

    return NextResponse.json({
      matches: (matches ?? []).map((m) => ({
        id: m.id.toString(),
        date: m.date,
        status: m.status,
        competition: m.competition,
        homeTeam: cleanTeamName(m.home_team?.name),
        awayTeam: cleanTeamName(m.away_team?.name),
        homeTeamLogo: m.home_team?.logo_url,
        awayTeamLogo: m.away_team?.logo_url,
        venue: m.home_team?.venue,
        region: m.home_team?.region,
        city: m.home_team?.city,
      })),
    });
  } catch (err) {
    console.error("❌ Error fetching matches-all:", err);
    return NextResponse.json(
      { matches: [] },
      { status: 500 }
    );
  }
}
