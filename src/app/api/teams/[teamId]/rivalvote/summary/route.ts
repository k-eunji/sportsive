///src/app/api/teams/[teamId]/rivalvote/summary/route.ts

import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    const ref = adminDb
      .collection("teams")
      .doc(teamId)
      .collection("rivalvote")
      .doc("module");

    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({
        rivalTopTeam: null,
        totalVotes: 0,
        secondTeam: null,
      });
    }

    const raw = snap.data() as any;

    // 🔥 모든 API가 data.options로 통일
    const options = raw.data?.options ?? [];

    if (!Array.isArray(options) || options.length === 0) {
      return NextResponse.json({
        rivalTopTeam: null,
        totalVotes: 0,
        secondTeam: null,
      });
    }

    // 🔥 득표순 정렬
    const sorted = [...options].sort((a, b) => b.votes - a.votes);

    const top = sorted[0];
    const second = sorted[1] ?? null;

    // 🔥 아무도 투표 안했으면 null 반환
    if (!top || top.votes === 0) {
      return NextResponse.json({
        rivalTopTeam: null,
        totalVotes: 0,
        secondTeam: null,
      });
    }

    const totalVotes = sorted.reduce((sum, t) => sum + (t.votes ?? 0), 0);

    return NextResponse.json({
      rivalTopTeam: top,
      totalVotes,
      secondTeam: second,
    });
  } catch (err) {
    console.error("RivalVote SUMMARY error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
