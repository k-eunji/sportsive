//src/app/api/teams/[teamId]/matches/next/route.ts

import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  // ✅ TODO: SQLite 쿼리로 실제 경기 불러오기 (지금은 더미 데이터)
  const nextMatch = {
    id: "next-" + teamId,
    homeTeam: `Team ${teamId}`,
    awayTeam: "Rivals FC",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Stadium Arena",
    status: "Scheduled",
  };

  return NextResponse.json({ match: nextMatch });
}
