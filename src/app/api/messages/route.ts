// src/app/api/messages/route.ts

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function POST(req: NextRequest) {
  try {
    const senderId = await getCurrentUserId(req);

    if (!senderId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, text, conversationId } = await req.json();

    if (!to || !text) {
      return NextResponse.json(
        { error: "Missing params" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // 🔒 양방향 블락 상태 확인
    // ---------------------------------------------------
    const [senderBlockedDoc, receiverBlockedDoc] = await Promise.all([
      adminDb.collection("users").doc(senderId).collection("blocked").doc(to).get(),
      adminDb.collection("users").doc(to).collection("blocked").doc(senderId).get(),
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

    // ---------------------------------------------------
    // 🧩 기존 대화 찾기 또는 생성
    // ---------------------------------------------------
    let convId = conversationId;
    const participants = [senderId, to].sort();
    const participantsKey = participants.join("_");

    if (!convId) {
      // 🔹 기존 DM이 있는지 확인
      const existing = await adminDb
        .collection("conversations")
        .where("participantsKey", "==", participantsKey)
        .limit(1)
        .get();

      if (existing.empty) {
        // 🔹 새 대화 생성
        const newConv = await adminDb.collection("conversations").add({
          participants,
          participantsKey,
          type: "dm",
          lastMessage: text,
          lastSender: senderId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        convId = newConv.id;
      } else {
        // 🔹 기존 대화 업데이트
        convId = existing.docs[0].id;

        await adminDb.collection("conversations").doc(convId).update({
          lastMessage: text,
          lastSender: senderId,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // ---------------------------------------------------
    // 💬 메시지 저장
    // ---------------------------------------------------
    const msgRef = await adminDb
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
