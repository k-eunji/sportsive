//src/app/api/teams/[teamId]/momvote/auto-lock/route.ts

export const runtime = "nodejs";

import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: any) {
  const { teamId } = await ctx.params;

  const col = adminDb
    .collection("teams")
    .doc(teamId)
    .collection("momvote");

  const now = Date.now();

  const snap = await col.get();

  const toLock: any[] = [];

  snap.forEach((doc) => {
    const d = doc.data() as any;
    const expiresAt = new Date(d.data.expiresAt).getTime();

    if (!d.data.locked && now > expiresAt) {
      toLock.push(doc.ref);
    }
  });

  for (const ref of toLock) {
    await ref.update({
      "data.locked": true,
      "data.lockedAt": new Date().toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    lockedCount: toLock.length,
  });
}
