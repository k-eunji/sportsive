//api/teams/[teamId]/momvote/[moduleId]/addCandidate/route.ts

export const runtime = "nodejs";

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

export async function POST(req: Request, ctx: any) {
  const { teamId, moduleId } = await ctx.params;
  const { name, position, photoUrl } = await req.json();

  if (!name)
    return NextResponse.json({ error: "name required" }, { status: 400 });

  const ref = db
    .collection("teams")
    .doc(teamId)
    .collection("momvote")
    .doc(moduleId);

  const snap = await ref.get();
  if (!snap.exists)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  // ⭐ 여기 단 1번 선언
  const d = snap.data() as any;

  const newC = {
    id: uuid(),
    name: name,    // 🔥 변경!
    position: position ?? null,
    photoUrl: photoUrl ?? null,
    votes: 0,
  };

  await ref.update({
    "data.candidates": [...d.data.candidates, newC],
  });

  return NextResponse.json({ success: true, candidate: newC });
}
