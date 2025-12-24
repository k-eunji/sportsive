// src/app/api/teams/[teamId]/momvote/module/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

type MatchWithTeams = {
  id: number;
  date: string;
  home_team_id: number;
  away_team_id: number;
  home_team: { name: string } | null;
  away_team: { name: string } | null;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  // ✅ Next 16 규칙
  const { teamId } = await params;
  const teamIdNum = Number(teamId);

  if (Number.isNaN(teamIdNum)) {
    return NextResponse.json({ module: null }, { status: 400 });
  }

  // =========================
  // 1️⃣ 오늘 경기 조회
  // =========================
  const matchResult = await supabase
    .from("england_pl_football_matches")
    .select(`
      id,
      date,
      home_team_id,
      away_team_id,
      home_team:home_team_id ( name ),
      away_team:away_team_id ( name )
    `)
    .gte("date", new Date().toISOString().slice(0, 10))
    .lt(
      "date",
      new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    )
    .or(`home_team_id.eq.${teamIdNum},away_team_id.eq.${teamIdNum}`)
    .maybeSingle();

  const match = matchResult.data as MatchWithTeams | null;

  if (matchResult.error || !match) {
    return NextResponse.json({ module: null });
  }

  // =========================
  // 2️⃣ 상대팀 계산
  // =========================
  const opponent =
    match.home_team_id === teamIdNum
      ? match.away_team?.name ?? null
      : match.home_team?.name ?? null;

  const kickoff = match.date;

  // =========================
  // 3️⃣ 기존 MOM 모듈 확인
  // =========================
  const existingResult = await supabase
    .from("momvote_modules")
    .select("*")
    .eq("team_id", teamIdNum)
    .eq("match_id", match.id)
    .maybeSingle();

  if (existingResult.data) {
    return NextResponse.json({ module: existingResult.data });
  }

  // =========================
  // 4️⃣ 새 MOM 모듈 생성
  // =========================
  const newModule = {
    team_id: teamIdNum,
    match_id: match.id,
    created_at: new Date().toISOString(),
    reactions: {
      likes: 0,
      participants: 0,
    },
    data: {
      title: "Man of the Match",
      kickoff,
      opponent,
      locked: false,
      expiresAt: new Date(
        new Date(kickoff).getTime() + 24 * 60 * 60 * 1000
      ).toISOString(),
      candidates: [],
    },
  };

  const insertResult = await supabase
    .from("momvote_modules")
    .insert(newModule)
    .select()
    .single();

  if (insertResult.error) {
    console.error("momvote insert error:", insertResult.error);
    return NextResponse.json({ module: null }, { status: 500 });
  }

  return NextResponse.json({ module: insertResult.data });
}
