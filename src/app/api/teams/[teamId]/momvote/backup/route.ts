//src/app/api/teams/[teamId]/momvote/backup/route.ts

export const runtime = "nodejs";

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: any) {
  const { teamId } = await ctx.params;

  const col = db
    .collection("teams")
    .doc(teamId)
    .collection("momvote");

  const snap = await col.get();

  let savedCount = 0;

  for (const doc of snap.docs) {
    const d = doc.data() as any;

    if (!d.data.locked) continue; // 아직 안끝난 경기 스킵

    const matchId = d.data.matchId;
    if (!matchId) continue;

    const sorted = [...d.data.candidates].sort((a, b) => b.votes - a.votes);
    const totalVotes = sorted.reduce((s, c) => s + c.votes, 0);

    const resultRef = db
      .collection("teams")
      .doc(teamId)
      .collection("momvoteResults")
      .doc(matchId);

    await resultRef.set({
      matchId,
      title: d.data.title,
      opponent: d.data.opponent,
      kickoff: d.data.kickoff,
      totalVotes,
      winner: sorted[0] ?? null,
      candidates: sorted,
      savedAt: new Date().toISOString(),
    });

    savedCount++;
  }

  return NextResponse.json({
    success: true,
    savedCount,
  });
}
