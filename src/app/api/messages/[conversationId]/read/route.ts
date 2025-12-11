// src/app/api/messages/[conversationId]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

interface RouteParams {
  params: { conversationId: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const uid = await getCurrentUserId(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;

    const convRef = db.collection("conversations").doc(conversationId);

    const unreadMsgsSnap = await convRef
      .collection("messages")
      .where("to", "==", uid)
      .where("isRead", "==", false)
      .get();

    const batch = db.batch();

    unreadMsgsSnap.docs.forEach((doc) => batch.update(doc.ref, { isRead: true }));

    // 필요 시 updatedAt 활성화
    // batch.update(convRef, { updatedAt: new Date().toISOString() });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ POST /messages/[conversationId]/read:", err);
    return NextResponse.json(
      { error: "Failed to mark as read" },
      { status: 500 }
    );
  }
}
