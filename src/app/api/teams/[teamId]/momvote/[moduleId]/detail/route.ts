//src/app/api/teams/[teamId]/momvote/[moduleId]/detail/route.ts

export const runtime = "nodejs";

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request, ctx: any) {
  const { teamId, moduleId } = await ctx.params;

  const ref = db
    .collection("teams")
    .doc(teamId)
    .collection("momvote")
    .doc(moduleId);

  const snap = await ref.get();

  if (!snap.exists)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    module: snap.data(),
  });
}
