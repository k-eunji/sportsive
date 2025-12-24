// src/app/api/teams/[teamId]/matches/summary/route.ts

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
  competition: string | null;
  status: string | null;
  home_team_id: number;
  away_team_id: number;
  home_team: { name: string } | null;
  away_team: { name: string } | null;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  // ✅ Next 16 규칙: params는 Promise
  const { teamId } = await params;

  const teamIdNum = Number(teamId);
  if (Number.isNaN(teamIdNum)) {
    return NextResponse.json({
      todayMatch: null,
      nextMatch: null,
    });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    // =========================
    // 1️⃣ 오늘 경기
    // =========================
    const { data: todayMatch, error: todayError } = await supabase
      .from("england_pl_football_matches")
      .select(`
        id,
        date,
        competition,
        status,
        home_team_id,
        away_team_id,
        home_team:home_team_id ( name ),
        away_team:away_team_id ( name )
      `)
      .or(
        `home_team_id.eq.${teamIdNum},away_team_id.eq.${teamIdNum}`
      )
      .gte("date", today)
      .lt(
        "date",
        new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
      )
      .maybeSingle<MatchRow>();

    // =========================
    // 2️⃣ 다음 경기
    // =========================
    const { data: nextMatch, error: nextError } = await supabase
      .from("england_pl_football_matches")
      .select(`
        id,
        date,
        competition,
        status,
        home_team_id,
        away_team_id,
        home_team:home_team_id ( name ),
        away_team:away_team_id ( name )
      `)
      .or(
        `home_team_id.eq.${teamIdNum},away_team_id.eq.${teamIdNum}`
      )
      .gt("date", today)
      .order("date", { ascending: true })
      .limit(1)
      .maybeSingle<MatchRow>();

    if (todayError) console.error(todayError);
    if (nextError) console.error(nextError);

    return NextResponse.json({
      todayMatch: todayMatch
        ? {
            ...todayMatch,
            homeTeamName: cleanTeamName(
              todayMatch.home_team?.name
            ),
            awayTeamName: cleanTeamName(
              todayMatch.away_team?.name
            ),
          }
        : null,

      nextMatch: nextMatch
        ? {
            ...nextMatch,
            homeTeamName: cleanTeamName(
              nextMatch.home_team?.name
            ),
            awayTeamName: cleanTeamName(
              nextMatch.away_team?.name
            ),
          }
        : null,
    });
  } catch (err) {
    console.error("❌ Error fetching match summary:", err);
    return NextResponse.json(
      {
        todayMatch: null,
        nextMatch: null,
        error: "Summary failed",
      },
      { status: 500 }
    );
  }
}
