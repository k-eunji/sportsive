// src/app/api/fanhub/predict/create/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, matchId, choice } = await req.json();

    if (!userId || !matchId || !choice) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

  const ref = db
    .collection("predictions")
    .doc(userId)
    .collection("matches")
    .doc(matchId);
    const exist = await ref.get();

    if (exist.exists) {
      return NextResponse.json(
        { error: "Already predicted" },
        { status: 403 }
      );
    }

    await ref.set({
      userId,
      matchId,
      choice,            // "home" | "draw" | "away"
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Predict API Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
