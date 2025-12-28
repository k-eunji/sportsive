// src/app/api/teams/[teamId]/momvote/list/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { supabase } from "../../../../../../lib/supabaseServer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  // ──────────────────────────
  // 1) Firestore: momvote 목록
  // ──────────────────────────
  const colRef = adminDb
    .collection("teams")
    .doc(teamId)
    .collection("momvote");

  const snap = await colRef.orderBy("createdAt", "desc").get();

  if (snap.empty) {
    return NextResponse.json({ list: [] });
  }

  const votes = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // ──────────────────────────
  // 2) matchId 모아서 Supabase 조회 (N+1 방지)
  // ──────────────────────────
  const matchIds = Array.from(
    new Set(
      votes
        .map((v: any) => v.data?.matchId)
        .filter(Boolean)
    )
  );

  let matchesMap = new Map<number, any>();

  if (matchIds.length > 0) {
    const { data: matches, error } = await supabase
      .from("england_pl_football_matches")
      .select(`
        id,
        date,
        home_team_id,
        away_team_id,
        home_team:home_team_id (
          id,
          name
        ),
        away_team:away_team_id (
          id,
          name
        )
      `)
      .in("id", matchIds);

    if (error) {
      console.error("❌ supabase matches error:", error);
    } else {
      for (const m of matches ?? []) {
        matchesMap.set(m.id, m);
      }
    }
  }

  // ──────────────────────────
  // 3) Firestore + Supabase 데이터 합치기
  // ──────────────────────────
  const list = votes.map((v: any) => {
    const matchId = v.data.matchId;
    const match = matchesMap.get(matchId);

    let opponent = "Unknown";

    if (match) {
      opponent =
        Number(teamId) === match.home_team_id
          ? match.away_team?.name
          : match.home_team?.name;
    }

    const candidates = Array.isArray(v.data.candidates)
      ? [...v.data.candidates].sort((a, b) => b.votes - a.votes)
      : [];

    return {
      id: v.id,
      data: {
        matchId,
        kickoff: match?.date ?? null,
        opponent,
        locked: v.data.locked ?? false,
        candidates,
        winner: candidates[0] ?? null,
      },
    };
  });

  return NextResponse.json({ list });
}
