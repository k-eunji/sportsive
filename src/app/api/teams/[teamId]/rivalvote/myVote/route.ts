//src/app/api/teams/[teamId]/rivalvote/myvote/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await context.params; // 🔥 여기 반드시 await 필요!

    const userId = req.headers.get("x-user");
    if (!userId) return NextResponse.json({ myVote: null });

    const today = new Date().toISOString().slice(0, 10);

    const historyRef = db
      .collection("teams")
      .doc(teamId)
      .collection("rivalvote")
      .doc("module")
      .collection("voteHistory")
      .doc(`${userId}_${today}`);

    const snap = await historyRef.get();

    if (!snap.exists) return NextResponse.json({ myVote: null });

    return NextResponse.json({ myVote: snap.data()?.rivalTeamId ?? null });
  } catch (e) {
    console.error("myVote Error:", e);
    return NextResponse.json({ myVote: null });
  }
}
