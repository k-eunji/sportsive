//src/app/api/likes/check/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");   // parentType
    const id = url.searchParams.get("id");       // parentId
    const userId = url.searchParams.get("userId");

    if (!type || !id || !userId) {
      return NextResponse.json({ liked: false });
    }

    // 게시물 좋아요는 "likes/{type}/{id}/{userId}" 경로에 저장됨
    const likeRef = db
      .collection("likes")
      .doc(type)            // fanhub
      .collection(id)       // message.id
      .doc(userId);         // user

    const snap = await likeRef.get();

    return NextResponse.json({ liked: snap.exists });
  } catch (e) {
    console.error("❌ Like check failed:", e);
    return NextResponse.json({ liked: false }, { status: 500 });
  }
}
