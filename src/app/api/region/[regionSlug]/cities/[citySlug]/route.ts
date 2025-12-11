// src/app/api/region/[regionSlug]/cities/[citySlug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

interface RouteParams {
  params: { regionSlug: string; citySlug: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { regionSlug, citySlug } = params;
  let db: any;

  try {
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    // 도시 정보 + 소속 지역 정보
    const city = await db.get(
      `
      SELECT 
        c.id,
        c.name,
        c.slug,
        r.name AS region_name,
        r.slug AS region_slug
      FROM cities c
      JOIN regions r ON c.region_id = r.id
      WHERE r.slug = ? AND c.slug = ?
      `,
      [regionSlug, citySlug]
    );

    if (!city) {
      return NextResponse.json({ city: null }, { status: 404 });
    }

    // 해당 도시의 팀 목록
    const teams = await db.all(
      `
      SELECT 
        id,
        name,
        logo_url AS logo
      FROM "2526_england_pl_football_teams"
      WHERE city = ?
      `,
      [city.name]
    );

    // 해당 도시의 경기 이벤트 목록
    const events = await db.all(
      `
      SELECT 
        id,
        home_team,
        away_team,
        date,
        venue
      FROM events
      WHERE city = ?
      ORDER BY date ASC
      `,
      [city.name]
    );

    return NextResponse.json({ city, teams, events });
  } catch (err) {
    console.error("❌ [City API Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch city" },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}
