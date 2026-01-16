// src/app/api/events/[eventId]/notes/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// ---------------------
// GET: 노트 목록
// ---------------------
export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  try {
    const snap = await adminDb
      .collection("event_notes")
      .doc(eventId)
      .collection("notes")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const notes = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ notes });
  } catch (e) {
    console.error("❌ fetch notes failed", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// ---------------------
// POST: 노트 추가
// ---------------------
export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { text, intent, anonId } = await req.json();

  if (!text?.trim() || text.length > 80) {
    return NextResponse.json(
      { error: "Invalid note" },
      { status: 400 }
    );
  }

  try {
    const ref = await adminDb
      .collection("event_notes")
      .doc(eventId)
      .collection("notes")
      .add({
        text: text.trim(),
        intent: intent ?? null,
        anonId,
        createdAt: new Date(),
      });

    return NextResponse.json({
      id: ref.id,
      text,
      intent,
    });
  } catch (e) {
    console.error("❌ add note failed", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
