//src/app/api/teams/[teamId]/momvote/[moduleId]/lock/route.ts

export const runtime = "nodejs";

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: any) {
  const { teamId, moduleId } = await ctx.params;

  await db
    .collection("teams")
    .doc(teamId)
    .collection("momvote")
    .doc(moduleId)
    .update({
      "data.locked": true,
      "data.lockedAt": new Date().toISOString(),
    });

  return NextResponse.json({ success: true });
}
