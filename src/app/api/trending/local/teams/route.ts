// src/app/api/trending/local/teams/route.ts
import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

function clean(str: string | null | undefined) {
  return (str ?? "")
    .replace(/\b(FC|AFC|CF)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .toLowerCase();
}

// 🟢 타입 명시
interface Team {
  id: string;
  name: string;
  logo: string | null;
  city: string;
}

export async function GET(req: NextRequest) {
  const city = clean(req.nextUrl.searchParams.get("city"));
  if (!city) return NextResponse.json([], { status: 400 });

  let db: any;

  try {
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    const rawTeams = await db.all(`
      SELECT 
        id,
        name,
        city,
        logo_url AS logo
      FROM "2526_england_pl_football_teams"
    `);

    // 🟢 배열의 Element 타입 지정
    const teams: Team[] = rawTeams.map((t: any) => ({
      id: String(t.id),
      name: t.name,
      logo: t.logo ?? null,
      city: clean(t.city),
    }));

    // 🟢 타입 에러 없음
    const filtered = teams.filter((t) => t.city === city);

    return NextResponse.json(filtered);
  } catch (err) {
    console.error("❌ Local trending teams error:", err);
    return NextResponse.json([], { status: 500 });
  } finally {
    if (db) await db.close();
  }
}
