// src/app/api/users/[userId]/block-status/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const myId = await getCurrentUserId(req);
    if (!myId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId } = params;

    const ref = db.collection("users").doc(myId).collection("blocked").doc(userId);
    const docSnap = await ref.get();

    return NextResponse.json({ blocked: docSnap.exists });
  } catch (err) {
    console.error("❌ GET /api/users/[userId]/block-status:", err);
    return NextResponse.json(
      { error: "Failed to check block status" },
      { status: 500 }
    );
  }
}
