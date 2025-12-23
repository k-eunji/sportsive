// src/app/api/notifications/[notificationId]/route.ts

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

interface RouteParams {
  params: { notificationId: string };
}

export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  try {
    await adminDb.collection("notifications").doc(params.notificationId).update({
      read: true,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ PATCH /notifications/[id] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await adminDb.collection("notifications").doc(params.notificationId).delete();

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ DELETE /notifications/[id] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to delete notification" },
      { status: 500 }
    );
  }
}
