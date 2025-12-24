// src/app/api/teams/[teamId]/fans/count/route.ts

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/teams/[teamId]/fans/count
 * 임시: 팀의 팬 수를 랜덤으로 반환
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  // ✅ Next 16: params는 Promise
  const { teamId } = await params;

  // TODO: DB 연동 시 teamId 기준 실제 팬 수 조회
  const count = 27 + Math.floor(Math.random() * 20);

  return NextResponse.json({ teamId, count });
}
