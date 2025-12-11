// src/app/api/comments/[type]/[parentId]/[commentId]/route.ts

import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

interface Params {
  type: string;
  parentId: string;
  commentId: string;
}

/** ✅ getBaseRef 로컬 함수 */
function getBaseRef(type: string, parentId: string) {
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
  context: { params: Promise<Params> }   // ✅ Promise로 변경
) {
  const { type, parentId, commentId } = await context.params; // ✅ 반드시 await

  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const baseRef = getBaseRef(type, parentId);

  await baseRef
    .collection("comments")
    .doc(commentId)
    .update({ text, edited: true });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<Params> }   // ✅ Promise로 변경
) {
  const { type, parentId, commentId } = await context.params; // ✅ 반드시 await

  const baseRef = getBaseRef(type, parentId);

  await baseRef
    .collection("comments")
    .doc(commentId)
    .delete();

  return NextResponse.json({ success: true });
}
