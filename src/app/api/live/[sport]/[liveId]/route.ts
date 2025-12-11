// src/app/api/live/[sport]/[liveId]/route.ts
import { NextResponse } from "next/server";
import { getEventById } from "@/lib/events";
import { db as adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sport: string; liveId: string }> }
) {
  const { sport, liveId } = await params; // ★ 반드시 await

  try {
    const event = await getEventById(liveId);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const liveDoc = await adminDb
      .collection("live_events")
      .doc(sport)
      .collection("events")
      .doc(liveId)
      .get();

    const participants = liveDoc.exists
      ? liveDoc.data()?.participants ?? 0
      : 0;

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
