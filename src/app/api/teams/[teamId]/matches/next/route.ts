// src/app/api/teams/[teamId]/matches/next/route.ts
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { teamId: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { teamId } = params;

  // TODO: SQLite 또는 API에서 실제 다음 경기 불러오기
  const nextMatch = {
    id: `next-${teamId}`,
    homeTeam: `Team ${teamId}`,
    awayTeam: "Rivals FC",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Stadium Arena",
    status: "Scheduled",
  };

  return NextResponse.json({ match: nextMatch });
}
