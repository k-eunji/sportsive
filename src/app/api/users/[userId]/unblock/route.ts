// src/app/api/users/[userId]/unblock/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const myId = await getCurrentUserId(req);
    if (!myId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId } = params;
    if (myId === userId)
      return NextResponse.json(
        { error: "Cannot unblock yourself" },
        { status: 400 }
      );

    const ref = db.collection("users").doc(myId).collection("blocked").doc(userId);
    const docSnap = await ref.get();
    if (!docSnap.exists)
      return NextResponse.json({ error: "User not blocked" }, { status: 404 });

    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/users/[userId]/unblock:", err);
    return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 });
  }
}
