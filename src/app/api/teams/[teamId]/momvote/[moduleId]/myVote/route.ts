//src/app/api/teams/[teamId]/momvote/[moduleId]/myVote/route.ts

export const runtime = "nodejs";

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request, ctx: any) {
  const { teamId, moduleId } = await ctx.params;

  const userId = req.headers.get("x-user");
  if (!userId) return NextResponse.json({ myVote: null });

  const ref = db
    .collection("teams")
    .doc(teamId)
    .collection("momvote")
    .doc(moduleId)
    .collection("voteHistory")
    .doc(userId);

  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ myVote: null });

  return NextResponse.json({ myVote: (snap.data() as any).candidateId });

}
