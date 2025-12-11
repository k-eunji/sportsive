// src/app/api/likes/toggle/route.ts
import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parentType, parentId, userId } = body;

    if (!parentType || !parentId || !userId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const ref = db
      .collection("likes")
      .doc(parentType)
      .collection(parentId)
      .doc(userId);

    const snap = await ref.get();

    if (snap.exists) {
      await ref.delete();
      return NextResponse.json({ liked: false });
    }

    await ref.set({
      userId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ liked: true });

  } catch (err) {
    console.error("❌ Like toggle failed:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
