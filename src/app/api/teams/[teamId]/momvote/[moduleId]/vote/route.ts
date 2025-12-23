//src/app/api/teams/[teamId]/momvote/[moduleId]/vote/route.ts

export const runtime = "nodejs";

import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: any) {
  const { teamId, moduleId } = await ctx.params;
  const { candidateId, userId } = await req.json();

  if (!candidateId || !userId)
    return NextResponse.json({ error: "bad request" }, { status: 400 });

  const ref = adminDb
    .collection("teams")
    .doc(teamId)
    .collection("momvote")
    .doc(moduleId);

  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

  const d: any = snap.data();

  if (d.data.locked) return NextResponse.json({ error: "locked" }, { status: 403 });

  const hist = ref.collection("voteHistory").doc(userId);

  if ((await hist.get()).exists)
    return NextResponse.json({ error: "already voted" }, { status: 409 });

  await adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.data() as any;
    const candidates = data.data.candidates;

    const idx = candidates.findIndex((c: any) => c.id === candidateId);
    if (idx === -1) throw new Error("bad candidate");

    candidates[idx].votes += 1;

    tx.update(ref, { "data.candidates": candidates });
    tx.set(hist, { userId, candidateId, votedAt: new Date().toISOString() });
  });

  return NextResponse.json({ success: true });
}
