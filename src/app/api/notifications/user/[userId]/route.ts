// src/app/api/notifications/user/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

interface RouteParams {
  params: { userId: string };
}

/**
 * 🔔 GET: 유저 알림 목록 조회 (최신순)
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
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
    console.error("🔥 GET /notifications/user/[id] failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to load notifications",
      },
      { status: 500 }
    );
  }
}

/**
 * 📩 PATCH: 모든 안 읽은 알림 읽음 처리
 */
export async function PATCH(_req: NextRequest, { params }: RouteParams) {
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
    console.error("🔥 PATCH /notifications/user/[id] failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to update notifications",
      },
      { status: 500 }
    );
  }
}
