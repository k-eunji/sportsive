// src/app/api/users/[userId]/block/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

interface RouteParams {
  params: { userId: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const myId = await getCurrentUserId(req);
    if (!myId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    if (myId === userId) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 }
      );
    }

    await db
      .collection("users")
      .doc(myId)
      .collection("blocked")
      .doc(userId)
      .set({
        blockedAt: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ POST /api/users/[userId]/block:", err);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}
