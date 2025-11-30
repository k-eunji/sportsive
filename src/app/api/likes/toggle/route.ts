//src/app/api/likes/toggle/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { parentType, parentId, userId } = await req.json();

  if (!parentType || !parentId || !userId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const ref = db
    .collection("likes")
    .doc(parentType)
    .collection(parentId)
    .doc(userId);

  const snap = await ref.get();

  if (snap.exists) {
    // 이미 좋아요 한 상태 → 취소
    await ref.delete();
    return NextResponse.json({ liked: false });
  }

  // 좋아요 추가
  await ref.set({
    userId,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ liked: true });
}
