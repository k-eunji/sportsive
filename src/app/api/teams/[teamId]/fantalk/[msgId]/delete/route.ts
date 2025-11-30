//api/teams/[teamId]/fantalk/[msgId]/delete/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: any) {
  const { teamId, msgId } = params;

  await db
    .collection("teams")
    .doc(teamId)
    .collection("fantalk")
    .doc(msgId)
    .delete();

  return NextResponse.json({ success: true });
}
