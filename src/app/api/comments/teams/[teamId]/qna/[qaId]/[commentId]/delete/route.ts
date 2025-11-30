//src/app/api/comments/teams/[teamId]/qna/[qaId]/[commentId]/delete/route.ts

import { adminDB } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore"; // ⭐ 필수

export async function POST(req: Request, { params }: any) {
  const { teamId, qaId, commentId } = await params;

  // 댓글 삭제
  await adminDB
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .collection("comments")
    .doc(commentId)
    .delete();

  // answerCount -1
  await adminDB
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .update({
      answerCount: FieldValue.increment(-1), // ⭐ok
    });

  return NextResponse.json({ success: true });
}
