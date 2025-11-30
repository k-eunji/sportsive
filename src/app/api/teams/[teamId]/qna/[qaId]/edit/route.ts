// src/app/api/teams/[teamId]/qna/[qaId]/edit/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: any) {
  const { teamId, qaId } = params;
  const { text } = await req.json();

  await db
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .update({
      "data.question": text,
      editedAt: new Date().toISOString(),
    });

  return NextResponse.json({ success: true });
}
