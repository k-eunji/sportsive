// src/app/api/users/[userId]/block-status/route.ts

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

interface RouteParams {
  params: { userId: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const myId = await getCurrentUserId(req);
    if (!myId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    const ref = adminDb
      .collection("users")
      .doc(myId)
      .collection("blocked")
      .doc(userId);

    const snap = await ref.get();

    return NextResponse.json({ blocked: snap.exists });
  } catch (err) {
    console.error("❌ GET /api/users/[userId]/block-status:", err);
    return NextResponse.json(
      { error: "Failed to check block status" },
      { status: 500 }
    );
  }
}
