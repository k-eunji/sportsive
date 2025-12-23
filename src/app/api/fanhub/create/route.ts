// src/app/api/fanhub/create/route.ts
export const runtime = "nodejs";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";   // ★ 추가됨

export async function POST(req: Request) {
  const { text, mediaUrl, mediaType, userId, authorNickname, tags = [] } =
    await req.json();

  // 1) 문서 ID 먼저 생성
  const ref = adminDb
    .collection("fanhub")
    .doc("global")
    .collection("messages")
    .doc();

  // 2) Firestore에 정상 저장
  await ref.set({
    id: ref.id,
    text,
    mediaUrl,
    mediaType,
    userId,
    authorNickname,
    tags,
    createdAt: FieldValue.serverTimestamp(),   // ★ 여기만 변경됨!
  });

  // 3) FE로 문서 ID 반환
  return NextResponse.json({ success: true, id: ref.id });
}
