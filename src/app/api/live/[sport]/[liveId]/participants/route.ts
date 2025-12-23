// src/app/api/live/[sport]/[liveId]/participants/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sport: string; liveId: string }> }
) {
  const { sport, liveId } = await params; // ★ 반드시 await

  try {
    let diff = 1;

    try {
      const body = await req.json();
      if (body?.leave === true) diff = -1;
    } catch (_) {
      // body가 없으면 기본값 +1 유지
    }

    await adminDb
      .collection("live_events")
      .doc(sport)
      .collection("events")
      .doc(liveId)
      .set(
        {
          exists: true, // 문서가 반드시 존재하게 만들기
          participants: FieldValue.increment(diff),
          updatedAt: new Date(),
        },
        { merge: true }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Failed to update participants:", error);
    return NextResponse.json(
      { error: "Failed to update participants" },
      { status: 500 }
    );
  }
}
