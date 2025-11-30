// src/app/api/notifications/user/[userId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

/**
 * 🔔 GET: 유저의 알림 목록 불러오기 (최신순)
 */
export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  try {
    const snap = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const notifications = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("🔥 Failed to load notifications:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load notifications" },
      { status: 500 }
    );
  }
}

/**
 * ✅ PATCH: 모든 안 읽은 알림을 읽음 처리
 */
export async function PATCH(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  try {
    const snap = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .where("read", "==", false)
      .get();

    const batch = db.batch();
    snap.forEach((doc) => batch.update(doc.ref, { read: true }));
    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("🔥 Failed to mark notifications read:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to mark read" },
      { status: 500 }
    );
  }
}
