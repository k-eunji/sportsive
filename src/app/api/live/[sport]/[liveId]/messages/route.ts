// src/app/api/live/[sport]/[liveId]/messages/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db as adminDb } from "@/lib/firebaseAdmin";

// GET 메시지 가져오기
export async function GET(
  req: Request,
  context: { params: Promise<{ sport: string; liveId: string }> }
) {
  const { sport, liveId } = await context.params;

  try {
    const snapshot = await adminDb
      .collection("live_events")
      .doc(sport)
      .collection("events")
      .doc(liveId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .get();

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("❌ Failed to fetch messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}


// POST 메시지 생성
export async function POST(
  req: Request,
  context: { params: Promise<{ sport: string; liveId: string }> }
) {
  const { sport, liveId } = await context.params;

  try {
    const body = await req.json();
    const { user, text } = body;

    if (!user?.trim() || !text?.trim()) {
      return NextResponse.json(
        { error: "Missing user or text" },
        { status: 400 }
      );
    }

    const now = new Date();

    const docRef = await adminDb
      .collection("live_events")
      .doc(sport)
      .collection("events")
      .doc(liveId)
      .collection("messages")
      .add({
        user,
        text,
        timestamp: now,
      });

    return NextResponse.json({
      id: docRef.id,
      user,
      text,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("❌ Failed to add message:", error);
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 });
  }
}
