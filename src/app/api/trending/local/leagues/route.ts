// src/app/api/trending/local/leagues/route.ts

import { NextResponse } from "next/server";

function normalize(str?: string | null) {
  if (!str) return "";
  return str.toLowerCase();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city");
  if (!city) return NextResponse.json([], { status: 400 });

  try {
    // 1) 경기 정보 가져오기
    const matchesRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/england/football`,
      { cache: "no-store" }
    );
    const matchesJson = await matchesRes.json();
    const matches = matchesJson.matches ?? [];

    // 2) FanHub 게시글 가져오기
    const postsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/fanhub/list?sort=latest`,
      { cache: "no-store" }
    );
    const posts = await postsRes.json();

    const scores: Record<string, number> = {};
    const add = (league: string, amount: number) => {
      if (!league) return;
      if (!scores[league]) scores[league] = 0;
      scores[league] += amount;
    };

    // A. 해당 city에서 열린 경기 → 리그 점수
    for (const m of matches) {
      if (normalize(m.city) === normalize(city)) {
        add(m.competition, 5);
      }
    }

    // B. 해당 city의 fanhub 게시글에서 리그 언급하면 점수
    const localPosts = posts.filter(
      (p: any) => normalize(p.authorCity) === normalize(city)
    );

    for (const p of localPosts) {
      if (!Array.isArray(p.tags)) continue;

      for (const t of p.tags) {
        // PL 같은 리그 태그가 있으면 점수 부여
        add(t, 3);
      }
    }

    const trending = Object.entries(scores)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json(trending);
  } catch (err) {
    console.error("Local trending leagues error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
