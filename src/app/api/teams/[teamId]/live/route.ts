import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  // ✅ params를 언래핑
  const { teamId } = await params;

  // 예시 데이터 — 실제에선 DB에서 teamId 기반 조회
  const rooms = [
    {
      id: "abc123",
      title: `Team ${teamId} vs Rivals – Live Chat`,
      participants: ["Alex", "Mina", "Jay"],
      datetime: new Date().toISOString(),
    },
  ];

  return NextResponse.json({ rooms });
}
