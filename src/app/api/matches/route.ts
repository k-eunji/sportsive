// app/api/matches/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  req: Request,
  context: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await context.params;

  try {
    const docSnap = await adminDb.collection("matches").doc(matchId).get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
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
