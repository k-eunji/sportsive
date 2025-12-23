// src/app/api/fanhub/predict/user/[userId]/route.ts
export const runtime = "nodejs";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // 🔥 올바른 collectionGroup = "matches"
  const snap = await adminDb
    .collectionGroup("matches")
    .where("userId", "==", userId)
    .get();

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(data);
}
