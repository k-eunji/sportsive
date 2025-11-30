// src/app/api/teams/[teamId]/fans/route.ts
import { NextResponse } from "next/server";

interface Params {
  teamId: string;
}

/**
 * ✅ GET: 특정 팀의 팬 랭킹 및 프로필 목록
 * - 추후 Firestore / DB 연결 예정
 * - 지금은 샘플 더미 데이터
 * - 프런트엔드: TeamFans.tsx 에서 사용
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { teamId } = await params;

  // ⚙️ TODO: DB에서 teamId 기준으로 팬 활동/랭킹 데이터 불러오기
  // 임시 더미 데이터
  const fans = [
    {
      id: "u1",
      name: "Marina",
      avatar:
        "https://randomuser.me/api/portraits/women/45.jpg",
      city: "London",
      score: 1280,
    },
    {
      id: "u2",
      name: "Alex",
      avatar:
        "https://randomuser.me/api/portraits/men/32.jpg",
      city: "Manchester",
      score: 940,
    },
    {
      id: "u3",
      name: "Jamie",
      avatar:
        "https://randomuser.me/api/portraits/men/76.jpg",
      city: "Birmingham",
      score: 860,
    },
    {
      id: "u4",
      name: "Luna",
      avatar:
        "https://randomuser.me/api/portraits/women/68.jpg",
      city: "Liverpool",
      score: 790,
    },
    {
      id: "u5",
      name: "Noah",
      avatar:
        "https://randomuser.me/api/portraits/men/41.jpg",
      city: "Leeds",
      score: 640,
    },
  ];

  // 응답 형식 통일
  return NextResponse.json({ teamId, fans });
}
