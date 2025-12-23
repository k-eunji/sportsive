// src/app/api/trending/teams/route.ts
import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

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

function normalizeTeamName(name: string) {
  const key = clean(name);
  return ALIAS[key] ?? key;
}

// ===============================
// DB
// ===============================
const DB_FILE = path.join(process.cwd(), "sportsive.db");

// ===============================
// GET /api/trending/teams
// ===============================
export async function GET() {
  let db;

  try {
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    });

    // -------------------------------------------------
    // 1) 팀 목록 (DB 직접 조회)
    // -------------------------------------------------
    const teams = await db.all(`
      SELECT
        id,
        name,
        logo_url AS logo
      FROM "2526_england_pl_football_teams"
    `);

    // England National Team 수동 추가
    const allTeams = [
      {
        id: "england",
        name: "England National Football Team",
        logo: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
      },
      ...teams.map((t: any) => ({
        id: String(t.id),
        name: t.name,
        logo: t.logo ?? null,
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
    // 2) Events (외부 API 직접 호출)
    // -------------------------------------------------
    const eventsRes = await fetch(
      "https://api.football-data.org/v4/competitions/PL/matches",
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY!,
        },
        cache: "no-store",
      }
    );

    const eventsJson = eventsRes.ok ? await eventsRes.json() : null;
    const events = eventsJson?.matches ?? [];

    // -------------------------------------------------
    // 3) FanHub (DB 직접 조회)
    // -------------------------------------------------
    const posts = await db.all(`
      SELECT text, tags
      FROM fanhub_posts
      ORDER BY created_at DESC
      LIMIT 100
    `);

    // -------------------------------------------------
    // 4) 점수 계산
    // -------------------------------------------------
    const scores: Record<string, number> = {};

    const addScore = (raw: string, amount: number) => {
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
      // 태그
      try {
        const tags = JSON.parse(p.tags ?? "[]");
        if (Array.isArray(tags)) {
          for (const tag of tags) {
            addScore(tag, 3);
          }
        }
      } catch {}

      // 본문
      const text = (p.text ?? "").toLowerCase();
      for (const key of Object.keys(nameMap)) {
        if (text.includes(key)) {
          addScore(key, 2);
        }
      }
    }

    // -------------------------------------------------
    // 5) 랭킹 상위 10개
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
  } finally {
    if (db) await db.close();
  }
}
