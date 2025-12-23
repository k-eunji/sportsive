//api/teams/[teamId]/momvote/create/route.ts

export const runtime = "nodejs";

import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: any) {
  const { teamId } = await ctx.params;
  const { matchId, title, userId } = await req.json();

  if (!matchId || !userId) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const exists = await adminDb
    .collection("teams")
    .doc(teamId)
    .collection("momvote")
    .where("data.matchId", "==", matchId)
    .get();

  if (!exists.empty) {
    return NextResponse.json({ error: "already exists" }, { status: 409 });
  }

  const ref = adminDb.collection("teams").doc(teamId).collection("momvote").doc();

  await ref.set({
    id: ref.id,
    createdAt: new Date().toISOString(),
    data: {
      matchId,
      title,
      createdBy: userId,
      expiresAt: new Date().toISOString().slice(0, 10) + "T23:59:59Z",
      locked: false,
      candidates: [],
    },
  });

  return NextResponse.json({ id: ref.id, success: true });
}
