// src/app/api/messages/[conversationId]/read/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function POST(req: Request, context: { params: Promise<{ conversationId: string }> }) {
  try {
    const uid = await getCurrentUserId(req);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { conversationId } = await context.params;

    const convRef = db.collection("conversations").doc(conversationId);
    const msgs = await convRef.collection("messages")
      .where("to", "==", uid)
      .where("isRead", "==", false)
      .get();

    const batch = db.batch();
    msgs.docs.forEach(doc => batch.update(doc.ref, { isRead: true }));

    // ✅ 읽음 시 updatedAt 갱신
    //batch.update(convRef, { updatedAt: new Date().toISOString() });

    await batch.commit();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ POST /api/messages/[conversationId]/read:", err);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
