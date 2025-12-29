// src/app/api/trending/local/leagues/route.ts
import { NextRequest, NextResponse } from "next/server";

function normalize(str?: string | null) {
  return (str ?? "").toLowerCase().trim();
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  if (!city) return NextResponse.json([], { status: 400 });

  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL;

    // 1) 경기 정보 (football + rugby)
    const [footballRes, rugbyRes] = await Promise.all([
      fetch(`${base}/api/events/england/football`, { cache: "no-store" }),
      fetch(`${base}/api/events/england/rugby`, { cache: "no-store" }),
    ]);

    const footballJson = footballRes.ok ? await footballRes.json() : { matches: [] };
    const rugbyJson = rugbyRes.ok ? await rugbyRes.json() : { matches: [] };

    const matches = [
      ...(footballJson.matches ?? []),
      ...(rugbyJson.matches ?? []),
    ];

    // 2) FanHub 게시글
    const postsRes = await fetch(`${base}/api/fanhub/list?sort=latest`, {
      cache: "no-store",
    });
    const posts = await postsRes.json();

    const scores: Record<string, number> = {};
    const add = (league: string, amount: number) => {
      if (!league) return;
      if (!scores[league]) scores[league] = 0;
      scores[league] += amount;
    };

    const normCity = normalize(city);

    // A. 해당 도시에서 개최된 경기 → 리그 점수 증가
    for (const m of matches) {
      if (normalize(m.city) === normCity) {
        add(m.competition, 5);
      }
    }

    // B. 해당 도시 사용자 FanHub 게시글 → 태그 기반 점수
    const localPosts = posts.filter(
      (p: any) => normalize(p.authorCity) === normCity
    );

    for (const p of localPosts) {
      if (!Array.isArray(p.tags)) continue;
      for (const tag of p.tags) {
        add(tag, 3);
      }
    }

    const trending = Object.entries(scores)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json(trending);
  } catch (err) {
    console.error("❌ Local trending leagues error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
