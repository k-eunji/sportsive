// src/app/api/trending/teams/route.ts
import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseServer";

// ===============================
// Utils
// ===============================
function clean(str: string | null | undefined) {
  return (str ?? "")
    .replace(/\b(FC|AFC|CF)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .toLowerCase();
}

const ALIAS: Record<string, string> = {
  "man utd": "manchester united",
  "man united": "manchester united",
  "manchester utd": "manchester united",
  "man city": "manchester city",
  "manchester city": "manchester city",
  spurs: "tottenham hotspur",
};

function normalizeTeamName(name: string | null | undefined) {
  const key = clean(name);
  return ALIAS[key] ?? key;
}

// ===============================
// GET /api/trending/teams
// ===============================
export async function GET() {
  try {
    // -------------------------------------------------
    // 1) 팀 목록 (Supabase)
    // -------------------------------------------------
    const { data: teams, error: teamError } = await supabase
      .from("england_pl_football_teams")
      .select("id, name, logo_url");

    if (teamError || !teams) {
      console.error(teamError);
      return NextResponse.json([]);
    }

    const allTeams = [
      {
        id: "england",
        name: "England National Football Team",
        logo: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
      },
      ...teams.map((t) => ({
        id: String(t.id),
        name: t.name,
        logo: t.logo_url ?? null,
      })),
    ];

    const nameMap: Record<
      string,
      { id: string; name: string; logo: string | null }
    > = {};

    for (const t of allTeams) {
      nameMap[clean(t.name)] = {
        id: t.id,
        name: t.name,
        logo: t.logo,
      };
    }

    // -------------------------------------------------
    // 2) 경기 데이터 (외부 API)
    // -------------------------------------------------
    let events: any[] = [];

    try {
      const eventsRes = await fetch(
        "https://api.football-data.org/v4/competitions/PL/matches",
        {
          headers: {
            "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY!,
          },
          cache: "no-store",
        }
      );

      const json = eventsRes.ok ? await eventsRes.json() : null;
      events = json?.matches ?? [];
    } catch (e) {
      console.warn("⚠️ football-data API failed, skipping events");
    }

    // -------------------------------------------------
    // 3) FanHub (있으면 사용, 없으면 무시)
    // -------------------------------------------------
    let posts: { text: string | null; tags: any }[] = [];

    const { data: fanhubPosts, error: fanhubError } = await supabase
      .from("fanhub_posts")
      .select("text, tags")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!fanhubError && fanhubPosts) {
      posts = fanhubPosts;
    } else {
      console.warn("⚠️ fanhub_posts not available, skipping FanHub");
    }

    // -------------------------------------------------
    // 4) 점수 계산
    // -------------------------------------------------
    const scores: Record<string, number> = {};

    const addScore = (raw: string | null | undefined, amount: number) => {
      const key = normalizeTeamName(raw);
      if (!key) return;
      scores[key] = (scores[key] || 0) + amount;
    };

    // A. 경기 기반
    for (const e of events) {
      addScore(e.homeTeam?.name, 1);
      addScore(e.awayTeam?.name, 1);
    }

    // B. FanHub 기반
    for (const p of posts) {
      // tags
      try {
        const tags = Array.isArray(p.tags) ? p.tags : JSON.parse(p.tags ?? "[]");
        if (Array.isArray(tags)) {
          for (const tag of tags) {
            addScore(tag, 3);
          }
        }
      } catch {}

      // text
      const text = (p.text ?? "").toLowerCase();
      for (const key of Object.keys(nameMap)) {
        if (text.includes(key)) {
          addScore(key, 2);
        }
      }
    }

    // -------------------------------------------------
    // 5) 상위 10개 반환
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
    return NextResponse.json([]);
  }
}
