// src/app/api/fanhub/predict/list/route.ts
export const runtime = "nodejs";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) return NextResponse.json({});

  const snap = await adminDb
    .collection("predictions")
    .doc(userId)
    .collection("matches")
    .get();

  const result: Record<string, "home" | "draw" | "away"> = {};

  snap.docs.forEach((doc) => {
    const data = doc.data();
    if (data.choice) {
      result[doc.id] = data.choice;
    }
  });

  return NextResponse.json(result);
}
