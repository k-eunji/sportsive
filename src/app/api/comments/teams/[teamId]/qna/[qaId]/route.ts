//src/app/api/comments/teams/[teamId]/qna/[qaId]/route.ts

import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";


// GET: 댓글 가져오기
export async function GET(
  _req: Request,
  context: { params: Promise<{ teamId: string; qaId: string }> }
) {
  const { teamId, qaId } = await context.params; // ⬅️ 반드시 await


  const snap = await adminDB
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .collection("comments")
    .orderBy("createdAt", "asc")
    .get();

  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(list);
}

// POST: 댓글 작성
export async function POST(
  req: Request,
  context: { params: Promise<{ teamId: string; qaId: string }> }
) {
  const { teamId, qaId } = await context.params; // ⬅️ 반드시 await

  const body = await req.json();

  const ref = adminDB
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .collection("comments")
    .doc();

  // 댓글 저장
  await ref.set({
    id: ref.id,
    text: body.text,
    userId: body.userId,
    authorNickname: body.authorNickname,
    createdAt: Date.now(),
  });

  // 🔥 댓글 수(answerCount) 증가시키기
  await adminDB
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .update({
      answerCount: FieldValue.increment(1),
    });

  return NextResponse.json({ success: true });
}
