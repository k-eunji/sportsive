// src/app/api/trending/teams/route.ts
import { NextRequest, NextResponse } from "next/server";

// 문자열 정리
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

export async function GET(_req: NextRequest) {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL;

    // -------------------------------------------------
    // 1) 팀 목록 가져오기
    // -------------------------------------------------
    const teamRes = await fetch(`${base}/api/teams`, { cache: "no-store" });
    const teamJson = await teamRes.json();
    const allTeams = teamJson?.teams ?? [];

    const nameMap: Record<
      string,
      { id: string; name: string; logo: string | null }
    > = {};

    for (const t of allTeams) {
      const key = clean(t.name);
      nameMap[key] = {
        id: String(t.id),
        name: t.name,
        logo: t.logo ?? null,
      };
    }

    // -------------------------------------------------
    // 2) Events + FanHub 병렬 가져오기
    // -------------------------------------------------
    const [eventsRes, fanhubRes] = await Promise.allSettled([
      fetch(`${base}/api/events`, { cache: "no-store" }),
      fetch(`${base}/api/fanhub/list?sort=latest`, { cache: "no-store" }),
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
    const posts = (await safeJson(fanhubRes)) ?? [];

    // -------------------------------------------------
    // 3) 점수 계산
    // -------------------------------------------------
    const scores: Record<string, number> = {};

    const addScore = (rawTeam: string, amount: number) => {
      const key = normalizeTeamName(rawTeam);
      if (!key) return;
      scores[key] = (scores[key] || 0) + amount;
    };

    // A. Event 기반
    for (const e of events) {
      addScore(e.homeTeam, 1);
      addScore(e.awayTeam, 1);
    }

    // B. FanHub 기반
    for (const p of posts) {
      // 태그 기반
      if (Array.isArray(p.tags)) {
        for (const tag of p.tags as string[]) {
          addScore(tag, 3);
        }
      }

      // 본문 기반
      const text = p.text?.toLowerCase() ?? "";
      for (const key of Object.keys(nameMap)) {
        if (text.includes(key)) {
          addScore(key, 2);
        }
      }
    }

    // -------------------------------------------------
    // 4) 랭킹 구성 후 상위 10개 반환
    // -------------------------------------------------
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
  } catch (err) {
    console.error("❌ trending error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
