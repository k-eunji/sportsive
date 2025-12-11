// src/app/api/live/[sport]/[liveId]/messages/reactions/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db as adminDb } from "@/lib/firebaseAdmin";

const EMOJIS = ["👍", "❤️", "😮", "😢", "😡", "😂", "😱", "🎉"];

// ---------------------
// GET: 리액션 조회
// ---------------------
export async function GET(
  req: Request,
  { params }: { params: Promise<{ sport: string; liveId: string }> }
) {
  const { sport, liveId } = await params; // ★ 반드시 await

  try {
    const snapshot = await adminDb
      .collection("live_events")
      .doc(sport)
      .collection("events")
      .doc(liveId)
      .collection("reactions")
      .get();

    const count: Record<string, number> = {};
    EMOJIS.forEach((e) => (count[e] = 0));

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data?.type && EMOJIS.includes(data.type)) {
        count[data.type] += 1;
      }
    });

    return NextResponse.json(count);
  } catch (err) {
    console.error("❌ Failed to fetch reactions:", err);
    return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 });
  }
}

// ---------------------
// POST: 리액션 생성
// ---------------------
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sport: string; liveId: string }> }
) {
  const { sport, liveId } = await params; // ★ 반드시 await

  try {
    const { userId, type } = await req.json();

    if (!userId || !type) {
      return NextResponse.json(
        { error: "Missing userId or reaction type" },
        { status: 400 }
      );
    }

    const now = new Date();

    const docRef = await adminDb
      .collection("live_events")
      .doc(sport)
      .collection("events")
      .doc(liveId)
      .collection("reactions")
      .add({
        userId,
        type,
        timestamp: now,
      });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      type,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("❌ Failed to add reaction:", err);
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 });
  }
}
