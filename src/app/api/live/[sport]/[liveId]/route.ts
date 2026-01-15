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
    // ✅ sport 전달
    const event = await getEventById(liveId, sport as any);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // 🔥 presence = 실제 참여자 수
    const presenceSnap = await adminDb
      .collection("live_events")
      .doc(sport)
      .collection("events")
      .doc(liveId)
      .collection("presence")
      .get();

    const participants = presenceSnap.size;

    return NextResponse.json({
      ...event,

      // 🎾 tennis는 title 그대로 사용
      title:
        event.kind === "session"
          ? event.title
          : `${event.homeTeam} vs ${event.awayTeam} Live`,

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
