// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { userId, fromUserId, type, message, meetupId } = await req.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const newNotif = {
      userId,
      fromUserId: fromUserId || null,
      type: type || "general",
      message,
      meetupId: meetupId || null,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection("notifications").add(newNotif);

    return NextResponse.json({
      id: ref.id,
      ...newNotif,
    });
  } catch (err: any) {
    console.error("🔥 POST /notifications error:", err);

    return NextResponse.json(
      { error: err.message ?? "Failed to create notification" },
      { status: 500 }
    );
  }
}
