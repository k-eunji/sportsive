// src/app/api/users/[userId]/unblock/route.ts

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

interface RouteParams {
  params: { userId: string };
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const myId = await getCurrentUserId(req);
    if (!myId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    if (myId === userId) {
      return NextResponse.json(
        { error: "Cannot unblock yourself" },
        { status: 400 }
      );
    }

    const ref = adminDb
      .collection("users")
      .doc(myId)
      .collection("blocked")
      .doc(userId);

    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "User not blocked" },
        { status: 404 }
      );
    }

    await ref.delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/users/[userId]/unblock:", err);
    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 }
    );
  }
}
