// src/app/api/fanhub/predict/stats/route.ts
export const runtime = "nodejs";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const snap = await adminDb.collectionGroup("matches").get();

  const stats: Record<string, { home: number; draw: number; away: number }> = {};

  snap.forEach(doc => {
    const data = doc.data();
    const matchId = data.matchId;
    const choice = data.choice as "home" | "draw" | "away";

    if (!stats[matchId]) {
      stats[matchId] = { home: 0, draw: 0, away: 0 };
    }

    stats[matchId][choice]++;
  });

  return NextResponse.json(stats);
}
