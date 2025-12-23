//src/app/api/comments/teams/[teamId]/qna/[qaId]/[commentId]/delete/route.ts

export const runtime = "nodejs";

import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  _req: Request,
  context: {
    params: Promise<{ teamId: string; qaId: string; commentId: string }>;
  }
) {
  const { teamId, qaId, commentId } = await context.params;

  await adminDb
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .collection("comments")
    .doc(commentId)
    .delete();

  await adminDb
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .update({
      answerCount: FieldValue.increment(-1),
    });

  return NextResponse.json({ success: true });
}
