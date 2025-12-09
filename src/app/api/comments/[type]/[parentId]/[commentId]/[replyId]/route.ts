// src/app/api/comments/[type]/[parentId]/[commentId]/[replyId]/route.ts

import { NextResponse } from "next/server";

interface Params {
  type: string;
  parentId: string;
  commentId: string;
  replyId: string;
}

/** Firebase Admin을 빌드 타임에 실행하지 않도록 동적 로드 */
async function getAdminDB() {
  const { adminDB } = await import("@/lib/firebaseAdmin");
  return adminDB;
}

/** getBaseRef */
async function getBaseRef(type: string, parentId: string) {
  const adminDB = await getAdminDB();

  if (type === "fanhub") {
    return adminDB
      .collection("fanhub")
      .doc("global")
      .collection("messages")
      .doc(parentId);
  }

  return adminDB.collection(type).doc(parentId);
}

export async function PATCH(
  req: Request,
  context: { params: Params }
) {
  const { type, parentId, commentId, replyId } = context.params;
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const baseRef = await getBaseRef(type, parentId);

  await baseRef
    .collection("comments")
    .doc(commentId)
    .collection("replies")
    .doc(replyId)
    .update({ text, edited: true });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  context: { params: Params }
) {
  const { type, parentId, commentId, replyId } = context.params;

  const baseRef = await getBaseRef(type, parentId);

  await baseRef
    .collection("comments")
    .doc(commentId)
    .collection("replies")
    .doc(replyId)
    .delete();

  return NextResponse.json({ success: true });
}
