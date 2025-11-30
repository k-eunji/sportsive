// src/app/api/fanhub/create/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text, mediaUrl, mediaType, userId, authorNickname, tags = [] } =
    await req.json();

  // 1) 먼저 doc id 생성
  const ref = db
    .collection("fanhub")
    .doc("global")
    .collection("messages")
    .doc();

  // 2) set()은 절대 "빈 문서" 상태로 남지 않음
  await ref.set({
    id: ref.id,  // ★ 명시적으로 저장 (나중에 FE/BE에서 혼동 없음)
    text,
    mediaUrl,
    mediaType,
    userId,
    authorNickname,
    tags,
    createdAt: new Date().toISOString(),
  });

  // 3) FE로 문서 id 반환
  return NextResponse.json({ success: true, id: ref.id });
}
