//src/app/api/messages/start/route.ts

// src/app/api/messages/start/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  try {
    const fromId = await getCurrentUserId(req);
    if (!fromId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { to } = await req.json();
    if (!to) return NextResponse.json({ error: "Missing recipient" }, { status: 400 });

    const participants = [fromId, to].sort();
    const participantsKey = participants.join("_");

    // ✅ 기존 대화 확인
    const existingSnap = await db
      .collection("conversations")
      .where("participantsKey", "==", participantsKey)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      const existing = existingSnap.docs[0];
      return NextResponse.json({ conversationId: existing.id, existing: true });
    }

    // ✅ 새 대화 생성 — 메시지를 주고받기 전이므로 lastSender/lastMessage는 빈 값으로 초기화
    const newConv = await db.collection("conversations").add({
      participants,
      participantsKey,
      type: "dm",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: "",
      lastSender: "", // ✅ 수정됨: 메시지를 보내기 전엔 비워둠
    });

    return NextResponse.json({ conversationId: newConv.id, existing: false });
  } catch (err) {
    console.error("❌ POST /api/messages/start:", err);
    return NextResponse.json({ error: "Failed to start conversation" }, { status: 500 });
  }
}
