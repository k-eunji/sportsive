// app/api/matches/[matchId]/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db.mock";

export async function GET(
  req: Request,
  context: { params: Promise<{ matchId: string }> } // ✅ Promise로 변경
) {
  const { matchId } = await context.params; // ✅ await 필요

  try {
    const docSnap = await db.collection("matches").doc(matchId).get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (err) {
    console.error("GET match error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
