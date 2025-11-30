//src/app/api/live/[sport]/[liveId]/participants/route.ts

import { NextResponse } from "next/server";
import { db as adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 입장(+1), 퇴장(-1) 모두 POST로 처리
export async function POST(
  req: Request,
  context: { params: Promise<{ sport: string; liveId: string }> }
) {
  const { sport, liveId } = await context.params;

  try {
    let diff = 1; // 기본 입장(+1)

    // body.leave === true → 퇴장(-1)
    try {
      const body = await req.json();
      if (body.leave === true) diff = -1;
    } catch (_) {
      // body 없으면 그대로 +1
    }

    await adminDb
      .collection("live_events")
      .doc(sport)
      .collection("events")
      .doc(liveId)
      .set(
        {
          exists: true,                    // ⭐ 문서를 실제로 존재하게 만드는 핵심
          participants: FieldValue.increment(diff),
          updatedAt: new Date(),           // (옵션) Firestore가 문서를 완전히 인정하게 됨
        },
        { merge: true }
      );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update participants" },
      { status: 500 }
    );
  }
}
