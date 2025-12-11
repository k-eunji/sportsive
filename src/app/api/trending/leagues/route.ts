// src/app/api/trending/leagues/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL;

    // 1) 이벤트, 팀, 팬허브 데이터를 병렬 요청
    const [eventsRes, teamsRes, fanhubRes] = await Promise.allSettled([
      fetch(`${base}/api/events`),
      fetch(`${base}/api/teams`),
      fetch(`${base}/api/fanhub/list?sort=latest`),
    ]);

    const safeJson = async (res: PromiseSettledResult<Response>) => {
      if (res.status === "fulfilled" && res.value.ok) {
        try {
          return await res.value.json();
        } catch {
          return null;
        }
      }
      return null;
    };

    const events = (await safeJson(eventsRes))?.events ?? [];
    const teams = (await safeJson(teamsRes))?.teams ?? [];
    const posts = (await safeJson(fanhubRes)) ?? [];

    // 2) 리그별 점수 집계
    const scores: Record<string, number> = {};

    const addScore = (key: string | null | undefined, amount: number) => {
      if (!key) return;
      if (!scores[key]) scores[key] = 0;
      scores[key] += amount;
    };

    // 🔥 이벤트 기반 리그 점수 부여
    for (const e of events) {
      addScore(e.competition, 2);
    }

    // 🔥 팀 기반 리그 가중치 추가
    for (const t of teams) {
      addScore(t.competition, 1);
    }

    // 🔥 FanHub 언급 기반 점수
    for (const p of posts) {
      const text = p.text?.toLowerCase() ?? "";
      const tags = Array.isArray(p.tags) ? p.tags : [];

      for (const league of Object.keys(scores)) {
        const lowerLeague = league.toLowerCase();

        if (text.includes(lowerLeague)) {
          addScore(league, 3); // 본문 언급 강조
        }

        if (tags.some((t: string) => t.toLowerCase() === lowerLeague)) {
          addScore(league, 4); // 태그 언급은 더 강함
        }
      }
    }

    // 3) 정렬 후 상위 20개만 반환
    const trending = Object.entries(scores)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return NextResponse.json(trending);
  } catch (err) {
    console.error("❌ Trending leagues failed:", err);
    return NextResponse.json([], { status: 500 });
  }
}
