// src/app/api/notifications/[notificationId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function PATCH(req: Request, { params }: { params: { notificationId: string } }) {
  try {
    await db.collection("notifications").doc(params.notificationId).update({ read: true });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Error marking notification read:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { notificationId: string } }) {
  try {
    await db.collection("notifications").doc(params.notificationId).delete();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Error deleting notification:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
