// src/app/api/messages/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  try {
    const senderId = await getCurrentUserId(req);
    if (!senderId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { to, text, conversationId } = await req.json();
    if (!to || !text)
      return NextResponse.json({ error: "Missing params" }, { status: 400 });

    // ✅ 블락 여부 확인 (양방향)
    const [senderBlockedDoc, receiverBlockedDoc] = await Promise.all([
      db.collection("users").doc(senderId).collection("blocked").doc(to).get(),
      db.collection("users").doc(to).collection("blocked").doc(senderId).get(),
    ]);

    if (senderBlockedDoc.exists) {
      return NextResponse.json(
        { error: "You have blocked this user." },
        { status: 403 }
      );
    }

    if (receiverBlockedDoc.exists) {
      return NextResponse.json(
        { error: "You are blocked by this user." },
        { status: 403 }
      );
    }

    // ✅ 기존 대화 확인 및 생성
    let convId = conversationId;
    const participants = [senderId, to].sort();
    const participantsKey = participants.join("_");

    if (!convId) {
      const existing = await db
        .collection("conversations")
        .where("participantsKey", "==", participantsKey)
        .limit(1)
        .get();

      if (existing.empty) {
        const newConv = await db.collection("conversations").add({
          participants,
          participantsKey,
          lastMessage: text,
          type: "dm",
          lastSender: senderId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        convId = newConv.id;
      } else {
        convId = existing.docs[0].id;
        await db.collection("conversations").doc(convId).update({
          lastMessage: text,
          lastSender: senderId,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // ✅ 메시지 저장
    const msgRef = await db
      .collection("conversations")
      .doc(convId)
      .collection("messages")
      .add({
        from: senderId,
        to,
        text,
        createdAt: new Date().toISOString(),
        isRead: false,
      });

    return NextResponse.json({
      id: msgRef.id,
      conversationId: convId,
      text,
      isMine: true,
    });
  } catch (err) {
    console.error("❌ POST /api/messages:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
