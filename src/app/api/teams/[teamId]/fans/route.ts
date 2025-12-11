// src/app/api/teams/[teamId]/fans/route.ts
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { teamId: string };
}

/**
 * GET /api/teams/[teamId]/fans
 * 특정 팀의 팬 목록 및 랭킹 데이터 반환 (현재는 더미 데이터)
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { teamId } = params;

  // TODO: 추후 Firestore 또는 DB에서 팬 랭킹/활동 정보 조회
  const fans = [
    {
      id: "u1",
      name: "Marina",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      city: "London",
      score: 1280,
    },
    {
      id: "u2",
      name: "Alex",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      city: "Manchester",
      score: 940,
    },
    {
      id: "u3",
      name: "Jamie",
      avatar: "https://randomuser.me/api/portraits/men/76.jpg",
      city: "Birmingham",
      score: 860,
    },
    {
      id: "u4",
      name: "Luna",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      city: "Liverpool",
      score: 790,
    },
    {
      id: "u5",
      name: "Noah",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
      city: "Leeds",
      score: 640,
    },
  ];

  return NextResponse.json({ teamId, fans });
}
