//src/app/api/teams/[teamId]/fans/count/route.ts

import { NextResponse } from "next/server";

/**
 * ✅ GET /api/teams/[teamId]/fans/count
 * - 특정 팀의 근처 팬 수를 반환합니다.
 * - 지금은 샘플 데이터로 27명 고정.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  // TODO: 실제 DB 연동 시 teamId 기반 팬 카운트 조회
  const count = 27 + Math.floor(Math.random() * 20); // 임시로 랜덤

  return NextResponse.json({ count });
}
