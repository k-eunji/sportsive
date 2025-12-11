///api/comments/like/toggle/route.ts

import { adminDB } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { type, parentId, commentId, replyId, userId } = await req.json();

  if (!type || !parentId || !commentId || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const base =
    type === "fanhub"
      ? adminDB
          .collection("fanhub")
          .doc("global")
          .collection("messages")
          .doc(parentId)
      : adminDB.collection(type).doc(parentId);

  const targetRef = replyId
    ? base
        .collection("comments")
        .doc(commentId)
        .collection("replies")
        .doc(replyId)
    : base.collection("comments").doc(commentId);

  const likeRef = targetRef.collection("likes").doc(userId);
  const snap = await likeRef.get();

  if (snap.exists) {
    await likeRef.delete();
    return NextResponse.json({ liked: false });
  }

  await likeRef.set({
    userId,
    createdAt: Date.now(),
  });

  return NextResponse.json({ liked: true });
}
