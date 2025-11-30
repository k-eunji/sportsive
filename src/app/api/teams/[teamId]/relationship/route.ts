//src/app/api/teams/[teamId]/relationship/route.ts


import { NextResponse } from "next/server";

interface Params {
  teamId: string;
}

/** GET: 로그인된 사용자의 팀 관계 상태 가져오기 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { teamId } = await params;

  // ⚙️ TODO: 실제 로그인 유저 기반 데이터로 교체
  const relationship = { status: "NONE" }; // NONE | FAN | MEMBER | BLOCKED 등

  return NextResponse.json(relationship);
}

/** PATCH: 관계 상태 변경 (예: 팬 등록/해제) */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  const { teamId } = await params;
  const body = await req.json();

  const { status } = body;

  console.log(`🧩 Update relationship for team ${teamId}:`, status);

  // ⚙️ TODO: 실제 DB 업데이트 로직 추가
  return NextResponse.json({ ok: true, status });
}
