// src/app/api/likes/check/route.ts

export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const type = url.searchParams.get("type");   // parentType
    const id = url.searchParams.get("id");       // parentId
    const userId = url.searchParams.get("userId");

    if (!type || !id || !userId) {
      return NextResponse.json({ liked: false });
    }

    // likes/{type}/{id}/{userId}
    const likeRef = adminDb
      .collection("likes")
      .doc(type)
      .collection(id)
      .doc(userId);

    const snap = await likeRef.get();

    return NextResponse.json({ liked: snap.exists });
  } catch (err) {
    console.error("❌ Like check failed:", err);
    return NextResponse.json({ liked: false }, { status: 200 });
  }
}
