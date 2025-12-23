//src/app/api/comments/teams/[teamId]/qna/[qaId]/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb} from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
  _req: Request,
  context: { params: Promise<{ teamId: string; qaId: string }> }
) {
  const { teamId, qaId } = await context.params;

  const snap = await adminDb
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

export async function POST(
  req: Request,
  context: { params: Promise<{ teamId: string; qaId: string }> }
) {
  const { teamId, qaId } = await context.params;

  const body = await req.json();

  const ref = adminDb
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .collection("comments")
    .doc();

  await ref.set({
    id: ref.id,
    text: body.text,
    userId: body.userId,
    authorNickname: body.authorNickname,
    createdAt: Date.now(),
  });

  await adminDb
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .doc(qaId)
    .update({
      answerCount: FieldValue.increment(1),
    });

  return NextResponse.json({ success: true });
}
