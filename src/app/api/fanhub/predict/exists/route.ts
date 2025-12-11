// src/app/api/fanhub/predict/exists/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, matchId } = await req.json();

  if (!userId || !matchId) {
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

  const snap = await ref.get();

  return NextResponse.json({
    exists: snap.exists,
    data: snap.exists ? snap.data() : null,
  });
}
