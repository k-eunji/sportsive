// src/app/api/trending/local/teams/route.ts

import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const city = clean(url.searchParams.get("city"));

  if (!city) return NextResponse.json([], { status: 400 });

  let db;
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

    const teams = rawTeams.map((t: any) => ({
      id: String(t.id),
      name: t.name,
      logo: t.logo || null,
      city: clean(t.city),
    }));

    const filtered = teams.filter((t) => t.city === city);

    return NextResponse.json(filtered);
  } catch (e) {
    console.error("local trending error:", e);
    return NextResponse.json([], { status: 500 });
  }
}
