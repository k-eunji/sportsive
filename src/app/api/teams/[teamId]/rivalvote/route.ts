//src/app/api/teams/[teamId]/rivalvote/route.ts

import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    // 🔥 Next.js 15: params must be awaited
    const { teamId } = await params;

    const ref = adminDb
      .collection("teams")
      .doc(teamId)
      .collection("rivalvote")
      .doc("module");

    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ exists: false, options: [] });
    }

    return NextResponse.json(snap.data());
  } catch (e) {
    console.error("RivalVote GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
