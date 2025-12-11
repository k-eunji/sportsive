// src/app/api/messages/[conversationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

interface RouteParams {
  params: { conversationId: string };
}

// ------------------------------------------------------------
// 🔹 GET → 대화 상세 조회 + 메시지 목록 반환
// ------------------------------------------------------------
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { conversationId } = params;
    const uid = await getCurrentUserId(req);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const convRef = db.collection("conversations").doc(conversationId);
    const convSnap = await convRef.get();

    if (!convSnap.exists) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const convData = convSnap.data() as any;

    if (!convData.participants.includes(uid)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messagesSnap = await convRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnap.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        text: data.text,
        from: data.from,
        to: data.to,
        createdAt: data.createdAt,
        isMine: data.from === uid,
      };
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("❌ GET /messages/[conversationId]:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------
// 🔹 DELETE → 대화 + 메시지 전체 삭제
// ------------------------------------------------------------
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { conversationId } = params;
    const uid = await getCurrentUserId(req);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const convRef = db.collection("conversations").doc(conversationId);
    const convSnap = await convRef.get();

    if (!convSnap.exists) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const convData = convSnap.data() as any;

    if (!convData.participants.includes(uid)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const msgsSnap = await convRef.collection("messages").get();
    const batch = db.batch();

    msgsSnap.forEach((doc) => batch.delete(doc.ref));
    batch.delete(convRef);

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /messages/[conversationId]:", err);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
