// src/app/api/messages/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function POST(req: NextRequest) {
  try {
    const fromId = await getCurrentUserId(req);

    if (!fromId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to } = await req.json();
    if (!to) {
      return NextResponse.json({ error: "Missing recipient" }, { status: 400 });
    }

    const participants = [fromId, to].sort();
    const participantsKey = participants.join("_");

    // 🔹 기존 대화가 있는지 확인
    const existing = await db
      .collection("conversations")
      .where("participantsKey", "==", participantsKey)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json({
        conversationId: existing.docs[0].id,
        existing: true,
      });
    }

    // 🔹 새 대화 생성
    const newConvRef = await db.collection("conversations").add({
      participants,
      participantsKey,
      type: "dm",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: "",
      lastSender: "",
    });

    return NextResponse.json({
      conversationId: newConvRef.id,
      existing: false,
    });
  } catch (err) {
    console.error("❌ POST /api/messages/start:", err);
    return NextResponse.json(
      { error: "Failed to start conversation" },
      { status: 500 }
    );
  }
}
