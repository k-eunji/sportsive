// src/app/api/live/[sport]/[liveId]/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getEventById } from "@/lib/events";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sport: string; liveId: string }> }
) {
  const { sport, liveId } = await params;

  try {
    // 1️⃣ 이벤트 기본 정보
    const event = await getEventById(liveId);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // 2️⃣ 🔥 presence 문서 개수 = 실제 참여자 수
    const presenceSnap = await adminDb
      .collection("live_events")
      .doc(sport)
      .collection("events")
      .doc(liveId)
      .collection("presence")
      .get();

    const participants = presenceSnap.size;

    // 3️⃣ 응답
    return NextResponse.json({
      ...event,
      title: `${event.homeTeam} vs ${event.awayTeam} Live`,
      participants,
    });

  } catch (error) {
    console.error("❌ Failed to fetch live event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
