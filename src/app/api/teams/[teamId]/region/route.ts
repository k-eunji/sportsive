// src/app/api/teams/[teamId]/region/route.ts
import { NextResponse } from "next/server";

interface Params {
  teamId: string;
}

/**
 * ✅ GET: 특정 팀의 지역 기반 데이터
 * - region 쿼리 기반으로 근처 팬 수, 경기, 밋업 반환
 * - 지금은 더미 데이터로 구성
 * - 실제 환경에서는 Firestore / Supabase 쿼리로 대체
 */
export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const { teamId } = await params;
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") ?? "global";

  // 🔹 TODO: Firestore / DB 연결 시, region 기반 필터링 로직 추가
  // 예: const nearbyFans = await db.fans.count({ teamId, region });

  const response = {
    teamId,
    region,
    nearbyFans: region === "London" ? 128 : 54,
    nearbyMeetups: [
      { id: "m1", title: "Local Watch Party", location: "Camden Pub" },
      { id: "m2", title: "Match Meetup", location: "Hyde Park" },
    ],
    upcomingMatches: [
      {
        id: "ev1",
        opponent: "Chelsea",
        date: "2025-11-18T20:00:00Z",
        venue: "Emirates Stadium",
      },
      {
        id: "ev2",
        opponent: "Tottenham",
        date: "2025-11-26T18:30:00Z",
        venue: "Wembley Park",
      },
    ],
  };

  return NextResponse.json(response);
}
