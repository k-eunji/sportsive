// src/app/api/comments/[type]/[parentId]/[commentId]/route.ts

import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

interface Params {
  type: string;
  parentId: string;
  commentId: string;
}

/** 🔧 fanhub 전용 처리 포함한 공통 ref 생성 함수 */
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

/* ============================
    PATCH — 댓글 수정
============================ */
export async function PATCH(
  req: Request,
  context: { params: Params }
) {
  const { type, parentId, commentId } = context.params;

  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const baseRef = getBaseRef(type, parentId);

  await baseRef
    .collection("comments")
    .doc(commentId)
    .update({
      text,
      edited: true,
    });

  return NextResponse.json({ success: true });
}

/* ============================
    DELETE — 댓글 삭제
============================ */
export async function DELETE(
  req: Request,
  context: { params: Params }
) {
  const { type, parentId, commentId } = context.params;

  const baseRef = getBaseRef(type, parentId);

  await baseRef
    .collection("comments")
    .doc(commentId)
    .delete();

  return NextResponse.json({ success: true });
}
