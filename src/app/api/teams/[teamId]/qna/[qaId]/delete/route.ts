//src/app/api/teams/[teamId]/qna/[qaId]/delete/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: any) {
  const { teamId, qaId } = await params;

  await db
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .delete();

  return NextResponse.json({ success: true });
}
