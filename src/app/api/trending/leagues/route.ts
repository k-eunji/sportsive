// src/app/api/trending/leagues/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [eventsRes, teamsRes, fanhubRes] = await Promise.allSettled([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fanhub/list?sort=latest`),
    ]);

    const safe = async (res: any) =>
      res?.value?.ok ? await res.value.json() : null;

    const events = (await safe(eventsRes))?.events ?? [];
    const teams = (await safe(teamsRes))?.teams ?? [];
    const posts = (await safe(fanhubRes)) ?? [];

    const scores: Record<string, number> = {};

    const add = (name: string | undefined | null, amount: number) => {
      if (!name) return;
      if (!scores[name]) scores[name] = 0;
      scores[name] += amount;
    };

    // 🔥 EVENT 기반 리그 점수
    for (const e of events) {
      add(e.competition, 2); // 경기 존재 = 인기
    }

    // 🔥 TEAM 기반 리그 수집 (소속팀 존재)
    for (const t of teams) {
      add(t.competition, 1);
    }

    // 🔥 FanHub 언급 기반
    for (const p of posts) {
      const text = p.text?.toLowerCase() ?? "";

      for (const league of Object.keys(scores)) {
        if (text.includes(league.toLowerCase())) {
          add(league, 3); // 언급 강함
        }
      }

      if (Array.isArray(p.tags)) {
        for (const league of Object.keys(scores)) {
          if (p.tags.includes(league)) {
            add(league, 4); // 태그는 더 강함
          }
        }
      }
    }

    const trending = Object.entries(scores)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return NextResponse.json(trending);
  } catch (err) {
    console.error("Trending leagues failed:", err);
    return NextResponse.json([], { status: 500 });
  }
}
