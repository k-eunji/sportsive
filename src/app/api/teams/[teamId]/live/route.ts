// src/app/api/teams/[teamId]/live/route.ts
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { teamId: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { teamId } = params;

  // TODO: 실제 DB에서 teamId 기반 라이브 채팅방 조회
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
