// src/app/api/trending/teams/route.ts

import { NextResponse } from "next/server";

function clean(str: string | null | undefined) {
  return (str ?? "")
    .replace(/\b(FC|AFC|CF)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .toLowerCase();
}

// 약칭 → 실제 팀명 매핑
const ALIAS: Record<string, string> = {
  "man utd": "manchester united",
  "man united": "manchester united",
  "manchester utd": "manchester united",

  "man city": "manchester city",
  "manchester city": "manchester city",

  spurs: "tottenham hotspur",
};

function normalizeTeamName(name: string) {
  const key = clean(name);
  return ALIAS[key] ?? key;
}

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL;

    // 1) 팀 목록
    const teamRes = await fetch(`${base}/api/teams`, { cache: "no-store" });
    const { teams: allTeams = [] } = await teamRes.json();

    // nameMap (clean 기준)
    const nameMap: Record<string, { id: string; name: string; logo: string | null }> = {};
    allTeams.forEach((t: any) => {
      const key = clean(t.name);
      nameMap[key] = {
        id: String(t.id),
        name: t.name,
        logo: t.logo,
      };
    });

    // 2) events + fanhub
    const [eventsRes, fanhubRes] = await Promise.allSettled([
      fetch(`${base}/api/events`, { cache: "no-store" }),
      fetch(`${base}/api/fanhub/list?sort=latest`, { cache: "no-store" }),
    ]);

    const safe = async (r: any) => (r?.value?.ok ? r.value.json() : []);

    const events = (await safe(eventsRes)).events ?? [];
    const posts = (await safe(fanhubRes)) ?? [];

    const scores: Record<string, number> = {};

    const add = (raw: string, n: number) => {
      const key = normalizeTeamName(raw);
      if (!key) return;
      scores[key] = (scores[key] || 0) + n;
    };

    // event 기반
    for (const e of events) {
      add(e.homeTeam, 1);
      add(e.awayTeam, 1);
    }

    // fanhub 기반
    for (const p of posts) {
      if (Array.isArray(p.tags)) {
        (p.tags as string[]).forEach((tag) => add(tag, 3));
      }

      const text = p.text?.toLowerCase() ?? "";
      for (const key of Object.keys(nameMap)) {
        if (text.includes(key)) add(key, 2);
      }
    }

    // 결과 구성
    const trending = Object.entries(scores)
      .map(([key, score]) => {
        const mapped = nameMap[key];
        if (!mapped) return null;

        return {
          id: mapped.id,
          name: mapped.name,
          logo: mapped.logo,
          score,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json(trending);
  } catch (e) {
    console.error("❌ trending error:", e);
    return NextResponse.json([], { status: 500 });
  }
}
