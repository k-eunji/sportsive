//src/app/api/teams/[teamId]/momvote/auto-create/route.ts

export const runtime = "nodejs";

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: any) {
  const { teamId } = await ctx.params;

  // 오늘 경기 정보 가져오기
  const matchRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/${teamId}/matches/summary`,
    { cache: "no-store" }
  );
  const match = await matchRes.json();
  const todayMatch = match.todayMatch;

  if (!todayMatch) {
    return NextResponse.json({ created: false, reason: "no match today" });
  }

  const matchId = todayMatch.id;

  const col = db
    .collection("teams")
    .doc(teamId)
    .collection("momvote");

  const snap = await col.where("data.matchId", "==", matchId).get();

  // 이미 존재
  if (!snap.empty) {
    return NextResponse.json({ created: false, reason: "already exists" });
  }

  const ref = col.doc();

  const kickoff = new Date(todayMatch.kickoff);

  const newModule = {
    id: ref.id,
    type: "momvote",
    createdAt: new Date().toISOString(),
    createdBy: "system",
    reactions: { likes: 0, participants: 0 },
    data: {
      matchId,
      title: `Man of the Match`,
      kickoff: todayMatch.kickoff,
      opponent: todayMatch.opponent,
      expiresAt: new Date(kickoff.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      locked: false,
      candidates: [],
    },
  };

  await ref.set(newModule);

  return NextResponse.json({
    created: true,
    module: newModule,
  });
}
