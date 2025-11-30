//src/app/api/fanhub/predict/exists/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, matchId } = await req.json();

  const ref = db
    .collection("fanhub")
    .doc("predict")
    .collection("matches")
    .doc(matchId)
    .collection("predictions")
    .doc(userId);

  const snap = await ref.get();

  return NextResponse.json({
    exists: snap.exists,
    data: snap.exists ? snap.data() : null
  });
}
